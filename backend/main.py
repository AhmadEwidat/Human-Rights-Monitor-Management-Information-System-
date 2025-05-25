from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
import bcrypt
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from routes.report import router as report_router  # ✅ هنا نضيف الراوتر

app = FastAPI()
app.include_router(report_router, prefix="/reports")  # ✅ وهنا نفعّله

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# الاتصال بقاعدة MongoDB Atlas
client = MongoClient("mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/human_rights_mis?retryWrites=true&w=majority")
db = client["human_rights_mis"]
users = db["users"]
case_types = db["case_types"]

# نموذج تسجيل الدخول
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login_user(user: LoginRequest):
    found_user = users.find_one({"username": user.username})
    if not found_user:
        raise HTTPException(status_code=401, detail="Username not found")
    if not bcrypt.checkpw(user.password.encode('utf-8'), found_user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"message": "Login successful", "role": found_user["role"]}

@app.get("/users")
def get_users():
    data = []
    for user in users.find():
        user["_id"] = str(user["_id"])
        user.pop("password")
        data.append(user)
    return {"users": data}

@app.get("/ping")
async def ping():
    return {"status": "ok"}

@app.get("/case-types")
def get_case_types():
    types = list(case_types.find({}, {"_id": 0}))
    return types
