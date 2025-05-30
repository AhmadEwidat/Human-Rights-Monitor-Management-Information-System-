from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional, Union
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
import os
import shutil
import uuid
import json
from bson import ObjectId
from geopy.geocoders import Nominatim

router = APIRouter()

# الاتصال بقاعدة البيانات
uri = "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["human_rights_mis"]
reports_collection = db["incident_reports"]
evidence_collection = db["report_evidence"]

UPLOAD_DIR = "uploaded_evidence"
os.makedirs(UPLOAD_DIR, exist_ok=True)

geolocator = Nominatim(user_agent="human_rights_mis")

# دالة مساعدة لتحويل ObjectId إلى نصوص
def convert_objectid_to_str(data):
    if isinstance(data, list):
        return [convert_objectid_to_str(item) for item in data]
    if isinstance(data, dict):
        return {key: convert_objectid_to_str(value) for key, value in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    return data

@router.get("/")
async def get_reports(
    status: str = None,
    start_date: str = None,
    end_date: str = None,
    location: str = None
):
    try:
        query = {}
        if status:
            query["status"] = status
        if start_date:
            try:
                query["created_at"] = {"$gte": datetime.fromisoformat(start_date)}
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid start_date format. Use ISO format (e.g., 2025-05-01T00:00:00)")
        if end_date:
            try:
                if "created_at" not in query:
                    query["created_at"] = {}
                query["created_at"]["$lte"] = datetime.fromisoformat(end_date)  # إزالة القوس الزائد
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format (e.g., 2025-05-01T00:00:00)")
        if location:
            query["incident_details.location.country"] = location

        reports = list(reports_collection.find(query, {"_id": 0, "evidence_ids": 0}))
        reports = convert_objectid_to_str(reports)
        return {"reports": reports}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")

@router.post("/")
async def submit_report(
    anonymous: bool = Form(...),
    reporter_type: str = Form(...),
    incident_details: str = Form(...),
    created_by: str = Form(...),
    contact_info: Optional[str] = Form(None),
    pseudonym: Optional[str] = Form(None),
    evidence: Union[UploadFile, List[UploadFile], None] = File(None),
    location_str: str = Form(...)
):
    try:
        incident = json.loads(incident_details)
        contact = json.loads(contact_info) if contact_info else None

        try:
            location = geolocator.geocode(location_str)
            if location:
                incident["location"] = {
                    "country": location.address.split(",")[-1].strip(),
                    "coordinates": {"type": "Point", "coordinates": [location.longitude, location.latitude]}
                }
            else:
                incident["location"] = {"country": location_str, "coordinates": None}
        except Exception as e:
            incident["location"] = {"country": location_str, "coordinates": None}
            print(f"Geolocation error: {str(e)}")

        date_str = incident.get("date")
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d") if date_str else None
        except Exception:
            date_obj = None
        incident["date"] = date_obj

        doc = {
            "reporter_type": reporter_type,
            "anonymous": anonymous,
            "pseudonym": pseudonym if anonymous else None,
            "contact_info": contact if not anonymous else None,
            "incident_details": incident,
            "created_by": created_by,
            "status": "new",
            "created_at": datetime.utcnow()
        }

        inserted = reports_collection.insert_one(doc)
        report_id = inserted.inserted_id

        evidence_ids = []
        if evidence:
            if not isinstance(evidence, list):
                evidence = [evidence]
            if len(evidence) < 1 or len(evidence) > 5:
                raise HTTPException(status_code=400, detail="يجب رفع ملف واحد على الأقل، وبحد أقصى 5 ملفات")

            for file in evidence:
                try:
                    ext = file.filename.split(".")[-1]
                    file_id = f"{uuid.uuid4()}.{ext}"
                    file_path = os.path.join(UPLOAD_DIR, file_id)
                    with open(file_path, "wb") as buffer:
                        shutil.copyfileobj(file.file, buffer)

                    evidence_doc = {
                        "report_id": report_id,
                        "filename": file.filename,
                        "stored_as": file_id,
                        "content_type": file.content_type,
                        "path": file_path,
                        "uploaded_at": datetime.utcnow()
                    }

                    result = evidence_collection.insert_one(evidence_doc)
                    evidence_ids.append(result.inserted_id)
                except Exception as e:
                    print(f"Error uploading file {file.filename}: {str(e)}")
                    continue

        reports_collection.update_one(
            {"_id": report_id},
            {"$set": {"evidence_ids": evidence_ids}}
        )

        return {"message": "تم إرسال التقرير بنجاح", "report_id": str(report_id)}

    except Exception as e:
        print("صار خطأ أثناء الإرسال:", str(e))
        return JSONResponse(status_code=500, content={"message": "خطأ أثناء إرسال التقرير: " + str(e)})