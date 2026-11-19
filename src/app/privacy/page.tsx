import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Hoe woolup omgaat met je persoonsgegevens.",
};

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy" draft>
      <div className="prose-shop">
        <p>
          Hier komt de privacyverklaring van woolup. Die beschrijft in elk geval welke gegevens we
          verzamelen bij een bestelling en bij de nieuwsbrief, waarvoor we ze gebruiken, hoe lang we ze
          bewaren, met welke partijen we ze delen (zoals de betaalprovider en de vervoerder) en hoe je je
          gegevens kunt inzien of laten verwijderen.
        </p>
        <h2>Wat deze site nu opslaat</h2>
        <p>
          De winkelmand wordt alleen in je eigen browser bewaard. We versturen of bewaren nog geen
          gegevens van bezoekers.
        </p>
      </div>
    </ContentPage>
  );
}
