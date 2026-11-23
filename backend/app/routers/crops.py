from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Crop
from app.schemas.crop import CropOut

router = APIRouter(prefix="/crops", tags=["Crops"])

@router.get("", response_model=List[CropOut])
def get_all_crops(db: Session = Depends(get_db)):
    crops = db.query(Crop).order_id = db.query(Crop).order_by(Crop.crop_name).all()
    return crops

@router.get("/{crop_id}", response_model=CropOut)
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")
    return crop
