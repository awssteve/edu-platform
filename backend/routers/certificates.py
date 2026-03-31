from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date
import random
import string
from database import get_db
from models import User, Course, Certificate, LearningRecord
from .auth import get_current_user

router = APIRouter()

def generate_certificate_number():
    """Generate unique certificate number"""
    timestamp = str(int(datetime.utcnow().timestamp()))
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"EDU-{timestamp}-{random_str}"

@router.get("/my", response_model=List[dict])
def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certificates = db.query(Certificate).join(
        LearningRecord, LearningRecord.id == Certificate.learning_record_id
    ).filter(
        LearningRecord.student_id == current_user.id,
        Certificate.is_revoked == False
    ).all()
    
    return [
        {
            "id": c.id,
            "certificate_number": c.certificate_number,
            "issue_date": c.issue_date,
            "certificate_url": c.certificate_url,
            "is_revoked": c.is_revoked
        }
        for c in certificates
    ]

@router.get("/{certificate_id}", response_model=dict)
def get_certificate(
    certificate_id: UUID,
    db: Session = Depends(get_db)
):
    certificate = db.query(Certificate).filter(
        Certificate.id == certificate_id
    ).first()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    return {
        "id": certificate.id,
        "certificate_number": certificate.certificate_number,
        "issue_date": certificate.issue_date,
        "certificate_url": certificate.certificate_url,
        "is_revoked": certificate.is_revoked,
        "revoked_at": certificate.revoked_at,
        "revoked_reason": certificate.revoked_reason
    }

@router.get("/{certificate_id}/download")
def download_certificate(
    certificate_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certificate = db.query(Certificate).join(
        LearningRecord, LearningRecord.id == Certificate.learning_record_id
    ).filter(
        Certificate.id == certificate_id,
        LearningRecord.student_id == current_user.id
    ).first()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    if certificate.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Certificate has been revoked"
        )
    
    if not certificate.certificate_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate file not available"
        )
    
    # In production, return the file
    return {
        "download_url": certificate.certificate_url,
        "message": "Certificate ready for download"
    }

@router.get("/verify/{certificate_number}", response_model=dict)
def verify_certificate(
    certificate_number: str,
    db: Session = Depends(get_db)
):
    certificate = db.query(Certificate).filter(
        Certificate.certificate_number == certificate_number
    ).first()
    
    if not certificate:
        return {
            "valid": False,
            "reason": "Certificate not found"
        }
    
    if certificate.is_revoked:
        return {
            "valid": False,
            "reason": f"Certificate revoked: {certificate.revoked_reason or 'No reason provided'}"
        }
    
    learning_record = db.query(LearningRecord).filter(
        LearningRecord.id == certificate.learning_record_id
    ).first()
    
    course = db.query(Course).filter(Course.id == learning_record.course_id).first()
    
    return {
        "valid": True,
        "student_name": learning_record.student.full_name,
        "course_name": course.title,
        "completion_date": learning_record.completion_date,
        "final_score": learning_record.final_score,
        "issue_date": certificate.issue_date
    }

@router.post("/course/{course_id}/issue", status_code=status.HTTP_201_CREATED)
def issue_certificate(
    course_id: UUID,
    student_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "teacher" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can issue certificates"
        )
    
    # Check learning record
    learning_record = db.query(LearningRecord).filter(
        LearningRecord.student_id == student_id,
        LearningRecord.course_id == course_id,
        LearningRecord.status == "completed"
    ).first()
    
    if not learning_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student has not completed the course"
        )
    
    # Check if certificate already issued
    existing = db.query(Certificate).filter(
        Certificate.learning_record_id == learning_record.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certificate already issued"
        )
    
    # Generate certificate number
    certificate_number = generate_certificate_number()
    
    # Create certificate
    certificate = Certificate(
        learning_record_id=learning_record.id,
        certificate_number=certificate_number,
        issue_date=date.today()
    )
    db.add(certificate)
    db.commit()
    
    # Generate certificate PDF (simplified)
    # In production, use reportlab or similar
    certificate.certificate_url = f"/certificates/{certificate_number}.pdf"
    db.commit()
    
    return {
        "id": certificate.id,
        "certificate_number": certificate_number,
        "message": "Certificate issued successfully"
    }
