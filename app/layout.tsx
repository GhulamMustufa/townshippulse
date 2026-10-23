import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TownshipPulse — Autonomous Infrastructure & Operations Copilot",
  description:
    "Autonomous spatial copilot for Sime Darby Property Townships (City of Elmina & Bandar Bukit Raja). Multimodal defect vision, 50m deduplication, monsoon radar correlation, and JKR rate contractor dispatch.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22><text y=%2222%22 font-size=%2222%22>🏙️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#070c18] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
