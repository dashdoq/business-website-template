import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { ContentPage } from "@/components/ContentPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Vragen over je bestelling, je maat of onze sokken? Neem contact op met woolup.",
};

export default function ContactPage() {
  return (
    <ContentPage title="Contact" intro="Vragen over je maat, een bestelling of onze wol? Stuur ons een bericht.">
      <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-20">
        <ContactForm />
        <aside className="space-y-6 text-base">
          <div className="panel space-y-1 p-5">
            <h2 className="font-semibold">E-mail</h2>
            <a href={`mailto:${site.email}`} className="link">{site.email}</a>
          </div>
          <div className="panel space-y-1 p-5">
            <h2 className="font-semibold">Snel antwoord</h2>
            <p className="text-stone">
              Veel vragen staan al bij de{" "}
              <Link href="/veelgestelde-vragen" className="link text-ink">veelgestelde vragen</Link>, met de
              maattabel en het wasadvies.
            </p>
          </div>
        </aside>
      </div>
    </ContentPage>
  );
}
