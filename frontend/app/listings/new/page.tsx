"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading)
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const listing = await api.listings.create(title.trim());
      router.push(`/listings/${listing.id}`);
    } catch {
      setError("Failed to create listing. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>List a Book</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Book Title</Label>
              <Input
                id="title"
                placeholder="e.g. The Great Gatsby"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Publishing..." : "Publish Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
