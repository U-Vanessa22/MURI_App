from fastapi import APIRouter, Depends
from fastapi import HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.api.deps import require_it_user
from app.schemas.auth_schema import RegisterRequest

router = APIRouter()
ORG_DOMAIN = "@icttoolsasm.com"


class ResetPasswordRequest(BaseModel):
    new_password: str = Field(min_length=8)


class UpdateUserStatusRequest(BaseModel):
    is_active: bool

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/create-user")
def create_user(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_it_user),
):

    if not payload.email.endswith(ORG_DOMAIN):
        raise HTTPException(status_code=400, detail="Use organization email")

    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(payload.password)

    user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        department=payload.department,
        station=payload.station,
        password=hashed,
        role=(payload.role or "USER").upper(),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created successfully"}


@router.get("/")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_it_user),
):
    users = db.query(User).order_by(User.created_at.desc()).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "department": user.department,
            "station": user.station,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
        }
        for user in users
    ]


@router.get("/it-personnel")
def list_it_personnel(db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .filter(func.lower(User.role) == "it", User.is_active.is_(True))
        .order_by(User.created_at.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "department": user.department,
            "station": user.station,
            "role": user.role,
        }
        for user in users
    ]


@router.patch("/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_it_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully"}


@router.patch("/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: UpdateUserStatusRequest,
    db: Session = Depends(get_db),
    current_it_user: User = Depends(require_it_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_it_user.id and not payload.is_active:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")

    user.is_active = payload.is_active
    db.commit()
    return {"message": "User status updated successfully"}