from pydantic import BaseModel
from typing import Optional


class ListingCreate(BaseModel):
    title: str


class ListingUpdate(BaseModel):
    title: Optional[str] = None
