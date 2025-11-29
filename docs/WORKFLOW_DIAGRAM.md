# System Workflow Diagrams

## 1. POC Workflow (Synchronous)
This flow is designed for simplicity and immediate feedback, suitable for the initial Proof of Concept (10 docs/day).

```mermaid
sequenceDiagram
    participant User as User/Client
    participant API as FastAPI Backend
    participant Processor as Image Processor
    participant LLM as Gemini Flash API

    User->>API: POST /extract (File/URL)
    activate API
    API->>API: Validate Input
    
    rect rgb(240, 248, 255)
    Note right of API: Pre-processing
    API->>Processor: Convert/Resize Image
    Processor-->>API: Optimized Image
    end

    rect rgb(255, 240, 245)
    Note right of API: Extraction
    API->>LLM: Send Image + Prompt
    LLM-->>API: JSON Response (Extracted Data + Confidence)
    end

    API->>API: Validate & Format Response
    API-->>User: Return JSON Result
    deactivate API
```

## 2. Production Workflow (Asynchronous)
This flow is designed for high volume (1000+ docs/day) to prevent timeouts and handle spikes.

```mermaid
sequenceDiagram
    participant User as User/Client
    participant API as FastAPI Backend
    participant Queue as Task Queue (Redis)
    participant Worker as Background Worker
    participant LLM as Gemini Flash API
    participant DB as Database

    User->>API: POST /extract (File)
    API->>Queue: Enqueue Job
    API-->>User: Return {job_id}
    
    loop Background Processing
        Worker->>Queue: Pop Job
        Worker->>LLM: Send Image + Prompt
        LLM-->>Worker: JSON Response
        Worker->>DB: Save Result (status=COMPLETED)
    end

    User->>API: GET /status/{job_id}
    API->>DB: Fetch Result
    API-->>User: Return JSON Result
```
