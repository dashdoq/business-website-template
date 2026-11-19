import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { SizeTable } from "@/components/SizeTable";
import { faq } from "@/content/site";

export const metadata: Metadata = {
  title: "Veelgestelde vragen",
  description: "Antwoorden over maten, wassen, drops, verzending en retour bij woolup.",
};

export default function FaqPage() {
  return (
    <ContentPage title="Veelgestelde vragen" intro="Over maten, wassen, drops en bestellen.">
      <div className="max-w-3xl">
        <div className="panel divide-y divide-line px-5">
          {faq.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="text-2xl leading-none font-normal transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-[65ch] pb-5 text-stone">{item.a}</p>
            </details>
          ))}
        </div>

        <section aria-labelledby="maattabel" className="mt-16 scroll-mt-28">
          <h2 id="maattabel" className="display-lg mb-6">Maattabel</h2>
          <SizeTable />
        </section>
      </div>
    </ContentPage>
  );
}
