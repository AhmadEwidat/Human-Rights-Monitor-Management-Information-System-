from fastapi import APIRouter, Form, UploadFile, File
from fastapi.responses import JSONResponse
from typing import List, Optional, Union
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
import os
import shutil
import uuid
import json

router = APIRouter()

# الاتصال بقاعدة البيانات
uri = "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["human_rights_mis"]
collection = db["incident_reports"]

UPLOAD_DIR = "uploaded_evidence"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def submit_report(
    anonymous: bool = Form(...),
    reporter_type: str = Form(...),
    incident_details: str = Form(...),
    contact_info: Optional[str] = Form(None),
    pseudonym: Optional[str] = Form(None),
    evidence: Union[UploadFile, List[UploadFile], None] = File(None)
):
    try:
        # جربت أفك الـ json عشان أستخدم البيانات
        incident = json.loads(incident_details)
        contact = json.loads(contact_info) if contact_info else None

        # قائمة للملفات اللي رح أحفظها
        files = []
        if evidence:
            if isinstance(evidence, UploadFile):
                evidence = [evidence]
            for file in evidence:
                ext = file.filename.split(".")[-1]
                file_id = f"{uuid.uuid4()}.{ext}"
                file_path = os.path.join(UPLOAD_DIR, file_id)
                # بحفظ الملف هنا
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                files.append({
                    "filename": file.filename,
                    "stored_as": file_id,
                    "content_type": file.content_type,
                    "path": file_path,
                })

        # التعامل مع التاريخ (لو فاضي بحطه None)
        date_str = incident.get("date")
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d") if date_str else None
        except Exception:
            date_obj = None
        incident["date"] = date_obj

        # إنشاء الدوكيومنت النهائي
        doc = {
            "reporter_type": reporter_type,
            "anonymous": anonymous,
            "pseudonym": pseudonym if anonymous else None,
            "contact_info": contact if not anonymous else None,
            "incident_details": incident,
            "evidence": files,
            "status": "new",
            "created_at": datetime.utcnow()
        }

        collection.insert_one(doc)
        return {"message": "تم إرسال التقرير بنجاح"}

    except Exception as e:
        print("صار خطأ أثناء الإرسال:", str(e))
        return JSONResponse(status_code=500, content={"message": "خطأ أثناء إرسال التقرير: " + str(e)})
