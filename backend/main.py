from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
import bcrypt
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# 🔧 إعداد التطبيق
app = FastAPI()

# ✅ إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # غيّر هذا في الإنتاج
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ الاتصال بقاعدة MongoDB Atlas
client = MongoClient("mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/human_rights_mis?retryWrites=true&w=majority")
db = client["human_rights_mis"]
users = db["users"]

# ✅ نموذج بيانات تسجيل الدخول
class LoginRequest(BaseModel):
    username: str
    password: str

# ✅ API: تسجيل الدخول
@app.post("/login")
def login_user(user: LoginRequest):
    print(user ,"*****8") 
    print (client)
    found_user = users.find_one({"username": user.username})
    print (found_user)
    if not found_user:
        raise HTTPException(status_code=401, detail="Username not found")

    if not bcrypt.checkpw(user.password.encode('utf-8'), found_user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Incorrect password")

    return {
        "message": "Login successful",
        "role": found_user["role"]
    }

# ✅ API: قراءة جميع المستخدمين بدون كلمات السر
@app.get("/users")
def get_users():
    data = []
    for user in users.find():
        user["_id"] = str(user["_id"])  # تحويل ObjectId إلى نص
        user.pop("password")  # إخفاء كلمة المرور
        data.append(user)
    return {"users": data}

@app.get("/ping")
async def ping():
    return {"status": "ok"}
