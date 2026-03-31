"""
Email Notification Module
邮件通知发送模块
功能：系统发送邮件通知、邮件模板管理
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for email templates
email_templates_db = {}
next_template_id = 1

# Simple database for email logs
email_logs_db = {}
next_email_log_id = 1

class EmailTemplateCreate(BaseModel):
    name: str
    subject: str
    body: str  # Supports variables like {{username}}, {{course_name}}
    variables: List[str]  # List of variable names
    category: str  # notification, marketing, transaction

class EmailTemplateResponse(BaseModel):
    id: int
    name: str
    subject: str
    body: str
    variables: List[str]
    category: str
    active: bool
    created_at: str
    updated_at: Optional[str]

class SendEmailRequest(BaseModel):
    recipient_email: str
    recipient_name: str
    template_id: Optional[int] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    variables: Dict[str, str] = {}  # Variable values to substitute
    send_immediately: bool = True

class EmailLogResponse(BaseModel):
    id: int
    recipient_email: str
    recipient_name: str
    template_id: Optional[int]
    subject: str
    sent_at: str
    status: str  # pending, sent, failed, delivered, bounced
    error_message: Optional[str]

def substitute_variables(template: str, variables: Dict[str, str]) -> str:
    """Substitute variables in template with actual values"""
    result = template
    
    for key, value in variables.items():
        # Replace {{variable}} with value
        result = result.replace("{{" + key + "}}", str(value))
        # Also replace {{ variable }} (with spaces)
        result = result.replace("{{ " + key + " }}", str(value))
    
    return result

@router.post("/emails/templates", response_model=EmailTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_email_template(template: EmailTemplateCreate):
    global next_template_id
    
    new_template = {
        "id": next_template_id,
        "name": template.name,
        "subject": template.subject,
        "body": template.body,
        "variables": template.variables,
        "category": template.category,
        "active": True,
        "created_at": datetime.now().isoformat(),
        "updated_at": None
    }
    
    email_templates_db[next_template_id] = new_template
    next_template_id += 1
    
    return EmailTemplateResponse(**new_template)

@router.get("/emails/templates", response_model=List[EmailTemplateResponse])
def list_email_templates(
    category: Optional[str] = None,
    active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_templates = []
    
    for t in email_templates_db.values():
        # Filter by category
        if category is not None and t["category"] != category:
            continue
        
        # Filter by active status
        if active is not None and t["active"] != active:
            continue
        
        filtered_templates.append(t)
    
    # Sort by created date (newest first)
    filtered_templates.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    filtered_templates = filtered_templates[skip:skip+limit]
    
    return filtered_templates

@router.get("/emails/templates/{template_id}", response_model=EmailTemplateResponse)
def get_email_template(template_id: int):
    template = email_templates_db.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
    
    return EmailTemplateResponse(**template)

@router.put("/emails/templates/{template_id}", response_model=EmailTemplateResponse)
def update_email_template(template_id: int, template_update: dict):
    template = email_templates_db.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
    
    # Update fields
    if "name" in template_update:
        template["name"] = template_update["name"]
    if "subject" in template_update:
        template["subject"] = template_update["subject"]
    if "body" in template_update:
        template["body"] = template_update["body"]
    if "variables" in template_update:
        template["variables"] = template_update["variables"]
    if "category" in template_update:
        template["category"] = template_update["category"]
    
    template["updated_at"] = datetime.now().isoformat()
    
    return EmailTemplateResponse(**template)

@router.delete("/emails/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_email_template(template_id: int):
    template = email_templates_db.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
    
    del email_templates_db[template_id]
    
    return None

@router.post("/emails/send", response_model=EmailLogResponse, status_code=status.HTTP_201_CREATED)
def send_email(request: SendEmailRequest):
    global next_email_log_id
    
    # Substitute variables
    if request.template_id:
        template = email_templates_db.get(request.template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Email template not found")
        
        # Check if template is active
        if not template["active"]:
            raise HTTPException(status_code=400, detail="Email template is not active")
        
        # Substitute variables
        subject = substitute_variables(template["subject"], request.variables)
        body = substitute_variables(template["body"], request.variables)
    else:
        # Use provided subject and body
        subject = request.subject or ""
        body = request.body or ""
    
    # Create email log
    email_log = {
        "id": next_email_log_id,
        "recipient_email": request.recipient_email,
        "recipient_name": request.recipient_name,
        "template_id": request.template_id,
        "subject": subject,
        "body": body,
        "sent_at": datetime.now().isoformat(),
        "status": "pending",
        "error_message": None
    }
    
    email_logs_db[next_email_log_id] = email_log
    next_email_log_id += 1
    
    # In real implementation, this would send the email via SMTP
    # For now, just simulate sending
    email_log["status"] = "sent"
    
    return EmailLogResponse(**email_log)

@router.post("/emails/send/batch", status_code=status.HTTP_202_ACCEPTED)
def send_batch_emails(recipients: List[Dict]):
    sent_count = 0
    failed_count = 0
    
    # Process each recipient
    for recipient in recipients:
        try:
            # Simulate sending
            sent_count += 1
        except Exception as e:
            failed_count += 1
    
    return {
        "total_recipients": len(recipients),
        "sent_count": sent_count,
        "failed_count": failed_count,
        "message": f"Processed {len(recipients)} emails"
    }

@router.get("/emails/logs", response_model=List[EmailLogResponse])
def list_email_logs(
    recipient_email: Optional[str] = None,
    template_id: Optional[int] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_logs = []
    
    for log in email_logs_db.values():
        # Filter by recipient email
        if recipient_email is not None and log["recipient_email"] != recipient_email:
            continue
        
        # Filter by template
        if template_id is not None and log["template_id"] != template_id:
            continue
        
        # Filter by status
        if status is not None and log["status"] != status:
            continue
        
        # Filter by date range
        if date_from and log["sent_at"] < date_from:
            continue
        if date_to and log["sent_at"] > date_to:
            continue
        
        filtered_logs.append(log)
    
    # Sort by sent date (newest first)
    filtered_logs.sort(key=lambda x: x["sent_at"], reverse=True)
    
    # Pagination
    filtered_logs = filtered_logs[skip:skip+limit]
    
    return filtered_logs

@router.get("/emails/logs/{email_log_id}", response_model=EmailLogResponse)
def get_email_log(email_log_id: int):
    log = email_logs_db.get(email_log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Email log not found")
    
    return EmailLogResponse(**log)

@router.get("/emails/logs/summary", status_code=status.HTTP_200_OK)
def get_email_logs_summary(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    filtered_logs = []
    
    for log in email_logs_db.values():
        # Filter by date range
        if date_from and log["sent_at"] < date_from:
            continue
        if date_to and log["sent_at"] > date_to:
            continue
        
        filtered_logs.append(log)
    
    total_emails = len(filtered_logs)
    sent_emails = len([l for l in filtered_logs if l["status"] == "sent"])
    failed_emails = len([l for l in filtered_logs if l["status"] == "failed"])
    
    # Count by status
    status_counts = {}
    for log in filtered_logs:
        status = log["status"]
        if status not in status_counts:
            status_counts[status] = 0
        status_counts[status] += 1
    
    # Count by template
    template_counts = {}
    for log in filtered_logs:
        template_id = log["template_id"]
        if template_id is not None:
            if template_id not in template_counts:
                template_counts[template_id] = 0
            template_counts[template_id] += 1
    
    return {
        "total_emails": total_emails,
        "sent_emails": sent_emails,
        "failed_emails": failed_emails,
        "status_counts": status_counts,
        "template_counts": template_counts,
        "success_rate": round((sent_emails / total_emails) * 100, 2) if total_emails > 0 else 0.0
    }

@router.post("/emails/send-notification", status_code=status.HTTP_200_OK)
def send_notification(
    recipient_email: str,
    recipient_name: str,
    notification_type: str,
    notification_title: str,
    notification_message: str,
    variables: Dict[str, str] = {}
):
    # Map notification types to template
    template_mapping = {
        "welcome": {"template_id": 1, "subject": "欢迎加入", "body": "欢迎来到平台！"},
        "course_enroll": {"template_id": 2, "subject": "课程报名成功", "body": "您已成功报名课程"},
        "assignment_due": {"template_id": 3, "subject": "作业即将到期", "body": "您的作业即将到期"},
        "certificate_earned": {"template_id": 4, "subject": "获得证书", "body": "恭喜获得证书"}
    }
    
    template_info = template_mapping.get(notification_type)
    if not template_info:
        raise HTTPException(status_code=400, detail="Unknown notification type")
    
    # Merge notification variables
    notification_variables = {
        "notification_title": notification_title,
        "notification_message": notification_message
    }
    notification_variables.update(variables)
    
    # Send email
    return send_email(SendEmailRequest(
        recipient_email=recipient_email,
        recipient_name=recipient_name,
        template_id=template_info["template_id"],
        subject=notification_title,
        body=notification_message,
        variables=notification_variables
    ))

@router.get("/emails/templates/categories", status_code=status.HTTP_200_OK)
def get_template_categories():
    categories = {}
    
    for t in email_templates_db.values():
        category = t["category"]
        if category not in categories:
            categories[category] = 0
        categories[category] += 1
    
    return {"categories": categories, "total_categories": len(categories)}

@router.post("/emails/test", status_code=status.HTTP_200_OK)
def test_email(template_id: int, test_email: str):
    template = email_templates_db.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
    
    # Test with sample variables
    sample_variables = {}
    for var in template["variables"]:
        sample_variables[var] = f"测试{var}"
    
    # Create test email
    result = send_email(SendEmailRequest(
        recipient_email=test_email,
        recipient_name="测试用户",
        template_id=template_id,
        variables=sample_variables
    ))
    
    return {
        "message": "Test email sent successfully",
        "test_email": test_email,
        "email_log_id": result.id
    }
