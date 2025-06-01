from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os
from fastapi import Query
from fastapi import Body


router = APIRouter()

# ✅ MongoDB Atlas connection
print("✅ Trying to connect to MongoDB Atlas...")
uri = "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
try:
    client = MongoClient(uri, server_api=ServerApi('1'))
    client.server_info()
    print("✅ MongoDB Atlas connected successfully ✅")
except Exception as e:
    print("❌ MongoDB connection failed:", e)

# 🧠 Database & collections
db = client["human_rights_mis"]
cases_collection = db["cases"]
status_history_collection = db["case_status_history"]

# Upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 🔧 Helpers
def fix_id(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# 📦 Models
class LocalizedText(BaseModel):
    ar: str
    en: str

class ViolationType(BaseModel):
    name_ar: str
    name_en: str

class Coordinates(BaseModel):
    type: str = "Point"
    coordinates: List[float]

class Location(BaseModel):
    country: LocalizedText
    region: LocalizedText
    coordinates: Coordinates

class EvidenceItem(BaseModel):
    type: str
    url: str
    description: Optional[str]
    date_captured: Optional[datetime]

class Case(BaseModel):
    case_id: str
    title: LocalizedText
    description: LocalizedText
    violation_types: List[ViolationType]
    status: str
    priority: str
    location: Location
    date_occurred: datetime
    date_reported: datetime
    evidence: Optional[List[EvidenceItem]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# 🧩 Routes
@router.post("/cases/")
def create_case(case: Case):
    try:
        print("✅ Step 1: case object received")
        case_dict = case.dict()
        print("✅ Step 2: converted to dict:", case_dict)

        case_dict["created_at"] = datetime.utcnow()
        case_dict["updated_at"] = datetime.utcnow()
        print("✅ Step 3: timestamps added")

        result = cases_collection.insert_one(case_dict)
        print("✅ Step 4: inserted with id:", result.inserted_id)

        return {"message": "Case created", "id": str(result.inserted_id)}
    except Exception as e:
        print("❌ Error during case insertion:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cases/")
def get_cases(
    status: Optional[str] = None,
    country: Optional[str] = None,
    violation: Optional[str] = None,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    query = {}

    if status:
        query["status"] = status

    if country:
        query["location.country.en"] = country

    if violation:
        query["violation_types.name_en"] = violation

    if start_date and end_date:
        query["date_occurred"] = {
            "$gte": start_date,
            "$lte": end_date
        }
    elif start_date:
        query["date_occurred"] = { "$gte": start_date }
    elif end_date:
        query["date_occurred"] = { "$lte": end_date }

    results = list(cases_collection.find(query))
    return [fix_id(r) for r in results]

@router.get("/cases/{case_id}")
def get_case(case_id: str):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return fix_id(case)

@router.patch("/cases/{case_id}")
def update_case(case_id: str, updates: dict = Body(...)):
    result = cases_collection.update_one(
        {"_id": ObjectId(case_id)},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")

    # سجل التحديث في سجل التغييرات (اختياري)
    status_history_collection.insert_one({
        "case_id": case_id,
        "status": updates.get("status", "unknown"),
        "changed_at": datetime.utcnow()
    })

    return {"message": "Case updated successfully"}


@router.delete("/cases/{case_id}")
def archive_case(case_id: str):
    result = cases_collection.update_one(
        {"_id": ObjectId(case_id)},
        {
            "$set": {
                "status": "archived",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    
    status_history_collection.insert_one({
        "case_id": case_id,
        "status": "archived",
        "changed_at": datetime.utcnow()
    })
    
    return {"message": "Case archived successfully"}


# 📤 Upload file for a specific case
@router.post("/cases/{case_id}/upload")
async def upload_file(case_id: str, file: UploadFile = File(...)):
    try:
        # تحقق من وجود القضية
        case = cases_collection.find_one({"_id": ObjectId(case_id)})
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        # حفظ الملف
        file_location = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_location, "wb") as f:
            f.write(await file.read())

        # إضافة رابط الملف إلى evidence
        file_url = f"/uploads/{file.filename}"
        evidence_item = {
            "type": file.content_type,
            "url": file_url,
            "description": None,
            "date_captured": datetime.utcnow()
        }

        cases_collection.update_one(
            {"_id": ObjectId(case_id)},
            {"$push": {"evidence": evidence_item}}
        )

        return {"message": "File uploaded successfully", "file_url": file_url}
    except Exception as e:
        print("❌ Error uploading file:", e)
        raise HTTPException(status_code=500, detail=str(e))
