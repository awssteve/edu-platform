"""
Certificate Verification Module
学习证书验证模块
功能：第三方可以验证证书真实性、验证历史
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for certificates
certificates_db = {}

# Simple database for verification logs
verification_logs_db = {}
next_verification_log_id = 1

class CertificateVerificationRequest(BaseModel):
    certificate_number: str
    verification_code: str

class CertificateVerificationResponse(BaseModel):
    is_valid: bool
    certificate_id: int
    certificate_number: str
    student_name: str
    course_name: str
    certificate_type: str
    issue_date: str
    expiry_date: Optional[str]
    verification_code: str
    verified_at: str
    message: str

class VerificationLogResponse(BaseModel):
    id: int
    certificate_id: int
    certificate_number: str
    verification_code: str
    is_valid: bool
    ip_address: str
    user_agent: str
    verified_at: str

@router.post("/certificates/verify", response_model=CertificateVerificationResponse, status_code=status.HTTP_200_OK)
def verify_certificate(request: CertificateVerificationRequest, ip_address: str = "127.0.0.1", user_agent: str = "Unknown"):
    global next_verification_log_id
    
    # Find certificate by number
    certificate = None
    for c in certificates_db.values():
        if c.get("certificate_number") == request.certificate_number:
            certificate = c
            break
    
    if not certificate:
        # Create verification log for invalid certificate
        verification_logs_db[next_verification_log_id] = {
            "id": next_verification_log_id,
            "certificate_id": None,
            "certificate_number": request.certificate_number,
            "verification_code": request.verification_code,
            "is_valid": False,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "verified_at": datetime.now().isoformat()
        }
        next_verification_log_id += 1
        
        return CertificateVerificationResponse(
            is_valid=False,
            certificate_id=0,
            certificate_number=request.certificate_number,
            student_name="",
            course_name="",
            certificate_type="",
            issue_date="",
            expiry_date=None,
            verification_code="",
            verified_at=datetime.now().isoformat(),
            message="Certificate not found or invalid"
        )
    
    # Verify verification code
    if certificate.get("verification_code") != request.verification_code:
        verification_logs_db[next_verification_log_id] = {
            "id": next_verification_log_id,
            "certificate_id": certificate.get("id"),
            "certificate_number": request.certificate_number,
            "verification_code": request.verification_code,
            "is_valid": False,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "verified_at": datetime.now().isoformat()
        }
        next_verification_log_id += 1
        
        return CertificateVerificationResponse(
            is_valid=False,
            certificate_id=certificate.get("id", 0),
            certificate_number=request.certificate_number,
            student_name=certificate.get("student_name", ""),
            course_name=certificate.get("course_name", ""),
            certificate_type=certificate.get("certificate_type", ""),
            issue_date=certificate.get("issue_date", ""),
            expiry_date=certificate.get("expiry_date"),
            verification_code="",
            verified_at=datetime.now().isoformat(),
            message="Invalid verification code"
        )
    
    # Check expiry date if exists
    expiry_date = certificate.get("expiry_date")
    if expiry_date:
        expiry_dt = datetime.fromisoformat(expiry_date)
        if datetime.now() > expiry_dt:
            verification_logs_db[next_verification_log_id] = {
                "id": next_verification_log_id,
                "certificate_id": certificate.get("id"),
                "certificate_number": request.certificate_number,
                "verification_code": request.verification_code,
                "is_valid": False,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "verified_at": datetime.now().isoformat()
            }
            next_verification_log_id += 1
            
            return CertificateVerificationResponse(
                is_valid=False,
                certificate_id=certificate.get("id", 0),
                certificate_number=request.certificate_number,
                student_name=certificate.get("student_name", ""),
                course_name=certificate.get("course_name", ""),
                certificate_type=certificate.get("certificate_type", ""),
                issue_date=certificate.get("issue_date", ""),
                expiry_date=certificate.get("expiry_date"),
                verification_code="",
                verified_at=datetime.now().isoformat(),
                message="Certificate has expired"
            )
    
    # Certificate is valid
    verification_logs_db[next_verification_log_id] = {
        "id": next_verification_log_id,
        "certificate_id": certificate.get("id"),
        "certificate_number": request.certificate_number,
        "verification_code": request.verification_code,
        "is_valid": True,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "verified_at": datetime.now().isoformat()
    }
    next_verification_log_id += 1
    
    return CertificateVerificationResponse(
        is_valid=True,
        certificate_id=certificate.get("id", 0),
        certificate_number=request.certificate_number,
        student_name=certificate.get("student_name", ""),
        course_name=certificate.get("course_name", ""),
        certificate_type=certificate.get("certificate_type", ""),
        issue_date=certificate.get("created_at", ""),
        expiry_date=certificate.get("expiry_date"),
        verification_code=request.verification_code,
        verified_at=datetime.now().isoformat(),
        message="Certificate is valid and authentic"
    )

@router.get("/certificates/{certificate_number}/verification", response_model=CertificateVerificationResponse)
def get_certificate_verification(certificate_number: str):
    certificate = None
    for c in certificates_db.values():
        if c.get("certificate_number") == certificate_number:
            certificate = c
            break
    
    if not certificate:
        return CertificateVerificationResponse(
            is_valid=False,
            certificate_id=0,
            certificate_number=certificate_number,
            student_name="",
            course_name="",
            certificate_type="",
            issue_date="",
            expiry_date=None,
            verification_code="",
            verified_at=datetime.now().isoformat(),
            message="Certificate not found"
        )
    
    # Check expiry
    is_valid = True
    message = "Certificate is valid"
    expiry_date = certificate.get("expiry_date")
    
    if expiry_date:
        expiry_dt = datetime.fromisoformat(expiry_date)
        if datetime.now() > expiry_dt:
            is_valid = False
            message = "Certificate has expired"
    
    return CertificateVerificationResponse(
        is_valid=is_valid,
        certificate_id=certificate.get("id", 0),
        certificate_number=certificate_number,
        student_name=certificate.get("student_name", ""),
        course_name=certificate.get("course_name", ""),
        certificate_type=certificate.get("certificate_type", ""),
        issue_date=certificate.get("created_at", ""),
        expiry_date=certificate.get("expiry_date"),
        verification_code=certificate.get("verification_code", ""),
        verified_at=datetime.now().isoformat(),
        message=message
    )

@router.get("/certificates/{certificate_number}/download", status_code=status.HTTP_200_OK)
def download_certificate(certificate_number: str):
    # Find certificate
    certificate = None
    for c in certificates_db.values():
        if c.get("certificate_number") == certificate_number:
            certificate = c
            break
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # Generate certificate PDF content (simplified text for now)
    cert_content = f"""
    ============================
           LEARNING CERTIFICATE
    ============================
    
    Certificate Number: {certificate.get("certificate_number")}
    Verification Code: {certificate.get("verification_code")}
    
    This is to certify that
    
    {certificate.get("student_name", "Unknown")}
    
    has successfully completed
    
    {certificate.get("course_name", "Unknown Course")}
    
    Certificate Type: {certificate.get("certificate_type", "completion").upper()}
    Issue Date: {certificate.get("created_at", "")}
    {f"Expiry Date: {certificate.get("expiry_date", "")}" if certificate.get("expiry_date") else "Expiry Date: None"}
    
    Verification Code: {certificate.get("verification_code")}
    
    ============================
    """
    
    return FileResponse(
        content=cert_content.encode('utf-8'),
        filename=f"certificate_{certificate_number}.txt",
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="certificate_{certificate_number}.txt"'}
    )

@router.get("/certificates/verification-logs", response_model=List[VerificationLogResponse])
def list_verification_logs(
    certificate_number: Optional[str] = None,
    is_valid: Optional[bool] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_logs = []
    
    for log in verification_logs_db.values():
        # Filter by certificate number
        if certificate_number is not None and log["certificate_number"] != certificate_number:
            continue
        
        # Filter by validity
        if is_valid is not None and log["is_valid"] != is_valid:
            continue
        
        # Filter by date range
        if date_from and log["verified_at"] < date_from:
            continue
        if date_to and log["verified_at"] > date_to:
            continue
        
        filtered_logs.append(log)
    
    # Sort by verification time (newest first)
    filtered_logs.sort(key=lambda x: x["verified_at"], reverse=True)
    
    # Pagination
    filtered_logs = filtered_logs[skip:skip+limit]
    
    return filtered_logs

@router.get("/certificates/verification-logs/summary", status_code=status.HTTP_200_OK)
def get_verification_logs_summary():
    total_logs = len(verification_logs_db)
    valid_logs = len([log for log in verification_logs_db.values() if log["is_valid"]])
    invalid_logs = total_logs - valid_logs
    
    # Count by IP address
    ip_counts = {}
    for log in verification_logs_db.values():
        ip = log["ip_address"]
        if ip not in ip_counts:
            ip_counts[ip] = 0
        ip_counts[ip] += 1
    
    # Get top IPs
    top_ips = sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    return {
        "total_verifications": total_logs,
        "valid_verifications": valid_logs,
        "invalid_verifications": invalid_logs,
        "validity_rate": round((valid_logs / total_logs) * 100, 2) if total_logs > 0 else 0.0,
        "unique_ip_addresses": len(ip_counts),
        "top_ip_addresses": [{"ip": ip, "count": count} for ip, count in top_ips]
    }

@router.get("/certificates/{certificate_number}/stats", status_code=status.HTTP_200_OK)
def get_certificate_stats(certificate_number: str):
    certificate = None
    for c in certificates_db.values():
        if c.get("certificate_number") == certificate_number:
            certificate = c
            break
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    certificate_id = certificate.get("id", 0)
    
    # Get verification logs for this certificate
    logs = []
    for log in verification_logs_db.values():
        if log["certificate_id"] == certificate_id:
            logs.append(log)
    
    total_verifications = len(logs)
    valid_verifications = len([log for log in logs if log["is_valid"]])
    
    # Get unique IPs
    unique_ips = len(set(log["ip_address"] for log in logs))
    
    # Get verification time range
    if logs:
        first_verification = min(log["verified_at"] for log in logs)
        last_verification = max(log["verified_at"] for log in logs)
    else:
        first_verification = None
        last_verification = None
    
    return {
        "certificate_number": certificate_number,
        "certificate_id": certificate_id,
        "student_name": certificate.get("student_name", ""),
        "course_name": certificate.get("course_name", ""),
        "total_verifications": total_verifications,
        "valid_verifications": valid_verifications,
        "invalid_verifications": total_verifications - valid_verifications,
        "validity_rate": round((valid_verifications / total_verifications) * 100, 2) if total_verifications > 0 else 0.0,
        "unique_verifiers": unique_ips,
        "first_verification": first_verification,
        "last_verification": last_verification
    }

@router.get("/certificates/bulk-verify", response_model=List[CertificateVerificationResponse], status_code=status.HTTP_200_OK)
def bulk_verify_certificates(verification_codes: List[str]):
    # Split verification codes into certificate number and code
    results = []
    
    for verification_code in verification_codes:
        # Simple split (in real implementation, this would be more robust)
        if verification_code:
            parts = verification_code.split('-')
            if len(parts) >= 2:
                certificate_number = parts[-1]  # Last part is usually the number
                code = verification_code
                
                try:
                    result = verify_certificate(
                        CertificateVerificationRequest(
                            certificate_number=certificate_number,
                            verification_code=code
                        )
                    )
                    results.append(result)
                except:
                    results.append(CertificateVerificationResponse(
                        is_valid=False,
                        certificate_id=0,
                        certificate_number=certificate_number,
                        student_name="",
                        course_name="",
                        certificate_type="",
                        issue_date="",
                        expiry_date=None,
                        verification_code="",
                        verified_at=datetime.now().isoformat(),
                        message="Verification failed"
                    ))
    
    return results

@router.post("/certificates/{certificate_number}/invalidate", status_code=status.HTTP_200_OK)
def invalidate_certificate(certificate_number: int, reason: str):
    # Find certificate
    certificate = None
    for c in certificates_db.values():
        if c.get("id") == certificate_number:
            certificate = c
            break
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # Mark as invalid (in real implementation, update in database)
    # For now, just return success
    return {
        "message": "Certificate marked as invalid",
        "certificate_id": certificate_number,
        "certificate_number": certificate.get("certificate_number"),
        "reason": reason,
        "invalidated_at": datetime.now().isoformat()
    }

@router.get("/certificates/{certificate_number}/qr-code", status_code=status.HTTP_200_OK)
def get_certificate_qr_code(certificate_number: str):
    # Find certificate
    certificate = None
    for c in certificates_db.values():
        if c.get("certificate_number") == certificate_number:
            certificate = c
            break
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # Generate QR code URL (in real implementation, this would generate actual QR code)
    verification_url = f"https://platform.com/verify/{certificate_number}/{certificate.get('verification_code')}"
    
    # In real implementation, generate QR code image
    # For now, just return URL
    return {
        "certificate_number": certificate_number,
        "verification_url": verification_url,
        "verification_code": certificate.get("verification_code"),
        "message": "Scan QR code to verify certificate authenticity"
    }
