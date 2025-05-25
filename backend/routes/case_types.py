# backend/routes/case_types.py
from fastapi import APIRouter
from pymongo import MongoClient

router = APIRouter()

client = MongoClient("mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/?retryWrites=true&w=majority")
db = client["human_rights_mis"]
case_types_collection = db["case_types"]

@router.get("/case-types")
def get_case_types():
    return list(case_types_collection.find({}, {"_id": 0}))
