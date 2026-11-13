import { steps } from "../constants";

const CARD_NUMBER = "4000 1234 5678 9010";
const CARD_HOLDER = "Maple & Rye Bakery";
const CARD_EXPIRY = "11/29";

const Imprint = () => (
  <div
    className="relative mx-auto aspect-[10/9] w-full max-w-[34rem]"
    style={{ containerType: "inline-size" }}
    role="img"
    aria-label="A HooBank business card resting on the carbon slip it was imprinted on"
  >
    <div
      className="absolute bottom-0 left-0 w-[78%] -rotate-[4deg] rounded-sheet bg-pink px-[6cqw] pb-[6cqw] pt-[4cqw]"
      aria-hidden="true"
    >
      <div className="perforation" />
      <p className="mt-[4cqw] font-display text-[7cqw] leading-none">Sales slip</p>
      <div className="imprint mt-[19cqw] font-display uppercase leading-none tracking-[0.06em]">
        <p className="text-[7.4cqw]">{CARD_NUMBER}</p>
        <p className="mt-[2.4cqw] text-[4.6cqw]">
          {CARD_HOLDER} <span className="ml-[3cqw]">{CARD_EXPIRY}</span>
        </p>
      </div>
      <div className="mt-[8cqw] flex items-end gap-[3cqw] border-b-2 border-carbon pb-[1.2cqw] text-[3cqw] leading-none">
        <span className="font-display text-[6cqw] text-stamp">X</span>
        <span className="text-carbon/70">Cardholder signature</span>
      </div>
    </div>

    <div
      className="absolute right-0 top-0 flex aspect-[1.586] w-[70%] rotate-[7deg] flex-col justify-between rounded-card bg-carbon p-[4.6cqw] text-white"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-[7cqw] leading-none text-canary">HooBank</span>
        <span className="text-[2.9cqw] font-medium leading-none">Business</span>
      </div>
      <div className="h-[8.4cqw] w-[11cqw] rounded-[1.4cqw] bg-canary">
        <div className="mx-auto h-full w-[34%] border-x-[0.35cqw] border-carbon/50" />
      </div>
      <div className="font-display uppercase leading-none tracking-[0.06em]">
        <p className="text-[6.6cqw]">{CARD_NUMBER}</p>
        <p className="mt-[2cqw] flex justify-between text-[4.1cqw]">
          <span>{CARD_HOLDER}</span>
          <span>{CARD_EXPIRY}</span>
        </p>
      </div>
    </div>
  </div>
);

const CardDeal = () => (
  <section id="cards" className="overflow-hidden bg-white">
    <div className="wrap grid items-center gap-x-10 gap-y-16 py-24 lg:grid-cols-12 lg:py-32">
      <div className="lg:col-span-6">
        <h2 className="heading">Find a better card deal in three steps.</h2>
        <ol className="rule-rows mt-10 border-t-2 border-carbon">
          {steps.map((step, index) => (
            <li key={step.id} className="flex gap-6 py-7 sm:gap-8">
              <span className="w-8 shrink-0 font-display text-4xl text-stamp" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 max-w-[30rem]">{step.content}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        <Imprint />
      </div>
    </div>
  </section>
);

export default CardDeal;
