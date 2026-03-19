import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Listing } from "@/lib/api";
import { BookOpen } from "lucide-react";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="bg-slate-100 rounded-md h-32 flex items-center justify-center">
            <BookOpen size={40} className="text-slate-400" />
          </div>
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-slate-900 line-clamp-2 text-sm">
              {listing.title}
            </p>
            {listing.is_sold && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Sold
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">{listing.seller_name}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
