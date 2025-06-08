from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
from datetime import datetime
import jwt
import os
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# إعدادات FastAPI
router = APIRouter()

# بيانات الاتصال بقاعدة البيانات MongoDB
uri = os.getenv("MONGO_URI", "mongodb+srv://your_db_credentials")  # استخدام متغير البيئة للتخزين الآمن
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["human_rights_mis"]
case_types_collection = db["case_types"]

# إعداد JWT
SECRET_KEY = os.getenv("SECRET_KEY", "secret123")  # استخدام متغير البيئة لتخزين السر
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# نموذج لتمثيل تحديث الحالة
class StatusUpdate(BaseModel):
    status: str
    comment: Optional[str] = None

# وظيفة للتحقق من صلاحية التوكن
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

# وظيفة للتحقق من صلاحيات المشرف
async def get_admin_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return token
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# وظيفة لتحويل ObjectId إلى String
def convert_objectid_to_str(data):
    if isinstance(data, list):
        return [convert_objectid_to_str(item) for item in data]
    if isinstance(data, dict):
        return {key: convert_objectid_to_str(value) for key, value in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    return data

# إعداد CORS: السماح للواجهة الأمامية من الوصول إلى الخادم
def add_cors_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # السماح بكل النطاقات أو تحديد نطاقات معينة
        allow_credentials=True,
        allow_methods=["*"],  # السماح بكل الطرق (GET, POST, etc.)
        allow_headers=["*"],  # السماح بكل الهيدرز
    )

# مسار لاسترجاع أنواع القضايا
@router.get("/case-types")
async def get_case_types(pending_only: bool = False):
    query = {"pending": True} if pending_only else {"pending": {"$ne": True}}
    case_types = list(case_types_collection.find(query))
    for c in case_types:
        c["_id"] = str(c["_id"])  # تحويل ObjectId إلى String
    return case_types

@router.post("/case-types")
async def suggest_case_type(name: str):
    if not name or len(name.strip()) < 3:
        raise HTTPException(status_code=400, detail="Invalid case type name")
    case_type = {"name": name, "pending": True, "created_at": datetime.utcnow()}
    result = case_types_collection.insert_one(case_type)
    return {"message": "Suggestion submitted", "case_type_id": str(result.inserted_id)}


# مسار للموافقة أو الرفض على نوع القضية
@router.put("/case-types/{case_id}/approval")
async def update_case_approval(case_id: str, approved: bool, token: str = Depends(get_admin_token)):
    if not ObjectId.is_valid(case_id):
        raise HTTPException(status_code=400, detail="Invalid case ID")
    update = {"pending": False} if approved else {"rejected": True}
    result = case_types_collection.update_one({"_id": ObjectId(case_id)}, {"$set": update})
    if result.modified_count:
        return {"message": "Updated successfully"}
    raise HTTPException(status_code=404, detail="Case not found")
