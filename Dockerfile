FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for pdf2image (poppler)
RUN apt-get update && apt-get install -y \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "kyc_extractor.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
