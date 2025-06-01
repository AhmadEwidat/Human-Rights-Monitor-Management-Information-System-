from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from pymongo import MongoClient
import bcrypt
from fastapi.middleware.cors import CORSMiddleware
import jwt
from datetime import datetime, timedelta

from routes.report import router as report_router
from routes.cases import router as cases_router
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Include routers
app.include_router(report_router, prefix="/reports")
app.include_router(cases_router)

# Static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(
    "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/"
    "human_rights_mis?retryWrites=true&w=majority"
)
db = client["human_rights_mis"]
users = db["users"]
case_types = db["case_types"]

# JWT settings
SECRET_KEY = "secret123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Login model
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
async def login_user(user: LoginRequest):
    found_user = users.find_one({"username": user.username})
    if not found_user:
        raise HTTPException(status_code=401, detail="Username not found")
    
    if not bcrypt.checkpw(
        user.password.encode("utf-8"),
        found_user["password_hash"].encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Incorrect password")

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(found_user["_id"]),
        "username": found_user["username"],
        "role": found_user["role"],
        "exp": expire
    }
    access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users")
async def get_users():
    data = []
    for user in users.find():
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        data.append(user)
    return {"users": data}

@app.get("/case-types")
async def get_case_types():
    types = list(case_types.find({}, {"_id": 0}))
    return types

@app.get("/ping")
async def ping():
    return {"status": "ok"}
