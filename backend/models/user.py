from pydantic import BaseModel
from typing import Optional


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    contact_info: Optional[str] = None
