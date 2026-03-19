import { auth } from "./firebase";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function authHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) return { "Content-Type": "application/json" };
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export type Listing = {
  id: string;
  title: string;
  author: string;
  price: number | null;
  condition: string;
  description: string;
  genre: string;
  discount_percent: number;
  seller_id: string;
  seller_name: string;
  is_sold: boolean;
  created_at: string;
  updated_at: string;
};

export type ListingCreateData = {
  title: string;
  author?: string;
  price?: number | null;
  condition?: string;
  description?: string;
  genre?: string;
  discount_percent?: number;
};

export type ListingUpdateData = {
  title?: string;
  author?: string;
  price?: number | null;
  condition?: string;
  description?: string;
  genre?: string;
  discount_percent?: number;
};

export type ListingFilters = {
  search?: string;
  condition?: string;
  genre?: string;
  price_min?: number;
  price_max?: number;
};

export type UserProfile = {
  uid: string;
  display_name: string;
  contact_info: string | null;
  bookmarks: string[];
};

export const api = {
  listings: {
    list: async (filters: ListingFilters = {}): Promise<Listing[]> => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.condition) params.set("condition", filters.condition);
      if (filters.genre) params.set("genre", filters.genre);
      if (filters.price_min !== undefined) params.set("price_min", String(filters.price_min));
      if (filters.price_max !== undefined) params.set("price_max", String(filters.price_max));
      const qs = params.toString();
      const url = qs ? `${BASE}/listings?${qs}` : `${BASE}/listings`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    },
    get: async (id: string): Promise<Listing> => {
      const res = await fetch(`${BASE}/listings/${id}`);
      if (!res.ok) throw new Error("Listing not found");
      return res.json();
    },
    create: async (data: ListingCreateData): Promise<Listing> => {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/listings`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create listing");
      return res.json();
    },
    update: async (id: string, data: ListingUpdateData): Promise<Listing> => {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/listings/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update listing");
      return res.json();
    },
    delete: async (id: string): Promise<void> => {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/listings/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete listing");
    },
    markSold: async (id: string): Promise<void> => {
      const headers = await authHeaders();
      await fetch(`${BASE}/listings/${id}/sold`, { method: "POST", headers });
    },
  },
  users: {
    me: async (): Promise<UserProfile> => {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/users/me`, { headers });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    update: async (data: {
      display_name?: string;
      contact_info?: string;
    }): Promise<UserProfile> => {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/users/me`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    bookmarks: async (): Promise<Listing[]> => {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/users/me/bookmarks`, { headers });
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      return res.json();
    },
    addBookmark: async (id: string): Promise<void> => {
      const headers = await authHeaders();
      await fetch(`${BASE}/users/me/bookmarks/${id}`, {
        method: "POST",
        headers,
      });
    },
    removeBookmark: async (id: string): Promise<void> => {
      const headers = await authHeaders();
      await fetch(`${BASE}/users/me/bookmarks/${id}`, {
        method: "DELETE",
        headers,
      });
    },
  },
};
