import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abhyas Arena — Maharashtra State Scholarship",
  description: "Gamified Scholarship & Foundation Exam Preparation App for Maharashtra Students",
  icons: {
    icon: "/assets/abhyas_logo.svg",
    apple: "/assets/abhyas_logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#0B1220] h-full antialiased">
      <body className="min-h-full flex flex-col justify-center items-center bg-[#0B1220] text-[#F1F5F9] m-0 p-0 selection:bg-[#22C7E6]/30">
        {children}
      </body>
    </html>
  );
}
