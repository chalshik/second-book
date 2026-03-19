"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "./ui/button";
import { BookOpen } from "lucide-react";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-slate-900"
        >
          <BookOpen size={20} />
          SecondBook
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/listings">
            <Button variant="ghost" size="sm">
              Browse
            </Button>
          </Link>
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/listings/new">
                    <Button variant="ghost" size="sm">
                      Sell
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
