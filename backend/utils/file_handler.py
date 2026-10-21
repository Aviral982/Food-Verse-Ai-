import os
import uuid
import tempfile
from pathlib import Path
from typing import Set, Tuple
from fastapi import UploadFile, HTTPException
from backend.config import settings

ALLOWED_IMAGE_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
ALLOWED_VIDEO_EXTENSIONS: Set[str] = {".mp4", ".mov", ".avi", ".webm"}
ALLOWED_AUDIO_EXTENSIONS: Set[str] = {".wav", ".mp3", ".m4a", ".ogg", ".webm"}

ALLOWED_IMAGE_MIMES: Set[str] = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/jpg"
}

ALLOWED_VIDEO_MIMES: Set[str] = {
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm"
}

ALLOWED_AUDIO_MIMES: Set[str] = {
    "audio/wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/x-m4a",
    "audio/ogg",
    "audio/webm"
}


async def validate_and_read_image(file: UploadFile) -> Tuple[bytes, str]:
    """
    Validates uploaded image file and returns its bytes and mime type.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No image file provided.")
    
    filename = file.filename or "upload.jpg"
    ext = Path(filename).suffix.lower()
    
    if ext not in ALLOWED_IMAGE_EXTENSIONS and file.content_type not in ALLOWED_IMAGE_MIMES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: '{ext or file.content_type}'. Allowed types: JPG, PNG, WEBP, HEIC."
        )
    
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty.")
    
    if len(content) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image file exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )
    
    mime_type = file.content_type or ("image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png")
    return content, mime_type


async def validate_and_read_file(file: UploadFile, allowed_types: str = "image_or_video") -> Tuple[bytes, str, str]:
    """
    Validates image or video file and returns (bytes, mime_type, file_category).
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided.")
    
    filename = file.filename or "upload.bin"
    ext = Path(filename).suffix.lower()
    content_type = file.content_type or ""
    
    is_image = ext in ALLOWED_IMAGE_EXTENSIONS or content_type in ALLOWED_IMAGE_MIMES
    is_video = ext in ALLOWED_VIDEO_EXTENSIONS or content_type in ALLOWED_VIDEO_MIMES
    
    if allowed_types == "image" and not is_image:
        raise HTTPException(status_code=400, detail="Please upload a valid image (JPG, PNG, WEBP).")
    elif allowed_types == "video" and not is_video:
        raise HTTPException(status_code=400, detail="Please upload a valid video (MP4, MOV, WEBM).")
    elif allowed_types == "image_or_video" and not (is_image or is_video):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext or content_type}'. Please upload an image or video file."
        )
    
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
    if len(content) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )
    
    category = "video" if is_video else "image"
    mime_type = content_type or ("video/mp4" if is_video else "image/jpeg")
    return content, mime_type, category


async def save_temp_file(content: bytes, prefix: str = "foodverse_", suffix: str = ".tmp") -> str:
    """
    Safely writes content to a temporary file and returns its path.
    """
    fd, path = tempfile.mkstemp(prefix=f"{prefix}_{uuid.uuid4().hex[:8]}_", suffix=suffix)
    with os.fdopen(fd, "wb") as f:
        f.write(content)
    return path


def safe_delete_file(path: str) -> None:
    """
    Safely deletes a file if it exists.
    """
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except Exception:
        pass
