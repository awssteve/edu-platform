"""
Learning Report Export Module
学习报告导出模块
功能：可以导出学习报告（PDF、CSV、Excel）
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import csv
import io

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for learning reports (mock data)
learning_reports_db = {}

class ReportExportRequest(BaseModel):
    report_type: str  # student, course, school, progress, grades
    export_format: str  # pdf, csv, excel, json
    date_from: Optional[str] = None  # ISO format datetime
    date_to: Optional[str] = None  # ISO format datetime
    student_id: Optional[int] = None
    course_id: Optional[int] = None
    school_id: Optional[int] = None
    include_details: bool = True

class ReportExportResponse(BaseModel):
    id: int
    report_type: str
    export_format: str
    file_name: str
    generated_at: str
    file_size: int
    download_url: str

def generate_csv_report(report_data: List[dict], report_type: str) -> str:
    """Generate CSV report from data"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers based on report type
    if report_type == "student":
        writer.writerow([
            "Student ID", "Student Name", "Email", "Total Courses",
            "Completed Courses", "Total Study Hours", "Average Grade"
        ])
        
        for data in report_data:
            writer.writerow([
                data.get("student_id", ""),
                data.get("student_name", ""),
                data.get("email", ""),
                data.get("total_courses", 0),
                data.get("completed_courses", 0),
                data.get("total_study_hours", 0),
                data.get("average_grade", 0)
            ])
    
    elif report_type == "course":
        writer.writerow([
            "Course ID", "Course Name", "Teacher", "Category",
            "Total Enrollments", "Completions", "Average Rating"
        ])
        
        for data in report_data:
            writer.writerow([
                data.get("course_id", ""),
                data.get("course_name", ""),
                data.get("teacher_name", ""),
                data.get("category", ""),
                data.get("total_enrollments", 0),
                data.get("completions", 0),
                data.get("average_rating", 0)
            ])
    
    elif report_type == "progress":
        writer.writerow([
            "Student ID", "Student Name", "Course ID", "Course Name",
            "Completion Percentage", "Last Activity", "Study Time (hours)"
        ])
        
        for data in report_data:
            writer.writerow([
                data.get("student_id", ""),
                data.get("student_name", ""),
                data.get("course_id", ""),
                data.get("course_name", ""),
                data.get("completion_percentage", 0),
                data.get("last_activity", ""),
                data.get("study_time_hours", 0)
            ])
    
    elif report_type == "grades":
        writer.writerow([
            "Student ID", "Student Name", "Course ID", "Course Name",
            "Assignment ID", "Assignment Title", "Score", "Max Score",
            "Percentage", "Submitted At", "Graded At"
        ])
        
        for data in report_data:
            writer.writerow([
                data.get("student_id", ""),
                data.get("student_name", ""),
                data.get("course_id", ""),
                data.get("course_name", ""),
                data.get("assignment_id", ""),
                data.get("assignment_title", ""),
                data.get("score", 0),
                data.get("max_score", 100),
                data.get("percentage", 0),
                data.get("submitted_at", ""),
                data.get("graded_at", "")
            ])
    
    return output.getvalue()

def generate_json_report(report_data: List[dict], report_type: str) -> str:
    """Generate JSON report from data"""
    import json
    return json.dumps({
        "report_type": report_type,
        "generated_at": datetime.now().isoformat(),
        "report_data": report_data
    }, indent=2, ensure_ascii=False)

def generate_html_report(report_data: List[dict], report_type: str) -> str:
    """Generate HTML report from data"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{report_type.title()} Report</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            h1 {{ color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }}
            table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #007bff; color: white; }}
            tr:nth-child(even) {{ background-color: #f2f2f2; }}
            .stats {{ background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <h1>{report_type.title()} Report</h1>
        <p>Generated at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
    """
    
    # Add summary statistics
    html += "<div class='stats'><h2>Summary</h2>"
    if report_type == "student" and report_data:
        total_students = len(report_data)
        total_courses = sum(d.get("total_courses", 0) for d in report_data)
        avg_study_time = round(sum(d.get("total_study_hours", 0) for d in report_data) / total_students, 2) if total_students > 0 else 0
        
        html += f"<p>Total Students: {total_students}</p>"
        html += f"<p>Total Course Enrollments: {total_courses}</p>"
        html += f"<p>Average Study Time: {avg_study_time} hours</p>"
    
    html += "</div>"
    
    # Add table
    html += "<table>"
    
    # Generate headers based on report type
    if report_type == "student":
        html += "<tr><th>Student ID</th><th>Student Name</th><th>Email</th><th>Total Courses</th><th>Completed Courses</th><th>Total Study Hours</th><th>Average Grade</th></tr>"
        
        for data in report_data:
            html += f"""
            <tr>
                <td>{data.get("student_id", "")}</td>
                <td>{data.get("student_name", "")}</td>
                <td>{data.get("email", "")}</td>
                <td>{data.get("total_courses", 0)}</td>
                <td>{data.get("completed_courses", 0)}</td>
                <td>{data.get("total_study_hours", 0)}</td>
                <td>{data.get("average_grade", 0)}</td>
            </tr>
            """
    
    html += "</table></body></html>"
    
    return html

@router.post("/reports/export", response_model=ReportExportResponse, status_code=status.HTTP_201_CREATED)
def export_report(request: ReportExportRequest):
    # Validate request
    if request.report_type not in ["student", "course", "school", "progress", "grades"]:
        raise HTTPException(status_code=400, detail="Invalid report type")
    
    if request.export_format not in ["pdf", "csv", "excel", "json"]:
        raise HTTPException(status_code=400, detail="Invalid export format")
    
    # Generate mock report data (in real implementation, this would fetch from database)
    report_data = generate_mock_report_data(
        report_type=request.report_type,
        student_id=request.student_id,
        course_id=request.course_id,
        school_id=request.school_id,
        date_from=request.date_from,
        date_to=request.date_to
    )
    
    # Generate file based on format
    file_name = f"{request.report_type}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    file_size = 0
    file_content = ""
    content_type = "text/plain"
    
    if request.export_format == "csv":
        file_content = generate_csv_report(report_data, request.report_type)
        file_name += ".csv"
        content_type = "text/csv"
        file_size = len(file_content.encode('utf-8'))
    
    elif request.export_format == "json":
        file_content = generate_json_report(report_data, request.report_type)
        file_name += ".json"
        content_type = "application/json"
        file_size = len(file_content.encode('utf-8'))
    
    elif request.export_format == "excel":
        # Simulate Excel by using CSV with BOM
        file_content = "\ufeff" + generate_csv_report(report_data, request.report_type)
        file_name += ".xlsx"  # Mock Excel extension
        content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        file_size = len(file_content.encode('utf-8'))
    
    elif request.export_format == "pdf":
        # Simulate PDF by using HTML
        file_content = generate_html_report(report_data, request.report_type)
        file_name += ".html"  # Mock PDF (use HTML for now)
        content_type = "text/html"
        file_size = len(file_content.encode('utf-8'))
    
    # In real implementation, store file content
    # For now, just return metadata
    
    return ReportExportResponse(
        id=len(learning_reports_db) + 1,
        report_type=request.report_type,
        export_format=request.export_format,
        file_name=file_name,
        generated_at=datetime.now().isoformat(),
        file_size=file_size,
        download_url=f"/api/v1/reports/{len(learning_reports_db) + 1}/download"
    )

@router.get("/reports/download/{report_id}", status_code=status.HTTP_200_OK)
def download_report(report_id: int):
    # In real implementation, fetch file content
    # For now, return mock file
    
    # Generate mock CSV content
    mock_content = "Student ID,Student Name,Email\n1,John Doe,john@example.com\n"
    
    return FileResponse(
        content=mock_content.encode('utf-8'),
        filename=f"report_{report_id}.csv",
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="report_{report_id}.csv"'}
    )

@router.get("/reports/templates", status_code=status.HTTP_200_OK)
def get_report_templates():
    templates = [
        {
            "id": 1,
            "name": "Student Progress Report",
            "description": "Comprehensive report of student learning progress",
            "report_type": "student",
            "available_formats": ["pdf", "csv", "excel", "json"],
            "fields": ["student_id", "student_name", "email", "total_courses", "completed_courses", "total_study_hours", "average_grade"]
        },
        {
            "id": 2,
            "name": "Course Performance Report",
            "description": "Report showing course performance metrics",
            "report_type": "course",
            "available_formats": ["pdf", "csv", "excel", "json"],
            "fields": ["course_id", "course_name", "teacher", "category", "total_enrollments", "completions", "average_rating"]
        },
        {
            "id": 3,
            "name": "Grades Report",
            "description": "Report showing all student grades",
            "report_type": "grades",
            "available_formats": ["pdf", "csv", "excel", "json"],
            "fields": ["student_id", "student_name", "course_id", "course_name", "assignment_id", "assignment_title", "score", "max_score", "percentage", "submitted_at", "graded_at"]
        },
        {
            "id": 4,
            "name": "Learning Progress Report",
            "description": "Detailed learning progress for each student",
            "report_type": "progress",
            "available_formats": ["pdf", "csv", "excel", "json"],
            "fields": ["student_id", "student_name", "course_id", "course_name", "completion_percentage", "last_activity", "study_time_hours"]
        },
        {
            "id": 5,
            "name": "School Performance Report",
            "description": "Aggregate performance report for entire school",
            "report_type": "school",
            "available_formats": ["pdf", "csv", "excel", "json"],
            "fields": ["school_id", "school_name", "total_students", "total_teachers", "total_courses", "average_completion_rate", "total_study_hours"]
        }
    ]
    
    return {"templates": templates, "total": len(templates)}

@router.get("/reports/export-history", status_code=status.HTTP_200_OK)
def get_export_history():
    # In real implementation, fetch from database
    # For now, return mock data
    
    return {
        "total_exports": 0,
        "exports": [
            {
                "id": 1,
                "report_type": "student",
                "export_format": "csv",
                "file_name": "student_report_20260329_123456.csv",
                "generated_at": "2026-03-29T12:34:56Z",
                "file_size": 1024,
                "downloaded": False
            },
            {
                "id": 2,
                "report_type": "grades",
                "export_format": "pdf",
                "file_name": "grades_report_20260329_112233.pdf",
                "generated_at": "2026-03-29T11:22:33Z",
                "file_size": 2048,
                "downloaded": True,
                "downloaded_at": "2026-03-29T11:30:00Z"
            }
        ]
    }

@router.get("/reports/summary", status_code=status.HTTP_200_OK)
def get_reports_summary():
    # In real implementation, fetch from database
    return {
        "total_exports": 0,
        "exports_by_type": {
            "student": 0,
            "course": 0,
            "school": 0,
            "progress": 0,
            "grades": 0
        },
        "exports_by_format": {
            "pdf": 0,
            "csv": 0,
            "excel": 0,
            "json": 0
        },
        "total_file_size_bytes": 0,
        "total_file_size_mb": 0.0
    }

def generate_mock_report_data(report_type: str, student_id: Optional[int], course_id: Optional[int], school_id: Optional[int], date_from: Optional[str], date_to: Optional[str]) -> List[dict]:
    """Generate mock report data based on type and filters"""
    
    if report_type == "student":
        if student_id:
            # Single student report
            return [{
                "student_id": student_id,
                "student_name": "John Doe",
                "email": "john@example.com",
                "total_courses": 5,
                "completed_courses": 3,
                "total_study_hours": 150.5,
                "average_grade": 85.2
            }]
        else:
            # All students report
            return [
                {
                    "student_id": 1,
                    "student_name": "John Doe",
                    "email": "john@example.com",
                    "total_courses": 5,
                    "completed_courses": 3,
                    "total_study_hours": 150.5,
                    "average_grade": 85.2
                },
                {
                    "student_id": 2,
                    "student_name": "Jane Smith",
                    "email": "jane@example.com",
                    "total_courses": 7,
                    "completed_courses": 4,
                    "total_study_hours": 200.3,
                    "average_grade": 92.1
                },
                {
                    "student_id": 3,
                    "student_name": "Bob Johnson",
                    "email": "bob@example.com",
                    "total_courses": 3,
                    "completed_courses": 1,
                    "total_study_hours": 75.8,
                    "average_grade": 78.5
                }
            ]
    
    elif report_type == "course":
        if course_id:
            # Single course report
            return [{
                "course_id": course_id,
                "course_name": "Python Programming",
                "teacher": "Dr. Smith",
                "category": "Computer Science",
                "total_enrollments": 150,
                "completions": 75,
                "average_rating": 4.5
            }]
        else:
            # All courses report
            return [
                {
                    "course_id": 1,
                    "course_name": "Python Programming",
                    "teacher": "Dr. Smith",
                    "category": "Computer Science",
                    "total_enrollments": 150,
                    "completions": 75,
                    "average_rating": 4.5
                },
                {
                    "course_id": 2,
                    "course_name": "Web Development",
                    "teacher": "Prof. Johnson",
                    "category": "Computer Science",
                    "total_enrollments": 200,
                    "completions": 100,
                    "average_rating": 4.8
                }
            ]
    
    elif report_type == "progress":
        return [
            {
                "student_id": 1,
                "student_name": "John Doe",
                "course_id": 1,
                "course_name": "Python Programming",
                "completion_percentage": 75.5,
                "last_activity": "2026-03-28T10:30:00Z",
                "study_time_hours": 150.5
            },
            {
                "student_id": 1,
                "student_name": "John Doe",
                "course_id": 2,
                "course_name": "Web Development",
                "completion_percentage": 45.0,
                "last_activity": "2026-03-27T15:45:00Z",
                "study_time_hours": 50.3
            }
        ]
    
    elif report_type == "grades":
        return [
            {
                "student_id": 1,
                "student_name": "John Doe",
                "course_id": 1,
                "course_name": "Python Programming",
                "assignment_id": 1,
                "assignment_title": "Assignment 1",
                "score": 85,
                "max_score": 100,
                "percentage": 85.0,
                "submitted_at": "2026-03-28T10:00:00Z",
                "graded_at": "2026-03-28T12:00:00Z"
            },
            {
                "student_id": 1,
                "student_name": "John Doe",
                "course_id": 1,
                "course_name": "Python Programming",
                "assignment_id": 2,
                "assignment_title": "Assignment 2",
                "score": 92,
                "max_score": 100,
                "percentage": 92.0,
                "submitted_at": "2026-03-29T09:00:00Z",
                "graded_at": "2026-03-29T10:00:00Z"
            }
        ]
    
    else:  # school
        if school_id:
            # Single school report
            return [{
                "school_id": school_id,
                "school_name": "Example School",
                "total_students": 500,
                "total_teachers": 25,
                "total_courses": 30,
                "average_completion_rate": 75.0,
                "total_study_hours": 15000
            }]
        else:
            # All schools report
            return [
                {
                    "school_id": 1,
                    "school_name": "Example School",
                    "total_students": 500,
                    "total_teachers": 25,
                    "total_courses": 30,
                    "average_completion_rate": 75.0,
                    "total_study_hours": 15000
                },
                {
                    "school_id": 2,
                    "school_name": "Test School",
                    "total_students": 300,
                    "total_teachers": 15,
                    "total_courses": 20,
                    "average_completion_rate": 80.0,
                    "total_study_hours": 9000
                }
            ]
