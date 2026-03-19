import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center gap-8 py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-slate-900 text-white rounded-full p-4">
          <BookOpen size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900">SecondBook</h1>
        <p className="text-slate-600 text-lg max-w-md">
          Buy and sell books across Kyrgyzstan. Simple, fast, no fees.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/listings">
          <Button size="lg">
            Browse Books <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
        <Link href="/listings/new">
          <Button size="lg" variant="outline">
            Sell a Book
          </Button>
        </Link>
      </div>
    </div>
  );
}
