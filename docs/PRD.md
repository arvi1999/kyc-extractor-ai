# Product Requirements Document (PRD) - Company Name Cleaning (CC)

## 1. Introduction
**Project Name:** Company Name Cleaning (CC)
**Objective:** Automate the extraction of company details from various KYC documents to resolve name mismatches and verify authenticity, reducing manual verification effort.

## 2. Problem Statement
Recruiters upload various KYC documents where the self-declared company name often mismatches the name on the document. This leads to verification failures and operational bottlenecks. Manual verification is time-consuming and error-prone. Additionally, address verification for GST payments is a pain point.

## 3. Scope
**In Scope:**
- Extraction of key fields from supported documents.
- Handling of multiple input formats (PDF, Images, Links).
- Outputting structured JSON data.
- POC implementation for ~10 docs/day, scalable design for ~1000 docs/day.

**Out of Scope (for now):**
- Full integration into the main recruitment platform (API endpoint will be provided, but integration logic is separate).
- Real-time user feedback UI (backend focus).

## 4. User Requirements
### 4.1 Supported Documents
The system must support parsing of:
1.  **GST Certificate**
2.  **Company PAN Card**
3.  **FSSAI License**
4.  **Incorporation Certificate**
5.  **MSME Certificate**
6.  **Shop & Establishment Act**

### 4.2 Input Specifications
- **Formats:** PDF, JPEG, PNG.
- **Source:** Direct file upload or URL link.
- **Quality:** Must handle scanned images (OCR required).

### 4.3 Output Specifications
- **Format:** JSON.
- **Key Fields to Extract:**
    - Company Name (Legal Name)
    - Trade Name (if available)
    - Address (Registered/Business)
    - Identification Number (PAN, GSTIN, CIN, etc.)
    - Date of Issue / Incorporation
    - Approver/Signatory Name (if available)
    - Document Type (Classified)

## 5. Functional Requirements
1.  **Document Ingestion:** Accept file or URL.
2.  **Preprocessing:** Convert formats, handle rotation/noise if necessary.
3.  **Classification:** Identify which of the 6 document types it is.
4.  **Extraction:** Extract specific fields based on document type.
5.  **Validation:** Basic format checks (e.g., PAN regex, GSTIN regex).
6.  **Response:** Return JSON with extracted data and confidence scores (if applicable).

## 6. Non-Functional Requirements
- **Accuracy:** High accuracy for Company Name and ID numbers.
- **Latency:** Acceptable for background processing (near real-time preferred).
- **Scalability:** Design for 1000/day, POC for 10/day.
- **Security:** Data privacy for KYC documents (ephemeral processing preferred).

## 7. Success Metrics
- Reduction in manual verification time.
- % of documents successfully auto-extracted.
- Accuracy rate of "Company Name" extraction.
