import Nav from "@/components/Nav";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Task Reminder - Never Miss Important Tasks",
    template: "%s | Task Reminder",
  },
  description:
    "Get text and email reminders for recurring tasks. Stay organized and never forget important deadlines with automated notifications.",
  keywords: [
    "task reminder",
    "recurring tasks",
    "email reminders",
    "text reminders",
    "task management",
    "productivity",
  ],
  authors: [{ name: "Jake Meyers" }],
  creator: "Jake Meyers",
  metadataBase: new URL("https://yourdomain.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    title: "Task Reminder - Never Miss Important Tasks",
    description:
      "Get text and email reminders for recurring tasks. Stay organized and never forget important deadlines.",
    siteName: "Task Reminder",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Task Reminder App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Task Reminder - Never Miss Important Tasks",
    description: "Get text and email reminders for recurring tasks.",
    images: ["/og-image.jpg"],
    creator: "@yourtwitterhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "smhWJKbaj9Xrv2dfRSJdoCdttkQSm993tn5QYTnPjLU",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://yourdomain.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <ClerkProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Nav />
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
