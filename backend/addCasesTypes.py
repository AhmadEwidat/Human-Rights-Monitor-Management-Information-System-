from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# الاتصال
uri = "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("✅ Connected to MongoDB!")

    db = client["human_rights_mis"]
    case_types = db["case_types"]

    case_types.insert_many([
        { "name_ar": "اعتقال تعسفي", "name_en": "Arbitrary Arrest" },
        { "name_ar": "اعتقال أطفال", "name_en": "Child Arrest" },
        { "name_ar": "حواجز عسكرية", "name_en": "Military Checkpoints" },
        { "name_ar": "إطلاق نار على مدنيين", "name_en": "Shooting at Civilians" },
        { "name_ar": "هدم منازل", "name_en": "Home Demolition" },
        { "name_ar": "تهجير قسري", "name_en": "Forced Displacement" },
        { "name_ar": "تفتيش منازل", "name_en": "Home Search" },
        { "name_ar": "اعتداء مستوطنين", "name_en": "Settler Violence" },
        { "name_ar": "منع الوصول للخدمات", "name_en": "Denial of Services" },
        { "name_ar": "اقتحامات", "name_en": "Raids" },
        { "name_ar": "الاعتداء على النساء", "name_en": "Violence Against Women" },
        { "name_ar": "تدمير البنية التحتية", "name_en": "Infrastructure Destruction" }
    ])

    print("✅ Case types inserted successfully!")

except Exception as e:
    print("❌ Error:", e)
