from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import uuid
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for materials (in-memory for testing)
materials_db = {}
next_material_id = 1

# Simple database for material content
material_content_db = {}

class MaterialCreate(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    file_type: str  # pdf, ppt, docx, video, image
    file_name: str
    file_size: Optional[int] = None

class MaterialResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    file_type: str
    file_name: str
    file_size: Optional[int]
    file_url: Optional[str]
    download_count: int
    created_at: str
    updated_at: str

class MaterialContentCreate(BaseModel):
    material_id: int
    chapter_number: int
    chapter_title: str
    content_text: Optional[str] = None
    summary: Optional[str] = None
    knowledge_points: Optional[List[str]] = None

class MaterialContentResponse(BaseModel):
    id: int
    material_id: int
    chapter_number: int
    chapter_title: str
    content_text: Optional[str]
    summary: Optional[str]
    knowledge_points: Optional[List[str]]
    created_at: str

@router.post("/materials", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
def upload_material(material: MaterialCreate):
    global next_material_id
    
    # Check if course exists (simple check)
    # TODO: Implement proper course validation
    
    # Create new material
    new_material = {
        "id": next_material_id,
        "course_id": material.course_id,
        "title": material.title,
        "description": material.description,
        "file_type": material.file_type,
        "file_name": material.file_name,
        "file_size": material.file_size,
        "file_url": f"/api/v1/materials/{next_material_id}/download",  # Simple mock URL
        "download_count": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    materials_db[next_material_id] = new_material
    next_material_id += 1
    
    return MaterialResponse(**new_material)

@router.post("/materials/upload")
async def upload_material_file(
    course_id: int,
    title: str,
    file: UploadFile,
    description: Optional[str] = None
):
    global next_material_id
    
    # Check file type
    file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    file_type_map = {
        'pdf': 'pdf',
        'ppt': 'ppt',
        'pptx': 'ppt',
        'doc': 'doc',
        'docx': 'doc',
        'mp4': 'video',
        'mov': 'video',
        'png': 'image',
        'jpg': 'image',
        'jpeg': 'image'
    }
    file_type = file_type_map.get(file_ext, 'unknown')
    
    # Create new material
    new_material = {
        "id": next_material_id,
        "course_id": course_id,
        "title": title,
        "description": description,
        "file_type": file_type,
        "file_name": file.filename,
        "file_size": len(await file.read()),
        "file_url": f"/api/v1/materials/{next_material_id}/download",
        "download_count": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    materials_db[next_material_id] = new_material
    next_material_id += 1
    
    return MaterialResponse(**new_material)

@router.get("/materials", response_model=List[MaterialResponse])
def list_materials(
    course_id: Optional[int] = None,
    file_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_materials = []
    
    for m in materials_db.values():
        # Filter by course
        if course_id is not None and m["course_id"] != course_id:
            continue
        
        # Filter by file type
        if file_type is not None and m["file_type"] != file_type:
            continue
        
        filtered_materials.append(m)
    
    # Pagination
    filtered_materials = filtered_materials[skip:skip+limit]
    
    return filtered_materials

@router.get("/materials/{material_id}", response_model=MaterialResponse)
def get_material(material_id: int):
    material = materials_db.get(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    return MaterialResponse(**material)

@router.put("/materials/{material_id}", response_model=MaterialResponse)
def update_material(material_id: int, material_update: dict):
    material = materials_db.get(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Update fields
    if "title" in material_update:
        material["title"] = material_update["title"]
    if "description" in material_update:
        material["description"] = material_update["description"]
    
    material["updated_at"] = datetime.now().isoformat()
    
    return MaterialResponse(**material)

@router.delete("/materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(material_id: int):
    material = materials_db.get(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    del materials_db[material_id]
    
    return None

@router.get("/materials/{material_id}/download", status_code=status.HTTP_200_OK)
def download_material(material_id: int):
    material = materials_db.get(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Increment download count
    material["download_count"] += 1
    
    # In real implementation, this would return the actual file
    # For now, just return a message
    return {
        "message": "File download started",
        "file_name": material["file_name"],
        "file_type": material["file_type"],
        "download_count": material["download_count"]
    }

# ===== Material Content =====

@router.post("/materials/content", response_model=MaterialContentResponse, status_code=status.HTTP_201_CREATED)
def create_material_content(content: MaterialContentCreate):
    global next_material_id
    
    # Check if material exists
    material = materials_db.get(content.material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Create new content
    new_content = {
        "id": len(material_content_db) + 1,
        "material_id": content.material_id,
        "chapter_number": content.chapter_number,
        "chapter_title": content.chapter_title,
        "content_text": content.content_text,
        "summary": content.summary,
        "knowledge_points": content.knowledge_points,
        "created_at": datetime.now().isoformat()
    }
    
    material_content_db[new_content["id"]] = new_content
    
    return MaterialContentResponse(**new_content)

@router.get("/materials/{material_id}/content", response_model=List[MaterialContentResponse])
def get_material_content(material_id: int):
    material = materials_db.get(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Get all content for this material
    content_list = []
    for c in material_content_db.values():
        if c["material_id"] == material_id:
            content_list.append(c)
    
    # Sort by chapter number
    content_list.sort(key=lambda x: x["chapter_number"])
    
    return content_list
