import type { Metadata } from "next";
import "./globals.css";
import "./start-guide.css";
import "./community.css";
import "./gamification.css";
import "./pilot.css";
import "./booking.css";
import "./roulette.css";
import "./demo.css";
import "./availability.css";
import "./categories.css";
import "./life.css";
import "./passport-book.css";
import "./membership.css";
import "./yolo-guide.css";
import "./typography.css";
import "./passport-game.css";
import "./mobile.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yolo.com.ar"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { title: "YOLO.BA — Solo se vive una vez", description: "Experiencias, teatro, shows y planes gratis en Buenos Aires.", url: "https://yolo.com.ar", siteName: "YOLO.BA", locale: "es_AR", type: "website" },
  title: "YOLO.BA — Solo se vive una vez",
  description: "Descubrí planes en Buenos Aires por categoría y presupuesto. Girá la ruleta y consultá directamente con cada proveedor. Explorar es gratis.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className="antialiased">{children}</body>
    </html>
  );
}

