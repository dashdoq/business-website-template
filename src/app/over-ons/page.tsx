import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { SockMark } from "@/components/Logo";
import { values } from "@/content/site";

export const metadata: Metadata = {
  title: "Over ons",
  description: "woolup maakt sokken en kousen van wol, in eigen productie en in kleine oplage.",
};

export default function AboutPage() {
  return (
    <ContentPage
      title="Over woolup"
      intro="We maken sokken en kousen van wol. In eigen productie, in kleine oplage, en zo dat ze jaren meegaan."
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-20">
        <div className="prose-shop">
          <h2>Waarom wol</h2>
          <p>
            Wol voert vocht af, houdt warmte vast en gaat niet snel ruiken. Een goede wollen sok houdt je
            voeten droog en warm, in de winter en in de zomer. Daarom maken we alles van wol.
          </p>
          <h2>Eigen productie</h2>
          <p>
            woolup is ons eigen merk. We kiezen zelf het garen, de breisteek en de pasvorm, en we testen elk
            model voordat het in een drop komt.
          </p>
          <h2>Waarom in drops</h2>
          <p>
            We maken elk model in één oplage. Zo maken we niet meer dan nodig is, en hoeven we geen
            restpartijen af te prijzen of weg te gooien. Is een model op, dan komt het pas terug in een
            volgende drop.
          </p>
          <p>
            <Link href="/shop" className="link">
              Bekijk de huidige drop
            </Link>
          </p>
        </div>
        <aside className="space-y-8 lg:pt-6">
          <div className="grid aspect-square place-items-center rounded-2xl bg-ecru">
            <SockMark className="h-1/2 w-auto" />
          </div>
          <dl className="space-y-6">
            {values.map((value) => (
              <div key={value.title} className="space-y-1 border-t border-line pt-4">
                <dt className="display-md">{value.title}</dt>
                <dd className="text-sm text-stone">{value.text}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </ContentPage>
  );
}
