"use client";
import { useEffect, useState } from "react";
import { api, Listing } from "@/lib/api";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listings
      .list(search)
      .then(setListings)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Browse Books</h1>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          placeholder="Search by title..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center text-slate-500 py-12">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          No listings found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
