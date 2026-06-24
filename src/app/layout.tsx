import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Astacala Rescue Reporting System",
  description:
    "Platform pelaporan bencana, koordinasi misi, dan informasi bencana terverifikasi untuk relawan Astacala Rescue.",
  openGraph: {
    title: "Astacala Rescue Reporting System",
    description:
      "Platform pelaporan bencana, koordinasi misi, dan informasi bencana terverifikasi untuk relawan Astacala Rescue.",
    siteName: "Astacala Rescue Reporting System",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
