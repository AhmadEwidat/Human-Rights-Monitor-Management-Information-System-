from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from bson import ObjectId

router = APIRouter()

# اتصال مباشر بقاعدة البيانات
client = MongoClient("mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/human_rights_mis?retryWrites=true&w=majority")
db = client["human_rights_mis"]
cases_collection = db["cases"]

# ✅ Get all cases
@router.get("/cases")
def get_all_cases():
    try:
        cases = list(cases_collection.find().sort("_id", -1))  # جلب كل القضايا
        for case in cases:
            case["_id"] = str(case["_id"])  # تحويل ObjectId لنص
        return cases
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Get a specific case by ID
@router.get("/cases/{case_id}")
def get_case(case_id: str):
    try:
        case = cases_collection.find_one({"_id": ObjectId(case_id)})
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        case["_id"] = str(case["_id"])
        return case
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
