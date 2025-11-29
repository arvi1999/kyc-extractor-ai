from fastapi import FastAPI

app = FastAPI(title="Company Name Cleaning (CC) API", version="0.1.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to Company Name Cleaning (CC) API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
