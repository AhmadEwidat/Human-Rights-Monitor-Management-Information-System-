from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from pymongo import MongoClient
import bcrypt
from fastapi.middleware.cors import CORSMiddleware
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict
from bson import ObjectId
import logging
from fastapi.staticfiles import StaticFiles

# إعداد اللوج
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# إنشاء التطبيق
app = FastAPI()

# تضمين المسارات (routers)
from routes.report import router as report_router
from routes.cases import router as cases_router

app.include_router(report_router, prefix="/reports")
app.include_router(cases_router)

# الملفات الثابتة
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# الاتصال بـ MongoDB
client = MongoClient(
    "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/"
    "human_rights_mis?retryWrites=true&w=majority"
)
db = client["human_rights_mis"]
users = db["users"]
case_types = db["case_types"]
institutions = db["institutions"]

# إعدادات JWT
SECRET_KEY = "secret123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# النماذج
class LoginRequest(BaseModel):
    username: str
    password: str

class InstitutionProfile(BaseModel):
    institution_name: Dict[str, str]
    username: str
    active: bool = True
    created_at: Optional[datetime] = None

# استخراج المؤسسة الحالية من التوكن
async def get_current_institution(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="لا يمكن التحقق من بيانات الاعتماد",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        institution_id: str = payload.get("sub")
        role: str = payload.get("role")

        if institution_id is None or role != "institution":
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="انتهت صلاحية الرمز",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError as e:
        raise credentials_exception

    try:
        institution = users.find_one({"_id": ObjectId(institution_id), "role": "institution"})
        if institution is None:
            raise credentials_exception
        return institution
    except Exception as e:
        raise credentials_exception

# تسجيل الدخول
@app.post("/login")
async def login_user(user: LoginRequest):
    try:
        found_user = users.find_one({"username": user.username})
        if not found_user:
            raise HTTPException(status_code=401, detail="اسم المستخدم أو كلمة المرور غير صحيحة")

        if not bcrypt.checkpw(user.password.encode("utf-8"), found_user["password_hash"].encode("utf-8")):
            raise HTTPException(status_code=401, detail="اسم المستخدم أو كلمة المرور غير صحيحة")

        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": str(found_user["_id"]),
            "username": found_user["username"],
            "role": found_user["role"],
            "exp": expire
        }
        access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": found_user["role"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# استعراض جميع المستخدمين
@app.get("/users")
async def get_users():
    data = []
    for user in users.find():
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        data.append(user)
    return {"users": data}

# استعراض أنواع القضايا
@app.get("/case-types")
async def get_case_types():
    types = list(case_types.find({}, {"_id": 0}))
    return types

# اختبار الاتصال
@app.get("/ping")
async def ping():
    return {"status": "ok"}

# الحصول على بروفايل المؤسسة
@app.get("/institution/profile/")
async def get_institution_profile(current_institution: dict = Depends(get_current_institution)):
    try:
        profile = users.find_one({"_id": current_institution["_id"]})
        if not profile:
            default_profile = {
                "_id": current_institution["_id"],
                "institution_name": {"ar": "", "en": ""},
                "username": current_institution.get("username", ""),
                "active": True,
                "created_at": datetime.utcnow()
            }
            users.update_one(
                {"_id": current_institution["_id"]},
                {"$set": default_profile},
                upsert=True
            )
            profile = default_profile

        profile["_id"] = str(profile["_id"])
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# تحديث بروفايل المؤسسة
@app.put("/institution/profile/update/")
async def update_institution_profile(
    profile_data: InstitutionProfile,
    current_institution: dict = Depends(get_current_institution)
):
    try:
        update_data = profile_data.dict(exclude_unset=True)
        result = users.update_one(
            {"_id": current_institution["_id"]},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="لم يتم العثور على بروفايل المؤسسة")

        updated_profile = users.find_one({"_id": current_institution["_id"]})
        updated_profile["_id"] = str(updated_profile["_id"])
        return updated_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
