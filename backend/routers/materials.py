from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import os
from database import get_db
from models import User, Course, CourseMaterial
from schemas import MaterialCreate, MaterialResponse
from .auth import get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def upload_material(
    course_id: UUID,
    title: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify course exists and user is teacher
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    if course.teacher_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the course teacher can upload materials"
        )
    
    # Save file
    file_extension = file.filename.split(".")[-1].lower()
    file_path = f"{UPLOAD_DIR}/{course_id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Get file size
    file_size = len(content)
    
    # Determine file type
    file_type_map = {
        "pdf": "pdf",
        "ppt": "ppt",
        "pptx": "pptx",
        "doc": "doc",
        "docx": "docx",
        "mp4": "mp4"
    }
    file_type = file_type_map.get(file_extension, "unknown")
    
    material = CourseMaterial(
        course_id=course_id,
        title=title,
        file_name=file.filename,
        file_url=file_path,
        file_type=file_type,
        file_size=file_size,
        upload_status="pending"
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    
    # Trigger parsing in background (simplified)
    # In production, use Celery or similar
    parse_material(material.id, db)
    
    return material

def parse_material(material_id: UUID, db: Session):
    """Parse uploaded material (simplified version)"""
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
    if not material:
        return
    
    # Update status
    material.upload_status = "processing"
    db.commit()
    
    # Here you would:
    # 1. Extract text from PDF/PPT/DOCX
    # 2. Generate vector embeddings
    # 3. Save to MaterialContent
    
    # For now, mark as completed
    material.upload_status = "completed"
    material.pages = 10  # Mock value
    db.commit()

@router.get("/course/{course_id}", response_model=List[MaterialResponse])
def get_course_materials(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    materials = db.query(CourseMaterial).filter(
        CourseMaterial.course_id == course_id
    ).all()
    return materials

@router.get("/{material_id}", response_model=MaterialResponse)
def get_material(material_id: UUID, db: Session = Depends(get_db)):
    material = db.query(CourseMaterial).filter(
        CourseMaterial.id == material_id
    ).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return material

@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(
    material_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    material = db.query(CourseMaterial).filter(
        CourseMaterial.id == material_id
    ).first()
    
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    
    course = db.query(Course).filter(Course.id == material.course_id).first()
    if course.teacher_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the course teacher can delete materials"
        )
    
    # Delete file
    if os.path.exists(material.file_url):
        os.remove(material.file_url)
    
    db.delete(material)
    db.commit()
    return None
