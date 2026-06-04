from fastapi import APIRouter, UploadFile, File, HTTPException
from services.gemini_service import analyze_crop_image

router = APIRouter(prefix="/api/disease", tags=["Disease Detection"])

@router.post("/detect")
async def detect_disease(file: UploadFile = File(...)):
    # শুধুমাত্র ছবি আপলোড করা হচ্ছে কিনা তা চেক করা
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
        
    # ছবিটিকে বাইট ডেটায় রূপান্তর করা
    image_bytes = await file.read()
    
    # জেমিনি সার্ভিসকে কল করে রেজাল্ট নিয়ে আসা
    analysis_result = await analyze_crop_image(image_bytes, file.content_type)
    
    return {
        "status": "success",
        "data": analysis_result
    }