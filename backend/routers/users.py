from fastapi import APIRouter, Depends
from firebase_admin import firestore
from models.user import UserUpdate
from dependencies.auth import get_current_user
from datetime import datetime, timezone
from typing import List

router = APIRouter()


def get_db():
    return firestore.client()


def ensure_user(db, uid: str, fallback_name: str = "User") -> dict:
    ref = db.collection("users").document(uid)
    doc = ref.get()
    if not doc.exists:
        data = {
            "uid": uid,
            "display_name": fallback_name,
            "contact_info": None,
            "bookmarks": [],
            "created_at": datetime.now(timezone.utc),
        }
        ref.set(data)
        return data
    return doc.to_dict()


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    fallback = current_user.get("name") or current_user.get("email", "User")
    return ensure_user(db, current_user["uid"], fallback)


@router.put("/me")
def update_me(
    body: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    fallback = current_user.get("name") or current_user.get("email", "User")
    ensure_user(db, current_user["uid"], fallback)

    updates = {}
    if body.display_name is not None:
        updates["display_name"] = body.display_name
    if body.contact_info is not None:
        updates["contact_info"] = body.contact_info

    if updates:
        db.collection("users").document(current_user["uid"]).update(updates)

    user = ensure_user(db, current_user["uid"])
    user.update(updates)
    return user


@router.get("/me/bookmarks")
def get_bookmarks(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = ensure_user(db, current_user["uid"])
    bookmark_ids: List[str] = user.get("bookmarks", [])
    results = []
    for bid in bookmark_ids:
        doc = db.collection("listings").document(bid).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
    return results


@router.post("/me/bookmarks/{listing_id}")
def add_bookmark(
    listing_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    db.collection("users").document(current_user["uid"]).update(
        {"bookmarks": firestore.ArrayUnion([listing_id])}
    )
    return {"message": "Bookmarked"}


@router.delete("/me/bookmarks/{listing_id}")
def remove_bookmark(
    listing_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    db.collection("users").document(current_user["uid"]).update(
        {"bookmarks": firestore.ArrayRemove([listing_id])}
    )
    return {"message": "Removed"}
