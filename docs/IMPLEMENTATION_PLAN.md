# Implementation Plan - Company Name Cleaning (CC)

This document outlines the step-by-step plan for building the CC POC.
**Rule:** Each task must be approved by the user before starting.

## Phase 1: Foundation & Setup
- [x] **Task 1.1: Project Initialization**
    - Initialize Git repository.
    - Create directory structure (`app/`, `docs/`, `tests/`).
    - Set up `requirements.txt` (FastAPI, Uvicorn, Google-GenerativeAI, Pillow, PDF2Image).
    - Create `Dockerfile` and `docker-compose.yml`.
    - **Deliverable:** Runnable "Hello World" FastAPI app in Docker.

## Phase 2: Core Logic Implementation
- [x] **Task 2.1: Gemini Client & Prompt Engineering**
    - Set up Google Gemini Flash client.
    - Design and test the System Prompt for extracting Company Name, Address (bifurcated), IDs, etc.
    - Create a standalone script to test extraction on a local image.
    - **Deliverable:** Python script that takes an image path and prints JSON output from Gemini.

- [ ] **Task 2.2: Image Pre-processing Service**
    - Implement `ImageProcessor` class.
    - Add support for PDF to Image conversion (using `pdf2image`).
    - Add basic resizing/optimization to ensure images fit within token limits/bandwidth.
    - **Deliverable:** Service that accepts PDF/Image bytes and returns a PIL Image ready for the LLM.

## Phase 3: API Development
- [ ] **Task 3.1: API Endpoint (`POST /extract`)**
    - Create Pydantic models for the Response (including the bifurcated Address model).
    - Implement the endpoint logic: Upload -> Pre-process -> Call Gemini -> Return JSON.
    - Handle errors (Invalid file, API failure).
    - **Deliverable:** Working API endpoint that accepts a file upload and returns the extracted JSON.

## Phase 4: Verification & Polish
- [ ] **Task 4.1: Testing & Validation**
    - Run manual tests with sample documents (GST, PAN, etc.).
    - Verify "Confidence Score" logic.
    - Verify Address bifurcation accuracy.
    - **Deliverable:** Test report and finalized code.

## Phase 5: Documentation & Handoff
- [ ] **Task 5.1: Final Documentation**
    - Update README with setup instructions.
    - Document API usage (Swagger/OpenAPI).
    - **Deliverable:** Complete project ready for handover.
