import { features } from "../constants";

const TickedBox = () => (
  <svg viewBox="0 0 40 40" width="36" height="36" className="mt-1 shrink-0" aria-hidden="true">
    <rect x="3" y="9" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <path
      d="M8 21 L15.5 29.5 L37 4"
      fill="none"
      className="stroke-stamp"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Business = () => (
  <section id="features" className="bg-white">
    <div className="wrap grid gap-x-10 gap-y-12 py-24 lg:grid-cols-12 lg:py-32">
      <div className="lg:col-span-5">
        <h2 className="heading">Included with every account.</h2>
        <p className="mt-6 max-w-[26rem]">
          There are no add-ons and no tiers. Open an account and all of this is switched on
          from your first day.
        </p>
      </div>

      <ul className="rule-rows border-t-2 border-carbon lg:col-span-7">
        {features.map((feature) => (
          <li key={feature.id} className="flex gap-5 py-8 sm:gap-7">
            <TickedBox />
            <div className="grid flex-1 gap-x-8 gap-y-2 sm:grid-cols-[13.5rem_1fr]">
              <h3 className="font-display text-2xl sm:text-3xl">{feature.title}</h3>
              <p className="max-w-[30rem]">{feature.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Business;
