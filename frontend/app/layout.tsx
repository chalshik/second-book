import type { Metadata } from "next";
import { Playfair_Display, EB_Garamond, DM_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const garamond = EB_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Second Book — Used Books Marketplace",
  description: "Buy and sell second-hand books. Simple, free, and direct.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${garamond.variable} ${dmMono.variable}`}>
      <body suppressHydrationWarning style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <LangProvider>
          <AuthProvider>
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
