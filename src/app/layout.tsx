import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display } from "next/font/google";

import { themeBootScript } from "@/components/ui/ThemeToggle";
import { languageBootScript } from "@/lib/i18n/language";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  // Playfair est variable : on charge jusqu'au poids 900 pour les gros titres.
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Keerelle — la clé qui ouvre un moment",
    template: "%s · Keerelle",
  },
  description:
    "Créez une invitation personnalisée et envoyez-la en un lien. La personne choisit le lieu et le créneau, le rendez-vous part dans vos agendas.",
  // Pas de `robots` ici : les pages marketing doivent être indexables.
  // Le `noindex` est posé page par page sur ce qui est privé : /d/[slug],
  // /dashboard et /login.
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#161113" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      // `suppressHydrationWarning` : le script ci-dessous ajoute `.dark` avant
      // React, ce que le serveur ne peut pas prédire.
      suppressHydrationWarning
      className={`${playfair.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <script dangerouslySetInnerHTML={{ __html: languageBootScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
