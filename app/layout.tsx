import type { Metadata } from "next";
import { Geist, Geist_Mono, Exo_2, Poppins } from "next/font/google";
import "./globals.css";
import ModuleShell from "@/components/layout/ModuleShell";
import AutoSave from "@/components/AutoSave";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo-2",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SUAMA Hub — Video Tutorial Generator",
  description: "App web para generar videos MP4 de prevención de riesgos laborales personalizados por cliente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${exo2.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0b0f19] text-slate-100">
        <AutoSave />
        <ModuleShell>{children}</ModuleShell>
      </body>
    </html>
  );
}
