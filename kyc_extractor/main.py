from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Query
from kyc_extractor.schemas import ExtractionResponse, HistoryResponse, BatchExtractionResponse
from kyc_extractor.services.image_processor import image_processor
from kyc_extractor.core.gemini import gemini_client
from kyc_extractor.db.database import get_db
from kyc_extractor.db import crud
from kyc_extractor.db.models import User
from kyc_extractor.validators import validate_extraction, calculate_data_quality_score, get_quality_grade
from kyc_extractor.api.auth import router as auth_router
from kyc_extractor.api.stats import router as stats_router
from kyc_extractor.api.deps import get_current_user, get_current_active_user
from sqlalchemy.orm import Session
import time
import uuid
from datetime import datetime
from typing import Optional, List

app = FastAPI(title="Company Name Cleaning (CC) API", version="0.3.0")

# Include Auth Router
app.include_router(auth_router, tags=["Authentication"])
app.include_router(stats_router, prefix="/stats", tags=["Statistics"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Company Name Cleaning (CC) API", "version": "0.3.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/extract", response_model=ExtractionResponse)
async def extract_document(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Extracts company details from an uploaded document (PDF or Image).
    Protected: Requires valid JWT token.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is missing")

    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Process Image (Convert PDF -> Img / Load Img)
        image = image_processor.process_file(content, file.filename)
        
        # Extract Data using Gemini
        result = gemini_client.extract_data(image)
        
        if "error" in result:
             raise HTTPException(status_code=500, detail=f"Extraction failed: {result['error']}")

        # Run validation
        document_type = result.get('document_type', 'OTHER')
        identification_number = result.get('data', {}).get('identification_number')
        address = result.get('data', {}).get('address', {})
        pincode = address.get('pincode') if isinstance(address, dict) else None
        
        validation_results = validate_extraction(
            document_type=document_type,
            identification_number=identification_number,
            pincode=pincode
        )
        
        # Calculate quality score
        confidence = result.get('confidence', 0.0)
        data_quality_score = calculate_data_quality_score(
            extracted_data=result.get('data', {}),
            validation_results=validation_results,
            confidence=confidence
        )
        quality_grade = get_quality_grade(data_quality_score)
        
        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        
            # Save to database
        db_data = {
            "request_id": request_id,
            "user_id": current_user.id,
            "filename": file.filename,
            "file_size_bytes": file_size,
            "document_type": document_type,
            "company_name": result.get('data', {}).get('company_name'),
            "trade_name": result.get('data', {}).get('trade_name'),
            "identification_number": identification_number,
            "address_json": address,
            "issue_date": result.get('data', {}).get('issue_date'),
            "approver_name": result.get('data', {}).get('approver_name'),
            "confidence": confidence,
            "confidence_reason": result.get('confidence_reason'),
            "data_quality_score": data_quality_score,
            "validation_results": validation_results,
            "processing_time_ms": processing_time_ms,
        }
        
        db_extraction = crud.create_extraction(db, db_data)
        
        # Prepare response
        result['request_id'] = request_id
        result['validation_results'] = validation_results
        result['data_quality_score'] = data_quality_score
        result['quality_grade'] = quality_grade
        result['processing_time_ms'] = processing_time_ms
        result['uploaded_at'] = db_extraction.uploaded_at

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        await file.close()

@app.post("/extract/batch", response_model=BatchExtractionResponse)
async def extract_batch(
    files: List[UploadFile] = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Extracts details from multiple documents in a single request.
    Protected: Requires valid JWT token.
    """
    MAX_BATCH_SIZE = 10
    if len(files) > MAX_BATCH_SIZE:
        raise HTTPException(status_code=400, detail=f"Batch size exceeds limit of {MAX_BATCH_SIZE} files")

    results = []
    errors = []
    
    for file in files:
        try:
            # Reuse the logic from extract_document (refactored for reusability would be better, but keeping it simple for now)
            # We need to process each file sequentially
            
            if not file.filename:
                errors.append({"filename": "unknown", "error": "Filename missing"})
                continue
                
            start_time = time.time()
            request_id = str(uuid.uuid4())
            
            # Read file content
            content = await file.read()
            file_size = len(content)
            
            # Process Image
            image = image_processor.process_file(content, file.filename)
            
            # Extract Data
            result = gemini_client.extract_data(image)
            
            if "error" in result:
                errors.append({"filename": file.filename, "error": result['error']})
                continue

            # Validation
            document_type = result.get('document_type', 'OTHER')
            identification_number = result.get('data', {}).get('identification_number')
            address = result.get('data', {}).get('address', {})
            pincode = address.get('pincode') if isinstance(address, dict) else None
            
            validation_results = validate_extraction(
                document_type=document_type,
                identification_number=identification_number,
                pincode=pincode
            )
            
            # Scoring
            confidence = result.get('confidence', 0.0)
            data_quality_score = calculate_data_quality_score(
                extracted_data=result.get('data', {}),
                validation_results=validation_results,
                confidence=confidence
            )
            quality_grade = get_quality_grade(data_quality_score)
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            # Save to DB
            db_data = {
                "request_id": request_id,
                "user_id": current_user.id,
                "filename": file.filename,
                "file_size_bytes": file_size,
                "document_type": document_type,
                "company_name": result.get('data', {}).get('company_name'),
                "trade_name": result.get('data', {}).get('trade_name'),
                "identification_number": identification_number,
                "address_json": address,
                "issue_date": result.get('data', {}).get('issue_date'),
                "approver_name": result.get('data', {}).get('approver_name'),
                "confidence": confidence,
                "confidence_reason": result.get('confidence_reason'),
                "data_quality_score": data_quality_score,
                "validation_results": validation_results,
                "processing_time_ms": processing_time_ms,
            }
            
            db_extraction = crud.create_extraction(db, db_data)
            
            # Prepare result object
            result['request_id'] = request_id
            result['validation_results'] = validation_results
            result['data_quality_score'] = data_quality_score
            result['quality_grade'] = quality_grade
            result['processing_time_ms'] = processing_time_ms
            result['uploaded_at'] = db_extraction.uploaded_at
            
            results.append(result)
            
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})
        finally:
            await file.close()
            
    return BatchExtractionResponse(
        total_processed=len(files),
        successful=len(results),
        failed=len(errors),
        results=results,
        errors=errors
    )

@app.get("/extract/{request_id}", response_model=ExtractionResponse)
def get_extraction(
    request_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve a specific extraction by request_id
    """
    extraction = crud.get_extraction_by_request_id(db, request_id, user_id=current_user.id, role=current_user.role)
    if not extraction:
        raise HTTPException(status_code=404, detail="Extraction not found")
    
    # Convert DB model to response format
    return ExtractionResponse(
        request_id=extraction.request_id,
        document_type=extraction.document_type or "OTHER",
        data={
            "company_name": extraction.company_name,
            "trade_name": extraction.trade_name,
            "identification_number": extraction.identification_number,
            "address": extraction.address_json,
            "issue_date": extraction.issue_date,
            "approver_name": extraction.approver_name
        },
        confidence=extraction.confidence or 0.0,
        confidence_reason=extraction.confidence_reason,
        validation_results=extraction.validation_results,
        data_quality_score=extraction.data_quality_score,
        quality_grade=get_quality_grade(extraction.data_quality_score or 0),
        processing_time_ms=extraction.processing_time_ms,
        uploaded_at=extraction.uploaded_at
    )

@app.get("/history", response_model=HistoryResponse)
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    document_type: Optional[str] = None,
    days_ago: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get extraction history with optional filters
    """
    extractions = crud.get_extractions_history(
        db=db,
        skip=skip,
        limit=limit,
        document_type=document_type,
        days_ago=days_ago,
        user_id=current_user.id,
        role=current_user.role
    )
    
    items = []
    for ext in extractions:
        items.append(ExtractionResponse(
            request_id=ext.request_id,
            document_type=ext.document_type or "OTHER",
            data={
                "company_name": ext.company_name,
                "trade_name": ext.trade_name,
                "identification_number": ext.identification_number,
                "address": ext.address_json,
                "issue_date": ext.issue_date,
                "approver_name": ext.approver_name
            },
            confidence=ext.confidence or 0.0,
            confidence_reason=ext.confidence_reason,
            validation_results=ext.validation_results,
            data_quality_score=ext.data_quality_score,
            quality_grade=get_quality_grade(ext.data_quality_score or 0),
            processing_time_ms=ext.processing_time_ms,
            uploaded_at=ext.uploaded_at
        ))
    
    return HistoryResponse(total=len(items), items=items)

