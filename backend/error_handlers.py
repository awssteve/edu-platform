"""
全局错误处理器和日志配置
Global Error Handlers and Logging Configuration
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging
import sys
from datetime import datetime
from typing import Any, Dict, Union


class CustomException(Exception):
    """自定义异常基类"""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_ERROR",
        details: Dict[str, Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationException(CustomException):
    """认证异常"""

    def __init__(self, message: str = "认证失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="AUTHENTICATION_FAILED",
            details=details
        )


class AuthorizationException(CustomException):
    """授权异常"""

    def __init__(self, message: str = "权限不足", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="AUTHORIZATION_FAILED",
            details=details
        )


class ResourceNotFoundException(CustomException):
    """资源不存在异常"""

    def __init__(self, resource: str = "资源", details: Dict[str, Any] = None):
        super().__init__(
            message=f"{resource}不存在",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="RESOURCE_NOT_FOUND",
            details=details
        )


class ValidationException(CustomException):
    """验证异常"""

    def __init__(self, message: str = "数据验证失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            details=details
        )


class BusinessException(CustomException):
    """业务逻辑异常"""

    def __init__(self, message: str, details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="BUSINESS_ERROR",
            details=details
        )


class ExternalServiceException(CustomException):
    """外部服务异常"""

    def __init__(self, service: str, message: str = "外部服务调用失败", details: Dict[str, Any] = None):
        super().__init__(
            message=f"{service}服务调用失败：{message}",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_code="EXTERNAL_SERVICE_ERROR",
            details=details
        )


def setup_logging():
    """配置日志系统"""

    # 创建日志格式
    log_format = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)

    # 文件处理器
    file_handler = logging.FileHandler('logs/app.log', encoding='utf-8')
    file_handler.setFormatter(log_format)

    # 错误文件处理器
    error_handler = logging.FileHandler('logs/error.log', encoding='utf-8')
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(log_format)

    # 配置根日志记录器
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # 清除现有处理器
    root_logger.handlers.clear()

    # 添加处理器
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)

    # 配置特定模块的日志级别
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


async def custom_exception_handler(request: Request, exc: CustomException) -> JSONResponse:
    """自定义异常处理器"""

    error_response = {
        "success": False,
        "error": {
            "code": exc.error_code,
            "message": exc.message,
            "details": exc.details,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    }

    # 记录错误日志
    logger = logging.getLogger(__name__)
    logger.error(
        f"Error: {exc.error_code} - {exc.message}",
        extra={
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "details": exc.details,
            "path": str(request.url)
        }
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """请求验证异常处理器"""

    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    error_response = {
        "success": False,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "请求数据验证失败",
            "details": {"errors": errors},
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    }

    # 记录验证错误
    logger = logging.getLogger(__name__)
    logger.warning(
        f"Validation Error: {errors}",
        extra={"path": str(request.url)}
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """通用异常处理器"""

    error_response = {
        "success": False,
        "error": {
            "code": "INTERNAL_SERVER_ERROR",
            "message": "服务器内部错误",
            "details": {"detail": str(exc)} if isinstance(exc, CustomException) else {},
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    }

    # 记录未捕获的异常
    logger = logging.getLogger(__name__)
    logger.exception(
        f"Unhandled Exception: {type(exc).__name__} - {str(exc)}",
        extra={"path": str(request.url)}
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """数据库异常处理器"""

    error_response = {
        "success": False,
        "error": {
            "code": "DATABASE_ERROR",
            "message": "数据库操作失败",
            "details": {"detail": "数据库错误，请稍后重试"},
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    }

    # 记录数据库错误
    logger = logging.getLogger(__name__)
    logger.error(
        f"Database Error: {type(exc).__name__} - {str(exc)}",
        extra={"path": str(request.url)}
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response
    )


def setup_error_handlers(app):
    """设置所有异常处理器"""

    # 自定义异常
    app.add_exception_handler(CustomException, custom_exception_handler)

    # 请求验证异常
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    # 数据库异常
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)

    # 通用异常
    app.add_exception_handler(Exception, general_exception_handler)


# 便捷函数
def log_api_request(request: Request, user_id: str = None):
    """记录API请求"""
    logger = logging.getLogger(__name__)
    logger.info(
        f"API Request: {request.method} {request.url.path}",
        extra={
            "method": request.method,
            "path": str(request.url.path),
            "user_id": user_id,
            "client": request.client.host if request.client else None
        }
    )


def log_api_response(request: Request, status_code: int, duration_ms: float):
    """记录API响应"""
    logger = logging.getLogger(__name__)
    logger.info(
        f"API Response: {request.method} {request.url.path} - {status_code} ({duration_ms:.2f}ms)",
        extra={
            "method": request.method,
            "path": str(request.url.path),
            "status_code": status_code,
            "duration_ms": duration_ms
        }
    )


def log_business_event(event_type: str, **kwargs):
    """记录业务事件"""
    logger = logging.getLogger(__name__)
    logger.info(
        f"Business Event: {event_type}",
        extra={
            "event_type": event_type,
            **kwargs
        }
    )