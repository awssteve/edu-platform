"""
File Upload Download Module
文件上传下载模块
功能：上传课件、下载课件、文件管理
"""

from fastapi import APIRouter, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for files
files_db = {}
next_file_id = 1

# Simple database for file chunks (for large files)
file_chunks_db = {}
next_chunk_id = 1

class FileMetadata(BaseModel):
    filename: str
    filesize: int
    filetype: str
    mimetype: str
    course_id: Optional[int] = None
    description: Optional[str] = None

class FileResponse(BaseModel):
    id: int
    original_filename: str
    stored_filename: str
    filepath: str
    filesize: int
    filetype: str
    mimetype: str
    course_id: Optional[int]
    description: Optional[str]
    download_count: int
    upload_date: str

@router.post("/files/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile,
    course_id: Optional[int] = None,
    description: Optional[str] = None
):
    global next_file_id
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Simple file storage (in-memory for testing)
    file_content = await file.read()
    file_size = len(file_content)
    
    # Create file metadata
    new_file = {
        "id": next_file_id,
        "original_filename": file.filename,
        "stored_filename": unique_filename,
        "filepath": f"/uploads/{unique_filename}",  # Mock filepath
        "filesize": file_size,
        "filetype": file_extension.lstrip('.').lower(),
        "mimetype": file.content_type,
        "course_id": course_id,
        "description": description,
        "download_count": 0,
        "upload_date": datetime.now().isoformat(),
        "file_content": file_content  # Store content (only for testing)
    }
    
    files_db[next_file_id] = new_file
    next_file_id += 1
    
    return FileResponse(**new_file)

@router.get("/files", response_model=List[FileResponse])
def list_files(
    course_id: Optional[int] = None,
    filetype: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_files = []
    
    for f in files_db.values():
        # Filter by course
        if course_id is not None and f["course_id"] != course_id:
            continue
        
        # Filter by filetype
        if filetype is not None and f["filetype"] != filetype:
            continue
        
        filtered_files.append(f)
    
    # Sort by upload date (newest first)
    filtered_files.sort(key=lambda x: x["upload_date"], reverse=True)
    
    # Pagination
    filtered_files = filtered_files[skip:skip+limit]
    
    return filtered_files

@router.get("/files/{file_id}", response_model=FileResponse)
def get_file(file_id: int):
    file = files_db.get(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(**file)

@router.get("/files/{file_id}/download", status_code=status.HTTP_200_OK)
def download_file(file_id: int):
    file = files_db.get(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Increment download count
    file["download_count"] += 1
    
    # In real implementation, this would return the actual file
    # For now, return file metadata
    return FileResponse(
        content=file["file_content"],  # Return content for testing
        filename=file["original_filename"],
        media_type=file["mimetype"],
        headers={"Content-Disposition": f'attachment; filename="{file["original_filename"]}"'}
    )

@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(file_id: int):
    file = files_db.get(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    del files_db[file_id]
    
    return None

@router.put("/files/{file_id}", response_model=FileResponse)
def update_file(file_id: int, course_id: Optional[int] = None, description: Optional[str] = None):
    file = files_db.get(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Update metadata
    if course_id is not None:
        file["course_id"] = course_id
    if description is not None:
        file["description"] = description
    
    return FileResponse(**file)

@router.get("/files/summary", status_code=status.HTTP_200_OK)
def get_files_summary():
    total_files = len(files_db)
    total_size = sum(f["filesize"] for f in files_db.values())
    
    # Count by filetype
    filetype_counts = {}
    for f in files_db.values():
        filetype = f["filetype"]
        if filetype not in filetype_counts:
            filetype_counts[filetype] = 0
        filetype_counts[filetype] += 1
    
    return {
        "total_files": total_files,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "total_downloads": sum(f["download_count"] for f in files_db.values()),
        "filetype_counts": filetype_counts,
        "unique_filetypes": len(filetype_counts)
    }

@router.get("/files/course/{course_id}", response_model=List[FileResponse])
def get_course_files(course_id: int):
    course_files = []
    for f in files_db.values():
        if f["course_id"] == course_id:
            course_files.append(f)
    
    # Sort by upload date (newest first)
    course_files.sort(key=lambda x: x["upload_date"], reverse=True)
    
    return course_files

# ===== Large File Upload (Chunked) =====

@router.post("/files/upload/chunk/init")
async def initiate_chunked_upload(metadata: FileMetadata):
    global next_file_id
    
    upload_id = f"upload_{uuid.uuid4()}"
    
    new_file = {
        "id": next_file_id,
        "upload_id": upload_id,
        "original_filename": metadata.filename,
        "stored_filename": "",
        "filepath": "",
        "filesize": metadata.filesize,
        "filetype": metadata.filetype,
        "mimetype": metadata.mimetype,
        "course_id": metadata.course_id,
        "description": metadata.description,
        "download_count": 0,
        "upload_date": datetime.now().isoformat(),
        "chunks_uploaded": 0,
        "total_chunks": 0,
        "upload_complete": False,
        "file_content": b""  # Empty initially
    }
    
    files_db[next_file_id] = new_file
    next_file_id += 1
    
    return {
        "file_id": new_file["id"],
        "upload_id": upload_id,
        "chunk_size": 5 * 1024 * 1024,  # 5MB chunks
        "message": "Chunked upload initiated"
    }

@router.post("/files/upload/chunk/{upload_id}")
async def upload_chunk(upload_id: str, chunk_index: int, chunk_data: str):
    # Find upload
    upload = None
    for f in files_db.values():
        if f.get("upload_id") == upload_id:
            upload = f
            break
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Append chunk data
    if upload["file_content"] is None:
        upload["file_content"] = b""
    
    # In real implementation, this would store chunk data properly
    # For now, just track chunk count
    upload["chunks_uploaded"] += 1
    
    return {
        "message": f"Chunk {chunk_index} uploaded successfully",
        "chunks_uploaded": upload["chunks_uploaded"],
        "upload_complete": False
    }

@router.post("/files/upload/chunk/{upload_id}/complete")
async def complete_chunked_upload(upload_id: str):
    # Find upload
    upload = None
    for f in files_db.values():
        if f.get("upload_id") == upload_id:
            upload = f
            break
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Mark upload as complete
    upload["upload_complete"] = True
    upload["total_chunks"] = upload["chunks_uploaded"]
    
    return {
        "file_id": upload["id"],
        "upload_id": upload_id,
        "message": "Chunked upload completed successfully"
    }

@router.get("/files/upload/{upload_id}/status")
def get_upload_status(upload_id: str):
    upload = None
    for f in files_db.values():
        if f.get("upload_id") == upload_id:
            upload = f
            break
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    return {
        "upload_id": upload_id,
        "file_id": upload["id"],
        "original_filename": upload["original_filename"],
        "filesize": upload["filesize"],
        "chunks_uploaded": upload.get("chunks_uploaded", 0),
        "upload_complete": upload.get("upload_complete", False),
        "upload_date": upload["upload_date"]
    }
