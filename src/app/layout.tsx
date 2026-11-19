import "@fontsource-variable/sofia-sans";
import "@fontsource-variable/sofia-sans-extra-condensed";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartContext";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "woolup | Sokken van wol, in kleine oplage",
    template: "%s | woolup",
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "woolup",
    url: site.url,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body className="flex min-h-dvh flex-col">
        <CartProvider>
          <Header />
          <main id="inhoud" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
