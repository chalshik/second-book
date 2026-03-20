from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import listings, users, reviews
import firebase_admin
from firebase_admin import credentials
import os
from dotenv import load_dotenv

load_dotenv()

cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json"))
firebase_admin.initialize_app(cred)

app = FastAPI(title="SecondBook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router, prefix="/listings", tags=["listings"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])


@app.get("/health")
def health():
    return {"status": "ok"}
