# Phase 1 Implementation Plan - v0.2.0

**Goal:** Add production-ready features to make the KYC Extractor more robust and scalable.

---

## Features Overview

### 1. **Validation & Data Scoring** ✅
- Validate extracted IDs (GSTIN, PAN, CIN) using regex
- Calculate a "data_quality_score" (0-100)
- Add validation results to API response

### 2. **MySQL Database Integration** 🗄️
- Store all extraction requests and results
- Track extraction history
- Enable audit trails
- Add `GET /history` endpoint

### 3. **Batch Processing** 📦
- `POST /extract/batch` - Process multiple documents at once
- Return array of results
- Async processing if needed

---

## Database Schema Design (MySQL)

### Table: `extractions`
```sql
CREATE TABLE extractions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Request metadata
    request_id VARCHAR(36) UNIQUE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size_bytes INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Extraction results
    document_type VARCHAR(50),
    company_name VARCHAR(255),
    trade_name VARCHAR(255),
    identification_number VARCHAR(50),
    
    -- Address (JSON or separate columns - we'll use JSON for flexibility)
    address_json JSON,
    
    issue_date DATE,
    approver_name VARCHAR(255),
    
    -- Quality metrics
    confidence FLOAT,
    confidence_reason TEXT,
    data_quality_score INT,
    
    -- Validation results (JSON)
    validation_results JSON,
    
    -- Processing metadata
    processing_time_ms INT,
    api_version VARCHAR(10) DEFAULT 'v0.2.0',
    
    INDEX idx_request_id (request_id),
    INDEX idx_uploaded_at (uploaded_at),
    INDEX idx_document_type (document_type)
);
```

---

## Implementation Tasks

### **Task 1: Setup MySQL Integration**
- [ ] Add `mysql-connector-python` or `sqlalchemy` + `pymysql` to requirements
- [ ] Create `kyc_extractor/db/` directory
- [ ] Add `database.py` (SQLAlchemy setup)
- [ ] Add `models.py` (Extraction model)
- [ ] Add `crud.py` (CRUD operations)
- [ ] Create database initialization script
- [ ] Update `.env` with MySQL credentials

**Deliverable:** Database connection and models ready.

---

### **Task 2: Add Validation Logic**
- [ ] Create `kyc_extractor/validators/` directory
- [ ] Add `validators.py`:
  - GSTIN validation: `^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$`
  - PAN validation: `^[A-Z]{5}\d{4}[A-Z]{1}$`
  - CIN validation: `^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$`
  - Pincode validation: `^\d{6}$`
- [ ] Add `scoring.py`:
  - Calculate data quality score based on:
    - Field completeness (how many fields are populated)
    - Format validity (regex match)
    - Confidence score from LLM
- [ ] Update response schema to include validation results

**Deliverable:** Validation and scoring functions.

---

### **Task 3: Update API to Use Database**
- [ ] Modify `POST /extract` endpoint:
  - Generate unique `request_id` (UUID)
  - Save request to database BEFORE processing
  - Update database with results AFTER extraction
  - Return `request_id` in response
- [ ] Add `GET /history` endpoint:
  - Query recent extractions
  - Pagination support (limit, offset)
  - Filter by date range, document type
- [ ] Add `GET /extract/{request_id}` endpoint:
  - Retrieve a specific extraction by ID

**Deliverable:** API endpoints connected to database.

---

### **Task 4: Batch Processing**
- [ ] Add `POST /extract/batch` endpoint:
  - Accept list of files
  - Process each sequentially (parallel can be added later)
  - Return array of results with individual `request_id`s
  - Store each result in database
- [ ] Add batch size limit (e.g., max 10 files per request)
- [ ] Add proper error handling (partial success)

**Deliverable:** Working batch API.

---

### **Task 5: Testing & Documentation**
- [ ] Test with sample documents
- [ ] Verify database storage
- [ ] Test validation logic
- [ ] Test batch endpoint
- [ ] Update README with new endpoints
- [ ] Update API documentation (Swagger auto-docs)
- [ ] Create migration guide from v0.1.0 to v0.2.0

**Deliverable:** Tested and documented v0.2.0.

---

## Tech Stack Additions

**New Dependencies:**
```txt
sqlalchemy==2.0.23
pymysql==1.1.0
pydantic-settings==2.0.3
```

**Environment Variables (.env):**
```env
# Existing
GOOGLE_API_KEY=xxx

# New for v0.2.0
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=kyc_extractor
```

---

## API Endpoints (v0.2.0)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/extract` | Extract from single document (now saves to DB) |
| POST | `/extract/batch` | Extract from multiple documents |
| GET | `/history` | Get extraction history (paginated) |
| GET | `/extract/{request_id}` | Get specific extraction by ID |
| GET | `/health` | Health check |

---

## Success Metrics

- ✅ All extractions stored in MySQL
- ✅ Validation accuracy: >95% for known ID formats
- ✅ Batch processing: Successfully process 10 documents
- ✅ Database query response time: <100ms

---

## Timeline Estimate

- **Task 1 (DB Setup):** 2-3 hours
- **Task 2 (Validation):** 1-2 hours
- **Task 3 (API Updates):** 2-3 hours
- **Task 4 (Batch):** 1-2 hours
- **Task 5 (Testing):** 1-2 hours

**Total:** ~8-12 hours of development

---

**Ready to start? We'll go task by task, and I'll get your approval before moving to the next one.**
