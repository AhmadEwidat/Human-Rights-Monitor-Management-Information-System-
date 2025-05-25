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

    cases = db["cases"]

    cases.insert_many([  # ✅ استخدم insert_many في Python
        {
            "case_id": "HRM-2025-0001",
            "title": {"ar": "اعتقال تعسفي في مدينة نابلس", "en": "Arbitrary Arrest in Nablus"},
            "description": {
                "ar": "تعرض شاب فلسطيني للاعتقال دون أمر قضائي أثناء عبوره أحد الحواجز.",
                "en": "A Palestinian youth was arbitrarily arrested while crossing a checkpoint."
            },
            "violation_types": [{"name_ar": "اعتقال تعسفي", "name_en": "Arbitrary Arrest"}],
            "status": "new",
            "priority": "high",
            "location": {
                "country": {"ar": "فلسطين", "en": "Palestine"},
                "region": {"ar": "نابلس", "en": "Nablus"},
                "coordinates": {"type": "Point", "coordinates": [35.2603, 32.2211]}
            },
            "date_occurred": datetime(2025, 5, 20),
            "date_reported": datetime(2025, 5, 21)
        },
        {
            "case_id": "HRM-2025-0002",
            "title": {"ar": "اعتقال أطفال في القدس", "en": "Child Arrest in Jerusalem"},
            "description": {
                "ar": "تم اعتقال طفلين خلال مواجهات في البلدة القديمة.",
                "en": "Two children were arrested during clashes in the Old City."
            },
            "violation_types": [{"name_ar": "اعتقال أطفال", "name_en": "Child Arrest"}],
            "status": "new",
            "priority": "medium",
            "location": {
                "country": {"ar": "فلسطين", "en": "Palestine"},
                "region": {"ar": "القدس", "en": "Jerusalem"},
                "coordinates": {"type": "Point", "coordinates": [35.2255, 31.7784]}
            },
            "date_occurred": datetime(2025, 5, 18),
            "date_reported": datetime(2025, 5, 19)
        },
        {
            "case_id": "HRM-2025-0003",
            "title": {"ar": "حاجز عسكري يمنع تنقل المواطنين", "en": "Military Checkpoint Blocking Movement"},
            "description": {
                "ar": "إغلاق حاجز مفاجئ أدى إلى احتجاز عشرات المركبات لعدة ساعات.",
                "en": "A sudden checkpoint closure trapped dozens of vehicles for hours."
            },
            "violation_types": [{"name_ar": "حواجز عسكرية", "name_en": "Military Checkpoints"}],
            "status": "new",
            "priority": "low",
            "location": {
                "country": {"ar": "فلسطين", "en": "Palestine"},
                "region": {"ar": "الخليل", "en": "Hebron"},
                "coordinates": {"type": "Point", "coordinates": [35.0953, 31.5326]}
            },
            "date_occurred": datetime(2025, 5, 17),
            "date_reported": datetime(2025, 5, 18)
        },
        {
            "case_id": "HRM-2025-0004",
            "title": {"ar": "إطلاق نار على مدنيين", "en": "Shooting at Civilians"},
            "description": {
                "ar": "إطلاق نار على مجموعة من الشباب بالقرب من الجدار الفاصل.",
                "en": "Shooting at a group of youth near the separation wall."
            },
            "violation_types": [{"name_ar": "إطلاق نار على مدنيين", "name_en": "Shooting at Civilians"}],
            "status": "under_investigation",
            "priority": "high",
            "location": {
                "country": {"ar": "فلسطين", "en": "Palestine"},
                "region": {"ar": "قلقيلية", "en": "Qalqilya"},
                "coordinates": {"type": "Point", "coordinates": [35.0104, 32.1902]}
            },
            "date_occurred": datetime(2025, 5, 15),
            "date_reported": datetime(2025, 5, 16)
        },
        {
            "case_id": "HRM-2025-0005",
            "title": {"ar": "هدم منازل في بيت لحم", "en": "Home Demolitions in Bethlehem"},
            "description": {
                "ar": "قوات الاحتلال قامت بهدم منزلين بحجة البناء دون ترخيص.",
                "en": "Israeli forces demolished two homes citing lack of permits."
            },
            "violation_types": [{"name_ar": "هدم منازل", "name_en": "Home Demolition"}],
            "status": "resolved",
            "priority": "high",
            "location": {
                "country": {"ar": "فلسطين", "en": "Palestine"},
                "region": {"ar": "بيت لحم", "en": "Bethlehem"},
                "coordinates": {"type": "Point", "coordinates": [35.2024, 31.7054]}
            },
            "date_occurred": datetime(2025, 5, 10),
            "date_reported": datetime(2025, 5, 11)
        },
        {
            "case_id": "HRM-2025-0006",
            "title": {"ar": "تهجير قسري لعائلات في الأغوار", "en": "Forced Displacement in the Jordan Valley"},
            "description": {
                "ar": "تم تهجير عدة عائلات من مساكنهم بسبب التدريبات العسكرية.",
                "en": "Several families were forcibly displaced due to military training."
            },
            "violation_types": [{"name_ar": "تهجير قسري", "name_en": "Forced Displacement"}],
            "status": "under_investigation",
            "priority": "high",
            "location": {
                "country": {"ar": "فلسطين", "en": "Palestine"},
                "region": {"ar": "الأغوار", "en": "Jordan Valley"},
                "coordinates": {"type": "Point", "coordinates": [35.536, 32.3125]}
            },
            "date_occurred": datetime(2025, 5, 8),
            "date_reported": datetime(2025, 5, 9)
        },
        {
            "case_id": "HRM-2025-0007",
            "title": {"ar": "تفتيش منازل في رام الله", "en": "Home Raids in Ramallah"},
            "description": {
                "ar": "اقتحمت القوات عدة منازل في منتصف الليل وتم تفتيشها بعنف.",
                "en": "Forces raided several homes at midnight and searched them violently."
            },
            "violation_types": [{"name_ar": "تفتيش منازل", "name_en": "Home Search"}],
            "status": "new",
            "priority": "medium",
            "location": {
                "country": {"ar": "فلسطين", "en": "Palestine"},
                "region": {"ar": "رام الله", "en": "Ramallah"},
                "coordinates": {"type": "Point", "coordinates": [35.2073, 31.9025]}
            },
            "date_occurred": datetime(2025, 5, 6),
            "date_reported": datetime(2025, 5, 7)
        },
        {
            "case_id": "HRM-2025-0008",
            "title": {"ar": "اعتداء مستوطنين على مزارعين", "en": "Settler Attack on Farmers"},
            "description": {
                "ar": "قام مستوطنون بالاعتداء على مزارعين أثناء قطف الزيتون.",
                "en": "Settlers attacked farmers during the olive harvest."
            },
            "violation_types": [{"name_ar": "اعتداء مستوطنين", "name_en": "Settler Violence"}],
            "status": "new",
            "priority": "medium",
            "location": {
                "country": {"ar": "فلسطين", "en": "Palestine"},
                "region": {"ar": "سلفيت", "en": "Salfit"},
                "coordinates": {"type": "Point", "coordinates": [35.1719, 32.0805]}
            },
            "date_occurred": datetime(2025, 5, 3),
            "date_reported": datetime(2025, 5, 4)
        },
        {
            "case_id": "HRM-2025-0009",
            "title": {"ar": "منع الوصول للخدمات الطبية", "en": "Denial of Access to Medical Services"},
            "description": {
                "ar": "تم منع سيارة إسعاف من الوصول إلى الجرحى بسبب الحواجز.",
                "en": "An ambulance was blocked from reaching the wounded due to checkpoints."
            },
            "violation_types": [{"name_ar": "منع الوصول للخدمات", "name_en": "Denial of Services"}],
            "status": "new",
            "priority": "high",
            "location": {
                "country": {"ar": "فلسطين", "en": "Palestine"},
                "region": {"ar": "جنين", "en": "Jenin"},
                "coordinates": {"type": "Point", "coordinates": [35.2978, 32.4658]}
            },
            "date_occurred": datetime(2025, 5, 1),
            "date_reported": datetime(2025, 5, 2)
        }
        
    ])

    print("✅ All cases inserted successfully!")

except Exception as e:
    print("❌ Error:", e)
