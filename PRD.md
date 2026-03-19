# Product Requirements Document
## SecondBook — Used Book Marketplace (Kyrgyzstan)

---

## 1. Overview

A lightweight web platform for buying and selling books in Kyrgyzstan. Users can list books, browse what others are selling, and contact sellers directly. No in-app payments — transactions are arranged between parties offline.

---

## 2. Tech Stack

| Layer       | Technology                            |
|-------------|---------------------------------------|
| Frontend    | Next.js 14+ (App Router)              |
| UI Library  | shadcn/ui + Tailwind CSS              |
| UI Style    | Clean & Minimal — white/light bg, card-based listings |
| Backend     | FastAPI (Python)                      |
| Database    | Firebase Firestore                    |
| Auth        | Firebase Auth (email/password + Google OAuth) |
| Storage     | Firebase Storage (book cover images)  |
| Deployment  | Vercel (frontend) · Railway (backend) |

---

## 3. User Roles

**Single role.** Every registered user can both list books for sale and contact sellers. No separate buyer/seller distinction.

---

## 4. Core Features

### 4.1 Authentication
- Register / Login with email + password via Firebase Auth
- Google OAuth as optional one-click sign-in
- Persistent session; protected routes for creating/editing listings

### 4.2 Book Listings

Each listing includes:

| Field       | Type                                  | Required |
|-------------|---------------------------------------|----------|
| Title       | Text                                  | Yes      |
| Author      | Text                                  | Yes      |
| Price       | Number — KGS (Kyrgyzstani Som)        | Yes      |
| Condition   | Enum: `New` · `Good` · `Fair`         | Yes      |
| Category    | Enum: `New Book` · `Used Book`        | Yes      |
| Cover Image | Image upload (Firebase Storage)       | Yes      |
| Genre       | Select from predefined list (below)   | Yes      |
| Location    | Select from predefined cities (below) | Yes      |
| Description | Long text                             | No       |

**Genre options:**
Fiction, Non-Fiction, Science, History, Biography, Children's, Textbook, Religion, Technology, Art & Design, Other

**Location options (Kyrgyzstan only):**
Bishkek, Osh, Jalal-Abad, Karakol, Tokmok, Naryn, Batken, Talas, Balykchy, Other

> The platform is restricted to Kyrgyzstan. No international listings are allowed.

### 4.3 Browse & Search
- Grid-based listing cards (book cover, title, price, condition badge, city)
- Keyword search by title or author
- Filters: Category, Genre, Condition, Location, Price range (min/max KGS)
- Sort by: Newest, Price low→high, Price high→low

### 4.4 Listing Detail Page
- Full listing info
- Seller display name + contact info (phone or email)
- "Contact Seller" CTA revealing seller's contact info
- Listings can be flagged as **Sold** (still visible, marked with a badge)

### 4.5 User Profile
- Display name + contact info (phone or email — used for seller contact)
- **My Listings** tab: view, edit, delete, mark as sold
- **My Bookmarks** tab: saved listings

### 4.6 Create / Edit / Delete Listing
- Authenticated users only
- Image upload with preview before submit
- Owner-only edit and delete

---

## 5. Pages & Routes

### Frontend (Next.js)

| Route                  | Page                                |
|------------------------|-------------------------------------|
| `/`                    | Home — hero + recent listings       |
| `/listings`            | Browse all listings (search/filter) |
| `/listings/[id]`       | Listing detail                      |
| `/listings/new`        | Create listing (auth required)      |
| `/listings/[id]/edit`  | Edit listing (owner only)           |
| `/profile`             | My profile, listings, bookmarks     |
| `/auth/login`          | Login                               |
| `/auth/register`       | Register                            |

### Backend (FastAPI)

| Method | Endpoint                    | Description                  | Auth |
|--------|-----------------------------|------------------------------|------|
| GET    | `/listings`                 | List / search / filter       | No   |
| GET    | `/listings/{id}`            | Get single listing           | No   |
| POST   | `/listings`                 | Create listing               | Yes  |
| PUT    | `/listings/{id}`            | Update listing               | Yes  |
| DELETE | `/listings/{id}`            | Delete listing               | Yes  |
| POST   | `/listings/{id}/sold`       | Mark listing as sold         | Yes  |
| GET    | `/users/me`                 | Get current user profile     | Yes  |
| PUT    | `/users/me`                 | Update profile               | Yes  |
| GET    | `/users/me/bookmarks`       | Get bookmarks                | Yes  |
| POST   | `/users/me/bookmarks/{id}`  | Add bookmark                 | Yes  |
| DELETE | `/users/me/bookmarks/{id}`  | Remove bookmark              | Yes  |

> Auth: Firebase ID tokens are sent as `Authorization: Bearer <token>` headers and verified by the FastAPI backend on every protected route.

---

## 6. Data Models (Firestore)

### `listings` collection
```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "price": "number (KGS)",
  "condition": "New | Good | Fair",
  "category": "New Book | Used Book",
  "genre": "string",
  "location": "string (Kyrgyzstan city)",
  "description": "string (optional)",
  "coverImageUrl": "string (Firebase Storage URL)",
  "isSold": "boolean",
  "sellerId": "string (Firebase UID)",
  "sellerName": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `users` collection
```json
{
  "uid": "string (Firebase UID)",
  "displayName": "string",
  "contactInfo": "string (phone or email shown to buyers)",
  "bookmarks": ["listingId", "..."],
  "createdAt": "timestamp"
}
```

---

## 7. UI/UX Design Principles

- **Mobile-first** — most users expected on mobile
- **Clean & minimal** — white/light background, generous whitespace, simple sans-serif typography
- **Card-based listings** — book cover image prominent, price and condition badge visible at a glance
- **shadcn/ui components** — Button, Input, Select, Card, Badge, Dialog, Sheet (mobile filter drawer)
- **Tailwind CSS** — utility-first, no custom CSS unless necessary
- Color palette: white background, neutral grays, one accent color (e.g. slate-700 or indigo-600)

---

## 8. Non-Functional Requirements

- Listing page loads < 2s; images lazy-loaded
- Firebase token verified server-side on every protected endpoint
- Users can only modify/delete their own listings (enforced backend)
- Prices displayed in KGS throughout
- UI language: English (Russian/Kyrgyz as a future enhancement)

---

## 9. Project Structure

```
second-book/
├── frontend/                    # Next.js App Router
│   ├── app/
│   │   ├── page.tsx             # Home
│   │   ├── listings/
│   │   │   ├── page.tsx         # Browse
│   │   │   ├── new/page.tsx     # Create listing
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Detail
│   │   │       └── edit/page.tsx
│   │   ├── profile/page.tsx
│   │   └── auth/
│   │       ├── login/page.tsx
│   │       └── register/page.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── ListingCard.tsx
│   │   ├── ListingGrid.tsx
│   │   ├── FilterBar.tsx
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── firebase.ts          # Firebase client config
│   │   └── api.ts               # FastAPI client helpers
│   └── public/
│
└── backend/                     # FastAPI
    ├── main.py
    ├── routers/
    │   ├── listings.py
    │   └── users.py
    ├── models/
    │   ├── listing.py
    │   └── user.py
    ├── dependencies/
    │   └── auth.py              # Firebase token verification
    ├── Dockerfile
    └── requirements.txt
```

---

## 10. Deployment

| Service       | Platform        | Notes                                |
|---------------|-----------------|--------------------------------------|
| Frontend      | Vercel          | Auto-deploy from `main` branch       |
| Backend       | Railway         | FastAPI via Dockerfile               |
| Firestore     | Firebase        | NoSQL database                       |
| Firebase Auth | Firebase        | Email/password + Google OAuth        |
| Firebase Storage | Firebase     | Book cover image uploads             |

---

## 11. MVP — Definition of Done

- [ ] User can register and log in (email/password and Google)
- [ ] User can create a book listing with all required fields + cover image
- [ ] Listings are browseable by anyone with search and filters
- [ ] Listing detail page shows full info + seller contact
- [ ] Authenticated user can edit and delete their own listings
- [ ] Authenticated user can bookmark listings
- [ ] Seller can mark a listing as Sold
- [ ] Frontend deployed to Vercel, backend deployed to Railway

---

## 12. Out of Scope (MVP)

- In-app messaging / chat
- Payment processing
- Admin dashboard
- Push notifications
- Ratings & reviews
- Multi-language UI
- Multi-country support
