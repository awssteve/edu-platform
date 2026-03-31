"""
Password Reset Module
密码重置模块
功能：用户可以重置密码、发送重置邮件、验证重置token
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import secrets
import string

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for password reset tokens
password_reset_tokens_db = {}
next_token_id = 1

# Simple database for user password hashes (mock)
user_passwords_db = {}

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetTokenCreate(BaseModel):
    token: str
    new_password: str

class PasswordResetVerifyResponse(BaseModel):
    token: str
    is_valid: bool
    expires_at: str
    message: str

def generate_token(length: int = 32):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

@router.post("/password-reset/request", status_code=status.HTTP_202_ACCEPTED)
def request_password_reset(request: PasswordResetRequest):
    global next_token_id
    
    # Check if user exists with this email
    user_found = False
    user_id = None
    
    # Simple check (in real implementation, query database)
    # For now, assume user exists for demo purposes
    if "@" in request.email:
        user_found = True
        user_id = 1  # Mock user ID
    
    if not user_found:
        # Don't reveal if user exists (security best practice)
        return {"message": "If a user with this email exists, a password reset link will be sent"}
    
    # Generate reset token
    reset_token = generate_token(32)
    
    # Token expires in 1 hour
    expires_at = datetime.now() + timedelta(hours=1)
    
    # Create reset token record
    new_token = {
        "id": next_token_id,
        "token": reset_token,
        "email": request.email,
        "user_id": user_id,
        "expires_at": expires_at.isoformat(),
        "used": False,
        "created_at": datetime.now().isoformat()
    }
    
    password_reset_tokens_db[next_token_id] = new_token
    next_token_id += 1
    
    # In real implementation, send email with reset link
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    
    return {
        "message": "Password reset link sent to email",
        "reset_link": reset_link,  # Only for demo/testing
        "expires_at": expires_at.isoformat(),
        "email": request.email[:3] + "***" + request.email[-3:]  # Mask email
    }

@router.get("/password-reset/token/{token}", response_model=PasswordResetVerifyResponse)
def verify_reset_token(token: str):
    # Find token
    token_data = None
    for t in password_reset_tokens_db.values():
        if t["token"] == token and not t["used"]:
            token_data = t
            break
    
    if not token_data:
        return PasswordResetVerifyResponse(
            token=token,
            is_valid=False,
            expires_at="",
            message="Invalid or expired token"
        )
    
    # Check if expired
    expires_at = datetime.fromisoformat(token_data["expires_at"])
    if datetime.now() > expires_at:
        return PasswordResetVerifyResponse(
            token=token,
            is_valid=False,
            expires_at=token_data["expires_at"],
            message="Token has expired"
        )
    
    return PasswordResetVerifyResponse(
        token=token,
        is_valid=True,
        expires_at=token_data["expires_at"],
        message="Token is valid"
    )

@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
def confirm_password_reset(reset: PasswordResetTokenCreate):
    # Find and validate token
    token_data = None
    for t in password_reset_tokens_db.values():
        if t["token"] == reset.token and not t["used"]:
            token_data = t
            break
    
    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Check if expired
    expires_at = datetime.fromisoformat(token_data["expires_at"])
    if datetime.now() > expires_at:
        raise HTTPException(status_code=400, detail="Token has expired")
    
    # Validate new password
    if not reset.new_password:
        raise HTTPException(status_code=400, detail="New password is required")
    
    if len(reset.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    # Update user password (in real implementation, update in database)
    user_id = token_data["user_id"]
    user_passwords_db[user_id] = reset.new_password
    
    # Mark token as used
    token_data["used"] = True
    token_data["used_at"] = datetime.now().isoformat()
    
    return {
        "message": "Password reset successfully",
        "reset_at": token_data["used_at"],
        "email": token_data["email"][:3] + "***" + token_data["email"][-3:]  # Mask email
    }

@router.post("/password-reset/cancel/{token}", status_code=status.HTTP_200_OK)
def cancel_password_reset(token: str):
    # Find and delete token
    for t_id, t in password_reset_tokens_db.items():
        if t["token"] == token:
            del password_reset_tokens_db[t_id]
            return {
                "message": "Password reset cancelled successfully",
                "cancelled_at": datetime.now().isoformat()
            }
    
    raise HTTPException(status_code=404, detail="Token not found")

@router.get("/password-reset/status", status_code=status.HTTP_200_OK)
def get_reset_status():
    total_tokens = len(password_reset_tokens_db)
    active_tokens = len([t for t in password_reset_tokens_db.values() if not t["used"]])
    expired_tokens = len([t for t in password_reset_tokens_db.values() if t["used"] or datetime.now() > datetime.fromisoformat(t["expires_at"])])
    
    return {
        "total_tokens": total_tokens,
        "active_tokens": active_tokens,
        "expired_tokens": expired_tokens,
        "token_validity_hours": 1
    }
