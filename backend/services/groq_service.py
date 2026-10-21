import json
import base64
import re
from typing import Optional, Dict, Any
from fastapi import HTTPException
from groq import Groq, APIConnectionError, RateLimitError, AuthenticationError, BadRequestError
from backend.config import settings

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.vision_model = settings.GROQ_VISION_MODEL
        self.text_model = settings.GROQ_TEXT_MODEL
        self.audio_model = settings.GROQ_AUDIO_MODEL
        self._client: Optional[Groq] = None

    @property
    def client(self) -> Groq:
        if not self.is_configured():
            raise HTTPException(
                status_code=503,
                detail="Groq API key is not configured. Please set GROQ_API_KEY in your .env file to enable AI analysis."
            )
        if self._client is None:
            self._client = Groq(api_key=self.api_key)
        return self._client

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and self.api_key != "your_groq_api_key_here")

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """
        Extracts valid JSON object from model response, handling markdown fences or leading/trailing text.
        """
        text = text.strip()
        # Direct parse attempt
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Check for markdown code fences ```json ... ``` or ``` ... ```
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if fence_match:
            try:
                return json.loads(fence_match.group(1).strip())
            except json.JSONDecodeError:
                pass

        # Search for first { to last }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end+1])
            except json.JSONDecodeError:
                pass

        raise HTTPException(
            status_code=502,
            detail="AI model returned an unparseable response. Expected structured JSON."
        )

    def _handle_groq_error(self, err: Exception) -> None:
        """
        Maps Groq exceptions to appropriate HTTPExceptions.
        """
        if isinstance(err, AuthenticationError):
            raise HTTPException(
                status_code=401,
                detail="Groq authentication failed. Please verify your GROQ_API_KEY in .env."
            )
        elif isinstance(err, RateLimitError):
            raise HTTPException(
                status_code=429,
                detail="Groq API rate limit exceeded. Please wait a moment and try again."
            )
        elif isinstance(err, APIConnectionError):
            raise HTTPException(
                status_code=503,
                detail="Could not connect to Groq AI service. Please check network connectivity."
            )
        elif isinstance(err, BadRequestError):
            raise HTTPException(
                status_code=400,
                detail=f"Groq API Bad Request: {str(err)}"
            )
        elif isinstance(err, HTTPException):
            raise err
        else:
            raise HTTPException(
                status_code=500,
                detail=f"AI inference error: {str(err)}"
            )

    async def analyze_image(
        self,
        image_bytes: bytes,
        mime_type: str,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyzes an image using Groq Vision model and returns parsed JSON.
        """
        client = self.client
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:{mime_type};base64,{b64_image}"

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": data_url}}
            ]
        })

        try:
            response = client.chat.completions.create(
                model=self.vision_model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=2048,
            )
            raw_content = response.choices[0].message.content or "{}"
            return self._extract_json(raw_content)
        except Exception as e:
            self._handle_groq_error(e)

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates structured JSON using Groq text model.
        """
        client = self.client
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        messages.append({"role": "user", "content": prompt})

        try:
            response = client.chat.completions.create(
                model=self.text_model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=3072,
            )
            raw_content = response.choices[0].message.content or "{}"
            return self._extract_json(raw_content)
        except Exception as e:
            self._handle_groq_error(e)

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "voice_input.webm") -> str:
        """
        Transcribes audio using Groq Whisper model.
        """
        if not self.is_configured():
            return ""
        
        try:
            client = self.client
            transcription = client.audio.transcriptions.create(
                file=(filename, audio_bytes),
                model=self.audio_model,
                response_format="text"
            )
            if isinstance(transcription, str):
                return transcription.strip()
            return getattr(transcription, "text", "").strip()
        except Exception as e:
            # Non-fatal for audio context
            print(f"Warning: Audio transcription failed: {e}")
            return ""

groq_service = GroqService()
