import { appStores, ledger } from "../constants";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const outstanding = ledger.rows
  .filter((row) => !row.paid)
  .reduce((sum, row) => sum + row.amount, 0);

const Ledger = () => (
  <div className="relative mx-auto w-full max-w-[36rem]">
    <div className="copy copy--canary" aria-hidden="true" />
    <div className="sheet px-4 pb-6 pt-4 min-[380px]:px-5 sm:px-8 sm:pb-8">
      <div className="perforation" aria-hidden="true" />
      <table className="mt-5 w-full text-sm min-[380px]:text-base">
        <caption className="pb-4 text-left font-display text-2xl sm:text-3xl">
          Invoices this month
        </caption>
        <thead>
          <tr className="border-y-2 border-carbon text-left text-sm text-carbon/70">
            <th scope="col" className="hidden py-2 pr-3 sm:pr-4 font-normal sm:table-cell">
              Number
            </th>
            <th scope="col" className="py-2 pr-3 sm:pr-4 font-normal">
              Customer
            </th>
            <th scope="col" className="py-2 pr-3 sm:pr-4 text-right font-normal">
              Amount
            </th>
            <th scope="col" className="py-2 font-normal">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="rule-rows">
          {ledger.rows.map((row) => (
            <tr key={row.serial}>
              <td className="hidden py-3 pr-3 sm:pr-4 font-display text-lg text-stamp sm:table-cell">
                {row.serial}
              </td>
              <td className="py-3 pr-3 sm:pr-4 font-semibold">{row.customer}</td>
              <td className="py-3 pr-3 sm:pr-4 text-right tabular-nums">{money.format(row.amount)}</td>
              <td className="py-3">
                {row.paid ? (
                  <span className="inline-block -rotate-3 rounded-[3px] border-2 border-stamp px-2 font-display text-lg uppercase leading-snug tracking-wider text-stamp">
                    {row.status}
                  </span>
                ) : (
                  row.status
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 flex items-center justify-between gap-4 text-base font-semibold">
        Still to come in
        <span className="font-display text-2xl font-normal sm:text-3xl">
          {money.format(outstanding)}
        </span>
      </p>
    </div>
  </div>
);

const Billing = () => (
  <section id="invoicing" className="on-pink overflow-hidden bg-pink">
    <div className="wrap grid items-center gap-x-10 gap-y-16 py-24 lg:grid-cols-12 lg:py-32">
      <div className="lg:order-2 lg:col-span-5 lg:col-start-8">
        <h2 className="heading">Send the invoice. We&rsquo;ll chase it.</h2>
        <p className="mt-6 max-w-[30rem]">
          Write an invoice in a minute and send it by email or link. Customers pay by card
          from the invoice itself, and anyone who&rsquo;s late gets a polite reminder from us,
          not from you.
        </p>
        <ul className="mt-9 flex flex-wrap gap-4">
          {appStores.map((store) => (
            <li key={store.id}>
              <a href={store.link} className="block rounded-[7px]">
                <img src={store.badge} alt={store.name} className="h-[44px] w-auto" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:order-1 lg:col-span-6">
        <Ledger />
      </div>
    </div>
  </section>
);

export default Billing;
