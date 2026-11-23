from typing import Dict, Any
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import ProductionData, Crop
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Report Generation"])

@router.post("/pdf")
def download_pdf_report(payload: Dict[str, Any]):
    pdf_buffer = report_service.generate_pdf_report(payload)
    crop_name = payload.get("crop_name", "OilCrop").replace(" ", "_")
    filename = f"OilCrop_Intelligence_Report_{crop_name}.pdf"
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/excel")
def download_excel_report(payload: Dict[str, Any], db: Session = Depends(get_db)):
    crop_name = payload.get("crop_name", "Soybean")
    
    # Fetch historical production records for the crop
    records = db.query(ProductionData).join(Crop).filter(Crop.crop_name == crop_name).order_by(ProductionData.year.desc()).all()
    hist_list = [
        {
            "crop_name": r.crop.crop_name,
            "region": r.region,
            "year": r.year,
            "season": r.season,
            "cultivated_area": r.cultivated_area,
            "production": r.production,
            "yield_per_ha": r.yield_per_ha
        }
        for r in records
    ]

    excel_buffer = report_service.generate_excel_report(payload, hist_list)
    filename = f"OilCrop_Intelligence_Data_{crop_name.replace(' ', '_')}.xlsx"
    
    return Response(
        content=excel_buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
