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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# MongoDB connection
client = MongoClient(
    "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/"
    "human_rights_mis?retryWrites=true&w=majority"
)
db = client["human_rights_mis"]
users = db["users"]
case_types = db["case_types"]
institutions = db["institutions"]

# JWT settings
SECRET_KEY = "secret123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class LoginRequest(BaseModel):
    username: str
    password: str

class InstitutionProfile(BaseModel):
    institution_name: Dict[str, str]  # {ar: string, en: string}
    username: str
    active: bool = True
    created_at: Optional[datetime] = None

# Helper function to get current institution
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
        
        if institution_id is None:
            logger.error("No institution ID in token payload")
            raise credentials_exception
            
        if role != "institution":
            logger.error(f"Invalid role: {role}. Expected: institution")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Institution role required."
            )
            
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise credentials_exception
    
    try:
        institution = users.find_one({"_id": ObjectId(institution_id), "role": "institution"})
        if institution is None:
            logger.error(f"No institution found with ID: {institution_id}")
            raise credentials_exception
        return institution
    except Exception as e:
        logger.error(f"Database error while fetching institution: {str(e)}")
        raise credentials_exception

@app.post("/login")
async def login_user(user: LoginRequest):
    try:
        # Find the user by username
        found_user = users.find_one({"username": user.username})
        if not found_user:
            logger.warning(f"Login attempt failed: User not found for username {user.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )

        # Verify password
        if not bcrypt.checkpw(
            user.password.encode("utf-8"),
            found_user["password_hash"].encode("utf-8")
        ):
            logger.warning(f"Login attempt failed: Invalid password for username {user.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )

        # Create access token
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": str(found_user["_id"]),
            "username": found_user["username"],
            "role": found_user["role"],
            "exp": expire
        }
        access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        logger.info(f"Successful login for user: {user.username} with role: {found_user['role']}")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": found_user["role"]
        }
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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

# Institution Profile Endpoints
@app.get("/institution/profile/")
async def get_institution_profile(current_institution: dict = Depends(get_current_institution)):
    try:
        profile = users.find_one({"_id": current_institution["_id"]})
        if not profile:
            # Create a default profile if none exists
            default_profile = {
                "_id": current_institution["_id"],
                "institution_name": {
                    "ar": "",
                    "en": ""
                },
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
        logger.error(f"Error in get_institution_profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
            raise HTTPException(status_code=404, detail="Institution profile not found")
        
        updated_profile = users.find_one({"_id": current_institution["_id"]})
        updated_profile["_id"] = str(updated_profile["_id"])
        return updated_profile
    except Exception as e:
        logger.error(f"Error in update_institution_profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
