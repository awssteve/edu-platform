"""
Certificate Management Module
证书管理模块
功能：生成学习证书、数字签名验证、下载证书
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import base64

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for certificates
certificates_db = {}
next_certificate_id = 1

class CertificateCreate(BaseModel):
    student_id: int
    course_id: int
    certificate_type: str = "completion"  # completion, achievement, honor
    issue_date: str  # ISO format datetime
    expiry_date: Optional[str] = None

class CertificateResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    course_id: int
    course_name: str
    certificate_type: str
    certificate_number: str
    issue_date: str
    expiry_date: Optional[str]
    verification_code: str
    download_url: str
    created_at: str

class CertificateVerifyResponse(BaseModel):
    is_valid: bool
    certificate_data: dict
    verification_message: str

@router.post("/certificates", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
def create_certificate(certificate: CertificateCreate):
    global next_certificate_id
    
    # Simple validation
    if not certificate.issue_date:
        raise HTTPException(status_code=400, detail="Issue date is required")
    
    # Generate certificate number
    certificate_number = f"EDU-{next_certificate_id:06d}"
    
    # Generate verification code
    verification_code = f"VER-{next_certificate_id:08d}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Create certificate
    new_certificate = {
        "id": next_certificate_id,
        "student_id": certificate.student_id,
        "student_name": "Student Name",  # In real implementation, fetch from user database
        "course_id": certificate.course_id,
        "course_name": "Course Name",  # In real implementation, fetch from course database
        "certificate_type": certificate.certificate_type,
        "certificate_number": certificate_number,
        "issue_date": certificate.issue_date,
        "expiry_date": certificate.expiry_date,
        "verification_code": verification_code,
        "download_url": f"/api/v1/certificates/{next_certificate_id}/download",
        "created_at": datetime.now().isoformat()
    }
    
    certificates_db[next_certificate_id] = new_certificate
    next_certificate_id += 1
    
    return CertificateResponse(**new_certificate)

@router.get("/certificates", response_model=List[CertificateResponse])
def list_certificates(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    certificate_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_certificates = []
    
    for c in certificates_db.values():
        # Filter by student
        if student_id is not None and c["student_id"] != student_id:
            continue
        
        # Filter by course
        if course_id is not None and c["course_id"] != course_id:
            continue
        
        # Filter by certificate type
        if certificate_type is not None and c["certificate_type"] != certificate_type:
            continue
        
        filtered_certificates.append(c)
    
    # Sort by created date (newest first)
    filtered_certificates.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    filtered_certificates = filtered_certificates[skip:skip+limit]
    
    return filtered_certificates

@router.get("/certificates/{certificate_id}", response_model=CertificateResponse)
def get_certificate(certificate_id: int):
    certificate = certificates_db.get(certificate_id)
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return CertificateResponse(**certificate)

@router.get("/certificates/{certificate_id}/verify", response_model=CertificateVerifyResponse)
def verify_certificate(certificate_id: int, verification_code: str):
    certificate = certificates_db.get(certificate_id)
    if not certificate:
        return CertificateVerifyResponse(
            is_valid=False,
            certificate_data={},
            verification_message="Certificate not found"
        )
    
    # Check verification code
    if certificate["verification_code"] != verification_code:
        return CertificateVerifyResponse(
            is_valid=False,
            certificate_data={},
            verification_message="Invalid verification code"
        )
    
    # Check expiry date if exists
    if certificate["expiry_date"]:
        expiry_date = datetime.fromisoformat(certificate["expiry_date"])
        if datetime.now() > expiry_date:
            return CertificateVerifyResponse(
                is_valid=False,
                certificate_data={},
                verification_message="Certificate has expired"
            )
    
    return CertificateVerifyResponse(
        is_valid=True,
        certificate_data=certificate,
        verification_message="Certificate is valid"
    )

@router.get("/certificates/{certificate_id}/download", status_code=status.HTTP_200_OK)
def download_certificate(certificate_id: int):
    certificate = certificates_db.get(certificate_id)
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # In real implementation, this would generate and return a PDF file
    # For now, return a text file with certificate details
    
    certificate_text = f"""
    ============================
           LEARNING CERTIFICATE
    ============================
    
    Certificate Number: {certificate['certificate_number']}
    Verification Code: {certificate['verification_code']}
    
    This is to certify that
    
    {certificate['student_name']}
    
    has successfully completed
    
    {certificate['course_name']}
    
    Certificate Type: {certificate['certificate_type'].upper()}
    Issue Date: {certificate['issue_date']}
    {f"Expiry Date: {certificate['expiry_date']}" if certificate['expiry_date'] else "Expiry Date: None"}
    
    Verification Code: {certificate['verification_code']}
    
    ============================
    """
    
    return FileResponse(
        path="/dev/null",
        media_type="text/plain",
        filename=f"certificate_{certificate['certificate_number']}.txt",
        content=certificate_text.encode('utf-8')
    )

@router.get("/certificates/verify", response_model=CertificateVerifyResponse)
def verify_certificate_by_number(
    certificate_number: str,
    verification_code: str
):
    # Find certificate by number
    certificate = None
    for c in certificates_db.values():
        if c["certificate_number"] == certificate_number:
            certificate = c
            break
    
    if not certificate:
        return CertificateVerifyResponse(
            is_valid=False,
            certificate_data={},
            verification_message="Certificate not found"
        )
    
    # Check verification code
    if certificate["verification_code"] != verification_code:
        return CertificateVerifyResponse(
            is_valid=False,
            certificate_data={},
            verification_message="Invalid verification code"
        )
    
    # Check expiry date if exists
    if certificate["expiry_date"]:
        expiry_date = datetime.fromisoformat(certificate["expiry_date"])
        if datetime.now() > expiry_date:
            return CertificateVerifyResponse(
                is_valid=False,
                certificate_data={},
                verification_message="Certificate has expired"
            )
    
    return CertificateVerifyResponse(
        is_valid=True,
        certificate_data=certificate,
        verification_message="Certificate is valid"
    )

@router.get("/certificates/student/{student_id}", response_model=List[CertificateResponse])
def get_student_certificates(student_id: int):
    filtered_certificates = []
    
    for c in certificates_db.values():
        if c["student_id"] == student_id:
            filtered_certificates.append(c)
    
    # Sort by created date (newest first)
    filtered_certificates.sort(key=lambda x: x["created_at"], reverse=True)
    
    return filtered_certificates

@router.get("/certificates/course/{course_id}", response_model=List[CertificateResponse])
def get_course_certificates(course_id: int):
    filtered_certificates = []
    
    for c in certificates_db.values():
        if c["course_id"] == course_id:
            filtered_certificates.append(c)
    
    # Sort by created date (newest first)
    filtered_certificates.sort(key=lambda x: x["created_at"], reverse=True)
    
    return filtered_certificates
