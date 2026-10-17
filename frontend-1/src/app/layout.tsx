import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adithyen K — AI/ML & Full-Stack Developer",
  description:
    "Premium developer portfolio of Adithyen K. AI/ML engineer and full-stack developer specializing in Python, Next.js, and intelligent systems.",
  keywords: [
    "Adithyen K",
    "AI developer",
    "ML engineer",
    "full-stack developer",
    "portfolio",
    "Python",
    "Next.js",
    "React",
  ],
  authors: [{ name: "Adithyen K" }],
  openGraph: {
    title: "Adithyen K — AI/ML & Full-Stack Developer",
    description:
      "Premium developer portfolio. AI/ML engineer and full-stack developer.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-[family-name:var(--font-inter)] antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
