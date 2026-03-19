from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import firestore
from models.listing import ListingCreate, ListingUpdate
from dependencies.auth import get_current_user
from datetime import datetime, timezone
from typing import List

router = APIRouter()


def get_db():
    return firestore.client()


@router.get("")
def list_listings(search: str = "", limit: int = 50, offset: int = 0):
    db = get_db()
    query = db.collection("listings").order_by(
        "created_at", direction=firestore.Query.DESCENDING
    )
    results = []
    for doc in query.stream():
        data = doc.to_dict()
        data["id"] = doc.id
        if search and search.lower() not in data.get("title", "").lower():
            continue
        results.append(data)
    return results[offset : offset + limit]


@router.get("/{listing_id}")
def get_listing(listing_id: str):
    db = get_db()
    doc = db.collection("listings").document(listing_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data


@router.post("", status_code=status.HTTP_201_CREATED)
def create_listing(
    body: ListingCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    now = datetime.now(timezone.utc)

    user_doc = db.collection("users").document(current_user["uid"]).get()
    seller_name = current_user.get("name") or current_user.get("email", "Unknown")
    if user_doc.exists:
        seller_name = user_doc.to_dict().get("display_name", seller_name)

    doc_ref = db.collection("listings").document()
    data = {
        "title": body.title,
        "seller_id": current_user["uid"],
        "seller_name": seller_name,
        "is_sold": False,
        "created_at": now,
        "updated_at": now,
    }
    doc_ref.set(data)
    data["id"] = doc_ref.id
    return data


@router.put("/{listing_id}")
def update_listing(
    listing_id: str,
    body: ListingUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    doc_ref = db.collection("listings").document(listing_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")
    data = doc.to_dict()
    if data["seller_id"] != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not your listing")

    updates: dict = {"updated_at": datetime.now(timezone.utc)}
    if body.title is not None:
        updates["title"] = body.title
    doc_ref.update(updates)
    data.update(updates)
    data["id"] = listing_id
    return data


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    doc_ref = db.collection("listings").document(listing_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")
    if doc.to_dict()["seller_id"] != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not your listing")
    doc_ref.delete()


@router.post("/{listing_id}/sold")
def mark_sold(
    listing_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    doc_ref = db.collection("listings").document(listing_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")
    if doc.to_dict()["seller_id"] != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not your listing")
    doc_ref.update({"is_sold": True, "updated_at": datetime.now(timezone.utc)})
    return {"message": "Marked as sold"}
