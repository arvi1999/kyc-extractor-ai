import google.generativeai as genai
from PIL import Image
import json
from app.core.config import settings
from app.core.prompts import EXTRACTION_PROMPT

class GeminiClient:
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            print("Warning: GOOGLE_API_KEY not found in environment variables.")
        
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL_NAME)

    def extract_data(self, image: Image.Image) -> dict:
        """
        Sends the image to Gemini Flash and returns the extracted JSON.
        """
        try:
            response = self.model.generate_content([EXTRACTION_PROMPT, image])
            
            # Basic cleanup to ensure JSON is parsed correctly
            text_response = response.text.strip()
            
            # Remove markdown code blocks if present
            if text_response.startswith("```json"):
                text_response = text_response[7:]
            if text_response.endswith("```"):
                text_response = text_response[:-3]
            
            return json.loads(text_response.strip())
            
        except Exception as e:
            print(f"Error during Gemini extraction: {e}")
            return {"error": str(e), "status": "failed"}

gemini_client = GeminiClient()
