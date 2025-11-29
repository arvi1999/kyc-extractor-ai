# Release v0.1.0 - Initial POC

**Company Name Cleaning (CC) - Proof of Concept**

This is the first release of the KYC Extraction AI.

## 🚀 Features
*   **Automated Extraction**: Extracts Company Name, Address, IDs, and Dates from KYC documents.
*   **Multi-Format**: Supports PDF (including multi-page stitching) and Images (JPG/PNG).
*   **AI-Powered**: Uses Google Gemini 2.5 Flash for high accuracy.
*   **Structured Output**: Returns validated JSON with bifurcated addresses.
*   **Confidence Scoring**: Self-assessed confidence score with reasoning.

## 🛠 Tech Stack
*   Python 3.10
*   FastAPI
*   Google Gemini API
*   Docker

## 📦 Installation
1.  Clone the repo.
2.  Set `GOOGLE_API_KEY` in `.env`.
3.  Run `docker-compose up`.
