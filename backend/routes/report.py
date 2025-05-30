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

router = APIRouter()

# الاتصال بقاعدة البيانات
uri = "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["human_rights_mis"]
reports_collection = db["incident_reports"]
evidence_collection = db["report_evidence"]  # ✅ الكولكشن الجديد للأدلة

UPLOAD_DIR = "uploaded_evidence"  # إذا أردت حفظ نسخة محليًا أيضًا (اختياري)
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def submit_report(
    anonymous: bool = Form(...),
    reporter_type: str = Form(...),
    incident_details: str = Form(...),
    created_by: str = Form(...),
    contact_info: Optional[str] = Form(None),
    pseudonym: Optional[str] = Form(None),
    evidence: Union[UploadFile, List[UploadFile], None] = File(None)
):
    try:
        incident = json.loads(incident_details)
        contact = json.loads(contact_info) if contact_info else None

        # التعامل مع التاريخ
        date_str = incident.get("date")
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d") if date_str else None
        except Exception:
            date_obj = None
        incident["date"] = date_obj

        # إنشاء وثيقة التقرير بدون الأدلة
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
        report_id = inserted.inserted_id  # ObjectId للتقرير الجديد

        # رفع الأدلة وتخزينها في كولكشن منفصل
        evidence_ids = []
        if evidence:
            if not isinstance(evidence, list):
                evidence = [evidence]
            if len(evidence) < 1 or len(evidence) > 5:
                raise HTTPException(status_code=400, detail="يجب رفع ملف واحد على الأقل، وبحد أقصى 5 ملفات")

            for file in evidence:
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

        # تحديث التقرير بقائمة الأدلة
        reports_collection.update_one(
            {"_id": report_id},
            {"$set": {"evidence_ids": evidence_ids}}
        )

        return {"message": "تم إرسال التقرير بنجاح", "report_id": str(report_id)}

    except Exception as e:
        print("صار خطأ أثناء الإرسال:", str(e))
        return JSONResponse(status_code=500, content={"message": "خطأ أثناء إرسال التقرير: " + str(e)})
