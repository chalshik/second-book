"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/listings");
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/listings");
    } catch {
      setError("Google sign-in failed.");
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>
          <Button variant="outline" onClick={handleGoogle}>
            Continue with Google
          </Button>
          <p className="text-sm text-center text-slate-500">
            No account?{" "}
            <Link
              href="/auth/register"
              className="text-slate-900 font-medium underline"
            >
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
