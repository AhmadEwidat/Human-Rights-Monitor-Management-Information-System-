from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from dependencies import get_db
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def apply_date_filters(pipeline, start_date_str: Optional[str] = None, end_date_str: Optional[str] = None, date_field: str = "$created_at"):
    date_match_stage = {}
    if start_date_str:
        try:
            start_date = datetime.fromisoformat(start_date_str)
            if 'T' not in start_date_str:
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            date_match_stage["$gte"] = start_date
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.")
    if end_date_str:
        try:
            end_date = datetime.fromisoformat(end_date_str)
            if 'T' not in end_date_str:
                end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            date_match_stage["$lte"] = end_date
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.")

    if date_match_stage:
        pipeline.append({"$match": {date_field: date_match_stage}})
    return pipeline


async def get_aggregated_data(
    db: AsyncIOMotorClient,
    collection_name: str,
    date_field: str,
    violation_field: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    location_country: Optional[str] = None,
    location_region: Optional[str] = None,
    violation_type: Optional[str] = None,
    group_by_field: str = None
):
    pipeline = []

    match_criteria = {}
    if location_country:
        if collection_name == "cases":
            match_criteria["location.country"] = location_country
        elif collection_name == "incident_reports":
            match_criteria["incident_details.location.country"] = location_country

    if location_region:
        if collection_name == "cases":
            match_criteria["location.region"] = location_region
        elif collection_name == "incident_reports":
            match_criteria["incident_details.location.region"] = location_region

    pipeline = apply_date_filters(pipeline, start_date, end_date, date_field)

    if match_criteria:
        pipeline.append({"$match": match_criteria})

    if violation_field.endswith('violation_types'):
        pipeline.append({"$unwind": f"${violation_field}"})
        if violation_type:
            pipeline.append({"$match": {violation_field: violation_type}})
    elif violation_type and group_by_field == violation_field:
            pipeline.append({"$match": {violation_field: violation_type}})

    if group_by_field:
        pipeline.append({"$group": {"_id": f"${group_by_field}", "count": {"$sum": 1}}})
        pipeline.append({"$sort": {"count": -1}})
    else:
        pipeline.append({"$count": "total_count"})

    return await db[collection_name].aggregate(pipeline).to_list(None)


async def aggregate_collection(
    db: AsyncIOMotorClient,
    collection_name: str,
    date_field_path: str,
    time_unit: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    location_country: Optional[str] = None,
    location_region: Optional[str] = None,
    violation_type: Optional[str] = None
):
    pipeline = []

    match_criteria = {}
    if location_country:
        if collection_name == "cases":
            match_criteria["location.country"] = location_country
        elif collection_name == "incident_reports":
            match_criteria["incident_details.location.country"] = location_country
    if location_region:
        if collection_name == "cases":
            match_criteria["location.region"] = location_region
        elif collection_name == "incident_reports":
            match_criteria["incident_details.location.region"] = location_region

    pipeline = apply_date_filters(pipeline, start_date, end_date, date_field_path)

    if match_criteria:
        pipeline.append({"$match": match_criteria})

    if violation_type:
        violation_field_path_in_collection = ""
        if collection_name == "cases":
            violation_field_path_in_collection = "violation_types"
        elif collection_name == "incident_reports":
            violation_field_path_in_collection = "incident_details.violation_types"

        if violation_field_path_in_collection:
            pipeline.append({"$unwind": f"${violation_field_path_in_collection}"})
            pipeline.append({"$match": {violation_field_path_in_collection: violation_type}})

    pipeline.append({
        "$addFields": {
            "converted_date": {
                "$toDate": date_field_path
            }
        }
    })

    format_string = {
        "day": "%Y-%m-%d",
        "week": "%Y-%W",
        "month": "%Y-%m",
        "year": "%Y"
    }

    pipeline.append({
        "$group": {
            "_id": {"$dateToString": {"format": format_string[time_unit], "date": "$converted_date"}},
            "count": {"$sum": 1}
        }
    })
    pipeline.append({"$sort": {"_id": 1}})

    return await db[collection_name].aggregate(pipeline).to_list(None)


@router.get("/violations", summary="Count violations by type")
async def count_violations_by_type(
    db: AsyncIOMotorClient = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    location_country: Optional[str] = Query(None, description="Filter by country"),
    location_region: Optional[str] = Query(None, description="Filter by region")
):
    results = {}

    cases_pipeline = []
    cases_pipeline = apply_date_filters(cases_pipeline, start_date, end_date, "$date_occurred")
    if location_country:
        cases_pipeline.append({"$match": {"location.country": location_country}})
    if location_region:
        cases_pipeline.append({"$match": {"location.region": location_region}})
    cases_pipeline.append({"$unwind": "$violation_types"})
    cases_pipeline.append({"$group": {"_id": "$violation_types", "count": {"$sum": 1}}})
    cases_pipeline.append({"$project": {"violation_type": "$_id", "count": 1, "_id": 0}})

    cases_data = await db["cases"].aggregate(cases_pipeline).to_list(None)

    for item in cases_data:
        results[item["violation_type"]] = results.get(item["violation_type"], 0) + item["count"]

    reports_pipeline = []
    reports_pipeline = apply_date_filters(reports_pipeline, start_date, end_date, "$incident_details.date")
    if location_country:
        reports_pipeline.append({"$match": {"incident_details.location.country": location_country}})
    if location_region:
        reports_pipeline.append({"$match": {"incident_details.location.region": location_region}})
    reports_pipeline.append({"$unwind": "$incident_details.violation_types"})
    reports_pipeline.append({"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}}})
    reports_pipeline.append({"$project": {"violation_type": "$_id", "count": 1, "_id": 0}})

    reports_data = await db["incident_reports"].aggregate(reports_pipeline).to_list(None)

    for item in reports_data:
        results[item["violation_type"]] = results.get(item["violation_type"], 0) + item["count"]

    final_results = [{"violation_type": k, "count": v} for k, v in results.items()]
    return sorted(final_results, key=lambda x: x["count"], reverse=True)


@router.get("/geodata", summary="Get geographical data for map visualization")
async def get_geographical_data(
    db: AsyncIOMotorClient = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    violation_type: Optional[str] = Query(None, description="Filter by specific violation type")
):
    all_geodata = []

    cases_pipeline = []
    cases_pipeline = apply_date_filters(cases_pipeline, start_date, end_date, "$date_occurred")
    if violation_type:
        cases_pipeline.append({"$match": {"violation_types": violation_type}})
    cases_pipeline.append({
        "$project": {
            "id": {"$toString": "$_id"},
            "source": "case",
            "coordinates": "$location.coordinates.coordinates",
            "violation_types": "$violation_types",
            "title": "$title",
            "status": "$status",
            "date": "$date_occurred",
            "_id": 0
        }
    })
    cases_pipeline.append({"$match": {"coordinates": {"$exists": True, "$ne": None, "$ne": []}}})


    cases_geodata = await db["cases"].aggregate(cases_pipeline).to_list(None)
    all_geodata.extend(cases_geodata)

    reports_pipeline = []
    reports_pipeline = apply_date_filters(reports_pipeline, start_date, end_date, "$incident_details.date")
    if violation_type:
        reports_pipeline.append({"$match": {"incident_details.violation_types": violation_type}})
    reports_pipeline.append({
        "$project": {
            "id": {"$toString": "$_id"},
            "source": "report",
            "coordinates": "$incident_details.location.coordinates.coordinates",
            "violation_types": "$incident_details.violation_types",
            "description": "$incident_details.description",
            "status": "$status",
            "date": "$incident_details.date",
            "_id": 0
        }
    })
    reports_pipeline.append({"$match": {"coordinates": {"$exists": True, "$ne": None, "$ne": []}}})


    reports_geodata = await db["incident_reports"].aggregate(reports_pipeline).to_list(None)
    all_geodata.extend(reports_geodata)

    return all_geodata


@router.get("/timeline", summary="Get cases/reports over time")
async def get_timeline_data(
    db: AsyncIOMotorClient = Depends(get_db),
    time_unit: str = Query("month", description="Time unit for aggregation (day, week, month, year)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    violation_type: Optional[str] = Query(None, description="Filter by specific violation type"),
    location_country: Optional[str] = Query(None, description="Filter by country"),
    location_region: Optional[str] = Query(None, description="Filter by region")
):
    if time_unit not in ["day", "week", "month", "year"]:
        raise HTTPException(status_code=400, detail="Invalid time_unit. Must be 'day', 'week', 'month', or 'year'.")

    all_timeline_data = {}

    cases_data = await aggregate_collection(
        db,
        "cases",
        "$date_occurred",
        time_unit,
        start_date,
        end_date,
        location_country,
        location_region,
        violation_type
    )
    for item in cases_data:
        all_timeline_data[item["_id"]] = all_timeline_data.get(item["_id"], 0) + item["count"]

    reports_data = await aggregate_collection(
        db,
        "incident_reports",
        "$incident_details.date",
        time_unit,
        start_date,
        end_date,
        location_country,
        location_region,
        violation_type
    )
    for item in reports_data:
        all_timeline_data[item["_id"]] = all_timeline_data.get(item["_id"], 0) + item["count"]

    final_results = [{"date": k, "count": v} for k, v in all_timeline_data.items()]
    return sorted(final_results, key=lambda x: x["date"])