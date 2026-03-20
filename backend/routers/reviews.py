from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import firestore
from models.review import ReviewCreate
from dependencies.auth import get_current_user
from datetime import datetime, timezone

router = APIRouter()


def get_db():
    return firestore.client()


@router.get("/seller/{seller_id}")
def get_seller_reviews(seller_id: str):
    db = get_db()
    reviews = []
    for doc in (
        db.collection("users")
        .document(seller_id)
        .collection("reviews")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .stream()
    ):
        data = doc.to_dict()
        data["id"] = doc.id
        reviews.append(data)
    return reviews


@router.post("/seller/{seller_id}", status_code=status.HTTP_201_CREATED)
def create_review(
    seller_id: str,
    body: ReviewCreate,
    current_user: dict = Depends(get_current_user),
):
    if seller_id == current_user["uid"]:
        raise HTTPException(status_code=403, detail="You cannot review yourself")

    db = get_db()

    # Verify seller exists
    seller_doc = db.collection("users").document(seller_id).get()
    if not seller_doc.exists:
        raise HTTPException(status_code=404, detail="Seller not found")

    # Get reviewer display name
    reviewer_doc = db.collection("users").document(current_user["uid"]).get()
    if reviewer_doc.exists:
        reviewer_name = reviewer_doc.to_dict().get("display_name", "User")
    else:
        reviewer_name = current_user.get("name") or current_user.get("email", "User")

    now = datetime.now(timezone.utc)
    data = {
        "reviewer_id": current_user["uid"],
        "reviewer_name": reviewer_name,
        "rating": body.rating,
        "comment": body.comment or "",
        "created_at": now,
    }

    # Upsert: use reviewer_id as doc ID to enforce one review per reviewer per seller
    doc_ref = (
        db.collection("users")
        .document(seller_id)
        .collection("reviews")
        .document(current_user["uid"])
    )
    doc_ref.set(data)
    data["id"] = current_user["uid"]
    return data


@router.delete("/seller/{seller_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    seller_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    doc_ref = (
        db.collection("users")
        .document(seller_id)
        .collection("reviews")
        .document(current_user["uid"])
    )
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Review not found")
    doc_ref.delete()
