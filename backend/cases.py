from fastapi import APIRouter
from pymongo import DESCENDING
from bson import ObjectId
from config import db  # أو db من main مباشرة

router = APIRouter()

@router.get("/cases/latest")
async def get_latest_cases():
    cases_collection = db["cases"]
    cursor = cases_collection.find().sort("date_occurred", DESCENDING).limit(5)

    latest_cases = []
    for case in cursor:
        latest_cases.append({
            "id": str(case["_id"]),
            "title": case.get("title", {}).get("ar", "بدون عنوان"),
            "date": case.get("date_occurred", "")[:10],
            "region": case.get("location", {}).get("region", "غير محدد"),
            "type": case.get("violation_types", ["غير محدد"])[0]
        })

    return latest_cases
