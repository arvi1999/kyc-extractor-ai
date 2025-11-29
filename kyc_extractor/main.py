from fastapi import FastAPI, UploadFile, File, HTTPException
from kyc_extractor.schemas import ExtractionResponse
from kyc_extractor.services.image_processor import image_processor
from kyc_extractor.core.gemini import gemini_client
import time

app = FastAPI(title="Company Name Cleaning (CC) API", version="0.1.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to Company Name Cleaning (CC) API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/extract", response_model=ExtractionResponse)
async def extract_document(file: UploadFile = File(...)):
    """
    Extracts company details from an uploaded document (PDF or Image).
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is missing")

    start_time = time.time()
    try:
        # Read file content
        content = await file.read()
        
        # Process Image (Convert PDF -> Img / Load Img)
        image = image_processor.process_file(content, file.filename)
        
        # Extract Data using Gemini
        result = gemini_client.extract_data(image)
        
        if "error" in result:
             raise HTTPException(status_code=500, detail=f"Extraction failed: {result['error']}")

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        await file.close()

