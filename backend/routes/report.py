from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
import jwt
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
from typing import List, Optional, Union
import json
import os
import shutil
import uuid
from datetime import datetime
from geopy.geocoders import Nominatim
from pydantic import BaseModel

# إعداد الراوتر
router = APIRouter()
class StatusUpdate(BaseModel):
    status: str  # حقل إلزامي
    comment: str | None = None
# إعدادات الاتصال بقاعدة البيانات
uri = "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["human_rights_mis"]
reports_collection = db["incident_reports"]
evidence_collection = db["report_evidence"]

# إعداد مجلد الرفع
UPLOAD_DIR = "uploaded_evidence"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# إعداد الموقع الجغرافي
geolocator = Nominatim(user_agent="human_rights_mis")

# إعدادات JWT
SECRET_KEY = "secret123"  # استبدل هذا بمفتاح سري قوي وآمن
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# دالة للتحقق من التوكن
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("username")
        role = payload.get("role")
        if username is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# دالة للتحقق من توكن الإداري
async def get_admin_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return token
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# دالة مساعدة لتحويل ObjectId إلى نصوص
def convert_objectid_to_str(data):
    if isinstance(data, list):
        return [convert_objectid_to_str(item) for item in data]
    if isinstance(data, dict):
        return {key: convert_objectid_to_str(value) for key, value in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    return data

# نقطة نهاية لجلب التقارير
@router.get("/")
async def get_reports(
    status: str = None,
    start_date: str = None,
    end_date: str = None,
    location: str = None,
    pending_only: bool = False,  # New parameter to fetch pending reports
    current_user: dict = Depends(get_current_user)
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
                query["created_at"]["$lte"] = datetime.fromisoformat(end_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format (e.g., 2025-05-01T00:00:00)")
        if location:
            query["incident_details.location.country"] = location

        # If pending_only is True, only fetch pending reports (admin only)
        if pending_only:
            if current_user["role"] != "admin":
                raise HTTPException(status_code=403, detail="Admin access required for pending reports")
            query["pending_approval"] = True
        else:
            # For non-admins or regular queries, only show approved reports
            if current_user["role"] != "admin":
                query["pending_approval"] = {"$ne": True}

        reports = list(reports_collection.find(query))
        # Convert ObjectIds to strings and handle nested ObjectIds
        for report in reports:
            report["id"] = str(report["_id"])
            del report["_id"]
            if "evidence_ids" in report:
                report["evidence_ids"] = [str(eid) for eid in report["evidence_ids"]]
            if "case_id" in report:
                report["case_id"] = str(report["case_id"])
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
    location_str: str = Form(...),
    case_id: Optional[str] = Form(None)
):
    try:
        incident = json.loads(incident_details)
        contact = json.loads(contact_info) if contact_info else None

        # تحديد الموقع الجغرافي
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
            "pending_approval": True,
            "created_at": datetime.utcnow()
        }

        if case_id:
            doc["case_id"] = ObjectId(case_id)

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
@router.get("/case-types")
async def get_case_types():
    # بيانات ثابتة، يمكن استبدالها ببيانات من قاعدة بيانات
    case_types = [
        {"name_en": "Torture", "name_ar": "التعذيب"},
        {"name_en": "Arrest", "name_ar": "الاعتقال"},
        {"name_en": "Discrimination", "name_ar": "التمييز"},
    ]
    return case_types
# نقطة نهاية لإنشاء قضية جديدة مع تقرير
@router.post("/cases/new-with-report/")
async def create_new_case_with_report(
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
            "status": "pending",
            "pending_approval": True,
            "created_at": datetime.utcnow()
        }

        inserted = reports_collection.insert_one(doc)
        case_id = inserted.inserted_id

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
                        "report_id": case_id,
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
            {"_id": case_id},
            {"$set": {"evidence_ids": evidence_ids}}
        )

        return {"message": "تم تقديم القضية الجديدة بنجاح، بانتظار الموافقة", "case_id": str(case_id)}

    except Exception as e:
        print("صار خطأ أثناء الإرسال:", str(e))
        return JSONResponse(status_code=500, content={"message": "خطأ أثناء إرسال القضية: " + str(e)})


    
@router.get("/cases")
async def get_cases(current_user: dict = Depends(get_current_user)):
    try:
        if current_user["role"] != "institution" and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")

        query = {}
        # Non-admins only see approved cases
        if current_user["role"] != "admin":
            query["pending_approval"] = {"$ne": True}

        cases = list(reports_collection.find(query, {"_id": 0}))
        for case in cases:
            case["id"] = str(case.get("_id", case.get("id")))
        cases = convert_objectid_to_str(cases)
        return {"cases": cases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.put("/cases/{case_id}/status")
async def update_case_status(case_id: str, status_data: StatusUpdate, admin_token: str = Depends(get_admin_token)):
    if not admin_token:
        raise HTTPException(status_code=403, detail="Unauthorized: Admin access required")
    try:
        # Validate case_id format
        if not ObjectId.is_valid(case_id):
            raise HTTPException(status_code=400, detail=f"Invalid case ID format: {case_id}")

        # Check if case exists
        case = reports_collection.find_one({"_id": ObjectId(case_id)})
        if not case:
            raise HTTPException(status_code=404, detail=f"Case not found with ID: {case_id}")

        # Validate status
        if status_data.status not in ["approved", "rejected"]:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status_data.status}")

        # Prepare update data
        update_data = {
            "status": status_data.status,
            "pending_approval": False,
            "updated_at": datetime.utcnow()
        }
        
        if status_data.comment:
            update_data["rejection_comment"] = status_data.comment
        
        # Update the case
        result = reports_collection.update_one(
            {"_id": ObjectId(case_id)},
            {"$set": update_data}
        )

        if result.modified_count > 0:
            return {
                "message": f"Case status updated to {status_data.status}",
                "case_id": case_id,
                "status": status_data.status
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update case status")

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Error updating case status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")