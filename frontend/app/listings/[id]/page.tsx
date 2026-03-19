"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Listing, UserProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Pencil,
  Trash2,
  CheckCircle,
  Bookmark,
} from "lucide-react";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listings
      .get(id)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api.users.me().then((u) => {
      setProfile(u);
      setBookmarked(u.bookmarks.includes(id));
    });
  }, [user, id]);

  async function handleDelete() {
    if (!confirm("Delete this listing?")) return;
    await api.listings.delete(id);
    router.push("/listings");
  }

  async function handleSold() {
    await api.listings.markSold(id);
    setListing((l) => (l ? { ...l, is_sold: true } : l));
  }

  async function toggleBookmark() {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (bookmarked) {
      await api.users.removeBookmark(id);
      setBookmarked(false);
    } else {
      await api.users.addBookmark(id);
      setBookmarked(true);
    }
  }

  if (loading)
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  if (!listing)
    return (
      <div className="text-center py-12 text-slate-500">
        Listing not found.
      </div>
    );

  const isOwner = user?.uid === listing.seller_id;

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="bg-slate-100 rounded-md h-48 flex items-center justify-center">
            <BookOpen size={56} className="text-slate-400" />
          </div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {listing.title}
            </h1>
            {listing.is_sold && (
              <Badge variant="secondary">Sold</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Listed by{" "}
            <span className="font-medium text-slate-700">
              {listing.seller_name}
            </span>
          </p>

          {!isOwner && profile?.contact_info && (
            <div className="border border-slate-200 rounded-md p-3 text-sm">
              <p className="text-slate-500 mb-1 text-xs">Contact seller</p>
              <p className="font-medium text-slate-900">
                {profile.contact_info}
              </p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBookmark}
                className={bookmarked ? "text-slate-900" : "text-slate-400"}
              >
                <Bookmark size={14} className="mr-1" />
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
            )}
            {isOwner && (
              <>
                <Link href={`/listings/${id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil size={14} className="mr-1" /> Edit
                  </Button>
                </Link>
                {!listing.is_sold && (
                  <Button variant="outline" size="sm" onClick={handleSold}>
                    <CheckCircle size={14} className="mr-1" /> Mark Sold
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
