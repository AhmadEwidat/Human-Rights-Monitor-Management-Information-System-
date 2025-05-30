from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime

# الاتصال بقاعدة البيانات
uri = "mongodb+srv://asma:asmaasma@cluster0.kbgepxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("✅ Connected to MongoDB!")

    db = client["human_rights_mis"]

    # حذف مجموعة institutions إذا موجودة (اختياري، للتجربة)
    if "institutions" in db.list_collection_names():
        db.drop_collection("institutions")
        print("⚠️ Dropped existing 'institutions' collection")

    institutions = db["institutions"]

    institutions.insert_many([
        {
            "name": {"ar": "اتحاد لجان المرأة الفلسطينية", "en": "Union of Palestinian Women's Committees"},
            "description": {
                "ar": "منظمة تعمل على تعزيز حقوق المرأة في فلسطين.",
                "en": "An organization working to promote women's rights in Palestine."
            },
            "contact_info": {
                "email": "contact@upwc.ps",
                "phone": "+970123456789"
            },
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": {"ar": "الجمعية الفلسطينية لحماية حقوق الإنسان", "en": "Palestinian Society for Human Rights Protection"},
            "description": {
                "ar": "جمعية تعنى بحماية حقوق الإنسان في فلسطين.",
                "en": "Society dedicated to protecting human rights in Palestine."
            },
            "contact_info": {
                "email": "info@pshrp.ps",
                "phone": "+970987654321"
            },
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": {"ar": "القوس للتعددية الجنسية والجندرية", "en": "Al-Qaws for Sexual and Gender Diversity"},
            "description": {
                "ar": "منظمة تهتم بحقوق التعددية الجنسية والجندرية في فلسطين.",
                "en": "Organization focused on sexual and gender diversity rights in Palestine."
            },
            "contact_info": {
                "email": "contact@alqaws.org",
                "phone": "+970112233445"
            },
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": {"ar": "المجموعة الفلسطينية لمراقبة حقوق الإنسان", "en": "Palestinian Group for Human Rights Monitoring"},
            "description": {
                "ar": "مجموعة تراقب وتنشر انتهاكات حقوق الإنسان في فلسطين.",
                "en": "Group that monitors and reports human rights violations in Palestine."
            },
            "contact_info": {
                "email": "info@pghrm.ps",
                "phone": "+970556677889"
            },
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": {"ar": "المركز الفلسطيني لحقوق الإنسان", "en": "Palestinian Center for Human Rights"},
            "description": {
                "ar": "مركز رائد في مجال حقوق الإنسان في فلسطين.",
                "en": "Leading center in human rights advocacy in Palestine."
            },
            "contact_info": {
                "email": "contact@pchrgaza.org",
                "phone": "+970998877665"
            },
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": {"ar": "المركز الفلسطيني لمعلومات حقوق الإنسان", "en": "Palestinian Information Center for Human Rights"},
            "description": {
                "ar": "مركز معلومات متخصص في حقوق الإنسان.",
                "en": "Information center specialized in human rights."
            },
            "contact_info": {
                "email": "info@pichr.ps",
                "phone": "+970334455667"
            },
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": {"ar": "الهيئة الفلسطينية للإعلام وتفعيل دور الشباب", "en": "Palestinian Media and Youth Empowerment Commission"},
            "description": {
                "ar": "هيئة تعمل على تعزيز دور الإعلام والشباب في فلسطين.",
                "en": "Commission that enhances media and youth roles in Palestine."
            },
            "contact_info": {
                "email": "contact@pmyec.ps",
                "phone": "+970776655443"
            },
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": {"ar": "الهيئة المستقلة لحقوق الإنسان", "en": "Independent Commission for Human Rights"},
            "description": {
                "ar": "هيئة مستقلة معنية بحقوق الإنسان في فلسطين.",
                "en": "Independent commission concerned with human rights in Palestine."
            },
            "contact_info": {
                "email": "info@ichr.ps",
                "phone": "+970221144335"
            },
            "active": True,
            "created_at": datetime.utcnow()
        }
    ])

    print("✅ All institutions inserted successfully!")

except Exception as e:
    print("❌ Error:", e)
