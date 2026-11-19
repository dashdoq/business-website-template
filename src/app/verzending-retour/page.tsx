import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Verzending en retour",
  description: "Verzendkosten, levertijd en retourneren bij woolup.",
};

export default function ShippingPage() {
  return (
    <ContentPage title="Verzending en retour" draft>
      <div className="prose-shop">
        <h2>Verzending</h2>
        <ul>
          <li>Gratis verzending vanaf {formatPrice(site.freeShippingFrom)}.</li>
          <li>Verzendkosten onder dat bedrag: nog aan te vullen.</li>
          <li>Levertijd en vervoerder: nog aan te vullen.</li>
          <li>Landen waarnaar we verzenden: nog aan te vullen.</li>
        </ul>
        <h2>Retourneren</h2>
        <p>
          Je hebt 14 dagen bedenktijd na ontvangst. Ongedragen sokken in de originele verpakking kun je
          terugsturen. Het retouradres en de werkwijze volgen.
        </p>
      </div>
    </ContentPage>
  );
}
