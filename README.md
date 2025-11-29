# Company Name Cleaning (CC) - POC

This project is a Proof of Concept (POC) for automatically extracting company details from KYC documents (GST, PAN, FSSAI, etc.) using Google Gemini Flash (Vision LLM).

## Features
*   **Multi-Format Support**: Handles PDF (single & multi-page) and Images (JPG, PNG).
*   **Intelligent Extraction**: Uses Gemini 2.5 Flash to extract:
    *   Company Name (Legal vs Trade Name)
    *   Address (Bifurcated into Line 1, Locality, City, State, Pincode)
    *   Identification Numbers (GSTIN, PAN, etc.)
    *   Dates & Approver Names
*   **Confidence Scoring**: Returns a confidence score (0-1) and a reason for the score.
*   **API**: Fast, async-ready API built with FastAPI.

## Prerequisites
*   Python 3.10+
*   `poppler-utils` (for PDF processing)
    *   Ubuntu: `sudo apt-get install poppler-utils`
    *   Mac: `brew install poppler`
*   Google Gemini API Key

## Setup

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd cc-poc
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    GOOGLE_API_KEY=your_actual_api_key_here
    ```

## Usage

### Running the API Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing the API
You can use the provided test script:
```bash
python scripts/test_api.py /path/to/document.pdf
```

Or use `curl`:
```bash
curl -X POST "http://localhost:8000/extract" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@/path/to/document.pdf"
```

## Project Structure
*   `app/`: Core application code.
    *   `main.py`: API endpoints.
    *   `core/`: Config, Gemini client, and Prompts.
    *   `services/`: Image processing logic.
    *   `schemas.py`: Pydantic data models.
*   `docs/`: Documentation (PRD, Tech Doc, Plans).
*   `scripts/`: Utility scripts for testing.

## Docker Support
Build and run with Docker Compose:
```bash
docker-compose up --build
```
