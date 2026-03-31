"""
User Permission Management Module
用户权限管理模块
功能：管理员可以管理用户权限、角色分配
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for user roles
user_roles_db = {}

# Simple database for user permissions
user_permissions_db = {}
next_permission_id = 1

# Simple database for permissions (permission definitions)
permissions_db = {
    1: {"id": 1, "name": "create_course", "display_name": "Create Course", "category": "courses", "description": "Can create new courses"},
    2: {"id": 2, "name": "edit_course", "display_name": "Edit Course", "category": "courses", "description": "Can edit existing courses"},
    3: {"id": 3, "name": "delete_course", "display_name": "Delete Course", "category": "courses", "description": "Can delete courses"},
    4: {"id": 4, "name": "view_all_users", "display_name": "View All Users", "category": "users", "description": "Can view all users in the system"},
    5: {"id": 5, "name": "manage_roles", "display_name": "Manage Roles", "category": "admin", "description": "Can manage user roles and permissions"},
    6: {"id": 6, "name": "view_analytics", "display_name": "View Analytics", "category": "analytics", "description": "Can view system analytics"},
    7: {"id": 7, "name": "export_reports", "display_name": "Export Reports", "category": "reports", "description": "Can export system reports"},
    8: {"id": 8, "name": "manage_school", "display_name": "Manage School", "category": "school", "description": "Can manage school settings"}
}

# Role definitions
roles_db = {
    "student": {
        "name": "Student",
        "description": "Regular student user",
        "default_permissions": [4],  # view_all_users
        "is_admin": False
    },
    "teacher": {
        "name": "Teacher",
        "description": "Can create and manage courses",
        "default_permissions": [1, 2, 4],  # create_course, edit_course, view_all_users
        "is_admin": False
    },
    "school_admin": {
        "name": "School Admin",
        "description": "Can manage school users and settings",
        "default_permissions": [1, 2, 4, 5, 8],  # create_course, edit_course, view_all_users, manage_roles, manage_school
        "is_admin": True
    },
    "system_admin": {
        "name": "System Admin",
        "description": "Full system access",
        "default_permissions": [1, 2, 3, 4, 5, 6, 7, 8],  # All permissions
        "is_admin": True
    }
}

class UserPermissionCreate(BaseModel):
    user_id: int
    permission_id: int
    granted_by: int  # User ID who granted this permission

class UserPermissionResponse(BaseModel):
    id: int
    user_id: int
    permission_id: int
    permission_name: str
    permission_display_name: str
    granted_by: int
    granted_at: str
    expires_at: Optional[str]

class UserRoleCreate(BaseModel):
    user_id: int
    role: str
    granted_by: int

class UserRoleResponse(BaseModel):
    id: int
    user_id: int
    role: str
    role_name: str
    granted_by: int
    granted_at: str
    permissions: List[int]

@router.get("/permissions", status_code=status.HTTP_200_OK)
def list_permissions(category: Optional[str] = None):
    filtered_permissions = []
    
    for perm in permissions_db.values():
        if category and perm["category"] != category:
            continue
        filtered_permissions.append(perm)
    
    return {"permissions": filtered_permissions, "total": len(filtered_permissions)}

@router.get("/roles", status_code=status.HTTP_200_OK)
def list_roles():
    roles = []
    for role_key, role_data in roles_db.items():
        roles.append({
            "key": role_key,
            "name": role_data["name"],
            "description": role_data["description"],
            "default_permissions": role_data["default_permissions"],
            "is_admin": role_data["is_admin"]
        })
    
    return {"roles": roles}

@router.get("/roles/{role_key}", status_code=status.HTTP_200_OK)
def get_role_details(role_key: str):
    role = roles_db.get(role_key)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Get permissions for this role
    permissions = []
    for perm_id in role["default_permissions"]:
        perm = permissions_db.get(perm_id)
        if perm:
            permissions.append(perm)
    
    return {
        "key": role_key,
        "name": role["name"],
        "description": role["description"],
        "default_permissions": role["default_permissions"],
        "is_admin": role["is_admin"],
        "permissions": permissions
    }

@router.post("/users/permissions", response_model=UserPermissionResponse, status_code=status.HTTP_201_CREATED)
def grant_permission(request: UserPermissionCreate):
    global next_permission_id
    
    # Check if permission exists
    permission = permissions_db.get(request.permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Check if user already has this permission
    for p in user_permissions_db.values():
        if p["user_id"] == request.user_id and p["permission_id"] == request.permission_id:
            raise HTTPException(status_code=400, detail="User already has this permission")
    
    # Create new permission grant
    new_permission = {
        "id": next_permission_id,
        "user_id": request.user_id,
        "permission_id": request.permission_id,
        "permission_name": permission["name"],
        "permission_display_name": permission["display_name"],
        "granted_by": request.granted_by,
        "granted_at": datetime.now().isoformat(),
        "expires_at": None  # Never expires
    }
    
    user_permissions_db[next_permission_id] = new_permission
    next_permission_id += 1
    
    return UserPermissionResponse(**new_permission)

@router.get("/users/{user_id}/permissions", response_model=List[UserPermissionResponse])
def get_user_permissions(user_id: int):
    filtered_permissions = []
    
    for p in user_permissions_db.values():
        if p["user_id"] == user_id:
            filtered_permissions.append(p)
    
    return filtered_permissions

@router.delete("/users/permissions/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_permission(permission_id: int):
    permission = user_permissions_db.get(permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    del user_permissions_db[permission_id]
    
    return None

@router.post("/users/roles", response_model=UserRoleResponse, status_code=status.HTTP_201_CREATED)
def assign_role(request: UserRoleCreate):
    global next_permission_id
    
    # Check if role exists
    role = roles_db.get(request.role)
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Revoke all existing permissions for this user
    # (In real implementation, this would be more sophisticated)
    existing_perms = [p_id for p_id, p in user_permissions_db.items() if p["user_id"] == request.user_id]
    for p_id in existing_perms:
        del user_permissions_db[p_id]
    
    # Grant all default permissions for this role
    granted_permissions = []
    for perm_id in role["default_permissions"]:
        permission = permissions_db.get(perm_id)
        if permission:
            new_permission = {
                "id": next_permission_id,
                "user_id": request.user_id,
                "permission_id": perm_id,
                "permission_name": permission["name"],
                "permission_display_name": permission["display_name"],
                "granted_by": request.granted_by,
                "granted_at": datetime.now().isoformat(),
                "expires_at": None
            }
            
            user_permissions_db[next_permission_id] = new_permission
            granted_permissions.append(new_permission)
            next_permission_id += 1
    
    return UserRoleResponse(
        id=0,
        user_id=request.user_id,
        role=request.role,
        role_name=role["name"],
        granted_by=request.granted_by,
        granted_at=datetime.now().isoformat(),
        permissions=[p["permission_id"] for p in granted_permissions]
    )

@router.get("/users/{user_id}/role", status_code=status.HTTP_200_OK)
def get_user_role(user_id: int):
    # Get all permissions for this user
    user_perms = []
    for p in user_permissions_db.values():
        if p["user_id"] == user_id:
            user_perms.append(p["permission_id"])
    
    # Check which role has the most matching permissions
    user_role = "student"  # Default
    max_match_count = 0
    
    for role_key, role_data in roles_db.items():
        match_count = len(set(role_data["default_permissions"]) & set(user_perms))
        if match_count > max_match_count:
            max_match_count = match_count
            user_role = role_key
    
    return {
        "user_id": user_id,
        "role": user_role,
        "role_name": roles_db[user_role]["name"],
        "is_admin": roles_db[user_role]["is_admin"],
        "permission_ids": user_perms
    }

@router.post("/users/{user_id}/permissions/batch", status_code=status.HTTP_201_CREATED)
def grant_permissions_batch(user_id: int, permission_ids: List[int], granted_by: int):
    global next_permission_id
    
    granted_permissions = []
    
    for perm_id in permission_ids:
        permission = permissions_db.get(perm_id)
        if not permission:
            continue
        
        # Check if user already has this permission
        already_has = False
        for p in user_permissions_db.values():
            if p["user_id"] == user_id and p["permission_id"] == perm_id:
                already_has = True
                break
        
        if not already_has:
            new_permission = {
                "id": next_permission_id,
                "user_id": user_id,
                "permission_id": perm_id,
                "permission_name": permission["name"],
                "permission_display_name": permission["display_name"],
                "granted_by": granted_by,
                "granted_at": datetime.now().isoformat(),
                "expires_at": None
            }
            
            user_permissions_db[next_permission_id] = new_permission
            granted_permissions.append(new_permission)
            next_permission_id += 1
    
    return {
        "user_id": user_id,
        "total_permissions": len(user_perms) if 'user_perms' in locals() else 0,
        "newly_granted": len(granted_permissions),
        "permissions": granted_permissions
    }

@router.get("/users/{user_id}/effective-permissions", status_code=status.HTTP_200_OK)
def get_effective_permissions(user_id: int):
    # Get all permissions for this user (both granted and from role)
    effective_permission_ids = set()
    
    # Directly granted permissions
    for p in user_permissions_db.values():
        if p["user_id"] == user_id:
            effective_permission_ids.add(p["permission_id"])
    
    # Permissions from user's role
    user_role_perms = []
    for p in user_permissions_db.values():
        if p["user_id"] == user_id:
            user_role_perms.append(p["permission_id"])
    
    effective_permissions = []
    for perm_id in effective_permission_ids:
        perm = permissions_db.get(perm_id)
        if perm:
            effective_permissions.append(perm)
    
    return {
        "user_id": user_id,
        "total_permissions": len(effective_permission_ids),
        "permissions": effective_permissions
    }

@router.post("/users/roles/{role_key}/update-defaults", status_code=status.HTTP_200_OK)
def update_role_defaults(role_key: str, permission_ids: List[int]):
    role = roles_db.get(role_key)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Validate all permissions exist
    for perm_id in permission_ids:
        if perm_id not in permissions_db:
            raise HTTPException(status_code=400, detail=f"Permission {perm_id} not found")
    
    # Update role defaults
    role["default_permissions"] = permission_ids
    
    return {
        "role_key": role_key,
        "role_name": role["name"],
        "new_default_permissions": permission_ids,
        "updated_at": datetime.now().isoformat()
    }

@router.get("/permissions/summary", status_code=status.HTTP_200_OK)
def get_permissions_summary():
    # Count users by permission
    permission_counts = {}
    for p in user_permissions_db.values():
        perm_id = p["permission_id"]
        if perm_id not in permission_counts:
            permission_counts[perm_id] = 0
        permission_counts[perm_id] += 1
    
    # Count users by role
    role_counts = {}
    for p in user_permissions_db.values():
        user_role = get_user_role(p["user_id"])["role"]
        if user_role not in role_counts:
            role_counts[user_role] = 0
        role_counts[user_role] += 1
    
    return {
        "total_permissions": len(permissions_db),
        "total_roles": len(roles_db),
        "total_permission_grants": len(user_permissions_db),
        "permission_counts": permission_counts,
        "role_counts": role_counts
    }
