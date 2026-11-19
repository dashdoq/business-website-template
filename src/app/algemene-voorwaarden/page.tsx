import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description: "De algemene voorwaarden van woolup.",
};

export default function TermsPage() {
  return (
    <ContentPage title="Algemene voorwaarden" draft>
      <div className="prose-shop">
        <p>
          Hier komen de algemene voorwaarden van woolup, met de bedrijfsgegevens (naam, adres,
          KvK-nummer en btw-nummer), het aanbod, de prijzen, betaling, levering, het herroepingsrecht,
          garantie en klachten.
        </p>
      </div>
    </ContentPage>
  );
}
