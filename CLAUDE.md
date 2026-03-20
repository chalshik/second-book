# CLAUDE.md — SecondBook

## Project Overview

SecondBook is a used book marketplace for Kyrgyzstan. Users can list, browse, and contact sellers for books. No in-app payments — transactions happen offline.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), shadcn/ui, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (email/password + Google OAuth)
- **Storage**: Firebase Storage (book cover images)
- **Deployment**: Vercel (frontend), Railway (backend)

## Project Structure

```
second-book/
├── frontend/          # Next.js App Router
│   ├── app/           # Pages and routes
│   ├── components/    # UI components (shadcn/ui + custom)
│   └── lib/           # Firebase config, API helpers
└── backend/           # FastAPI
    ├── main.py
    ├── routers/       # listings.py, users.py
    ├── models/        # listing.py, user.py
    └── dependencies/  # auth.py (Firebase token verification)
```

## Key Conventions

### Frontend
- Use Next.js App Router (`app/` directory)
- Use shadcn/ui components (Button, Input, Select, Card, Badge, Dialog, Sheet)
- Tailwind CSS utility classes only — no custom CSS unless necessary
- Mobile-first design; clean/minimal UI with white/light background
- Accent color: slate-700 or indigo-600

### Backend
- FastAPI with Firebase ID token verification on all protected routes
- Auth header: `Authorization: Bearer <token>`
- Users can only modify/delete their own listings (enforced server-side)

### Data
- Prices in KGS (Kyrgyzstani Som) throughout
- Locations: Bishkek, Osh, Jalal-Abad, Karakol, Tokmok, Naryn, Batken, Talas, Balykchy, Other
- Genres: Fiction, Non-Fiction, Science, History, Biography, Children's, Textbook, Religion, Technology, Art & Design, Other
- Book conditions: `New`, `Good`, `Fair`
- Book categories: `New Book`, `Used Book`

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/listings` | No |
| GET | `/listings/{id}` | No |
| POST | `/listings` | Yes |
| PUT | `/listings/{id}` | Yes |
| DELETE | `/listings/{id}` | Yes |
| POST | `/listings/{id}/sold` | Yes |
| GET | `/users/me` | Yes |
| PUT | `/users/me` | Yes |
| GET/POST/DELETE | `/users/me/bookmarks/{id}` | Yes |

## Development Notes

- Platform is restricted to Kyrgyzstan only
- UI language: English
- Listing page target load time: < 2s; images are lazy-loaded
- Firebase tokens verified server-side on every protected endpoint
