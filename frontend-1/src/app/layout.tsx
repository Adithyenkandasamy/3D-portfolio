import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AudioProvider } from "@/components/music/audio-provider";
import { SmoothScroll } from "@/components/layout/smooth-scroll";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://adithyen-k.vercel.app"),
  title: "Adithyen K — AI/ML & Full-Stack Developer",
  description:
    "Production portfolio of Adithyen K. AI/ML engineer and full-stack developer specializing in Python, Next.js, FastAPI, and intelligent agent systems. 1st Place Winner at Cryptora'26.",
  keywords: [
    "Adithyen K",
    "AI developer",
    "ML engineer",
    "full-stack developer",
    "portfolio",
    "Python",
    "Next.js",
    "React",
    "FastAPI",
    "Agentic AI",
    "Cryptora Winner",
  ],
  authors: [{ name: "Adithyen K", url: "https://www.linkedin.com/in/adithyen-k" }],
  creator: "Adithyen K",
  openGraph: {
    title: "Adithyen K — AI/ML & Full-Stack Developer",
    description:
      "Cinematic developer portfolio of Adithyen K. Exploring intelligent agents, low-latency streaming pipelines, and full-stack platforms.",
    type: "website",
    locale: "en_US",
    siteName: "Adithyen K Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adithyen K — AI/ML & Full-Stack Developer",
    description:
      "AI/ML engineer and full-stack developer specializing in Python, Next.js, and intelligent systems.",
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://adithyen-k.vercel.app/#person",
      name: "Adithyen K",
      jobTitle: "AI/ML & Full-Stack Developer",
      url: "https://adithyen-k.vercel.app",
      sameAs: [
        "https://www.linkedin.com/in/adithyen-k",
        "https://github.com/adithyen-k",
      ],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "SNS College of Technology",
      },
      knowsAbout: [
        "Artificial Intelligence",
        "Machine Learning",
        "Full-Stack Web Development",
        "Next.js",
        "Python",
        "FastAPI",
        "PostgreSQL",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://adithyen-k.vercel.app/#website",
      url: "https://adithyen-k.vercel.app",
      name: "Adithyen K — Developer Portfolio",
      description: "Interactive portfolio showcase of Adithyen K",
      author: {
        "@id": "https://adithyen-k.vercel.app/#person",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased" suppressHydrationWarning>
        <AudioProvider>
          <SmoothScroll>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </SmoothScroll>
        </AudioProvider>
      </body>
    </html>
  );
}
