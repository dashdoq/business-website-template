import { useEffect, useRef, useState } from "react";
import { sampleInvoices } from "../constants";
import Button from "./Button";

const FIRST_SERIAL = 4218;
const PAYMENT_DELAY_MS = 1500;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const today = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date());

const buttonLabels = {
  draft: "Send invoice",
  sent: "Invoice sent",
  paid: "Send the next invoice",
};

const Invoice = () => {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("draft");
  const timer = useRef();

  useEffect(() => () => clearTimeout(timer.current), []);

  const invoice = sampleInvoices[count % sampleInvoices.length];
  const total = money.format(invoice.lines.reduce((sum, line) => sum + line.amount, 0));
  const serial = String(FIRST_SERIAL + count).padStart(6, "0");

  const messages = {
    draft: `Ready to send to ${invoice.customer}.`,
    sent: `Invoice sent. Waiting for ${invoice.customer} to pay.`,
    paid: `Paid by card. ${total} reaches your account tomorrow.`,
  };

  const handleClick = () => {
    if (status === "draft") {
      setStatus("sent");
      timer.current = setTimeout(() => setStatus("paid"), PAYMENT_DELAY_MS);
    }
    if (status === "paid") {
      setCount((previous) => previous + 1);
      setStatus("draft");
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[27rem]">
      <div className="copy copy--carbon" aria-hidden="true" />
      <div className="copy copy--pink" aria-hidden="true" />

      <section
        aria-label="Try it: send a sample invoice"
        className="sheet px-6 pb-6 pt-4 sm:px-8 sm:pb-8"
        style={{ containerType: "inline-size" }}
      >
        <div className="perforation" aria-hidden="true" />

        <h2 className="mt-5 font-display text-3xl">Invoice</h2>
        <p className="mt-1 font-display text-xl text-stamp">
          <span className="sr-only">Number </span>
          <span aria-hidden="true">No. </span>
          {serial}
        </p>

        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-6 border-y-2 border-carbon py-3 text-base">
          <div>
            <dt className="text-sm text-carbon/70">Bill to</dt>
            <dd className="font-semibold">{invoice.customer}</dd>
          </div>
          <div>
            <dt className="text-sm text-carbon/70">Date</dt>
            <dd className="font-semibold">{today}</dd>
          </div>
        </dl>

        <table className="w-full text-base">
          <caption className="sr-only">Items on this invoice</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody className="rule-rows">
            {invoice.lines.map((line) => (
              <tr key={line.description}>
                <td className="py-3 pr-4">{line.description}</td>
                <td className="py-3 text-right tabular-nums">{money.format(line.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="pt-4 text-left font-semibold">
                Total
              </th>
              <td className="pt-4 text-right font-display text-3xl">{total}</td>
            </tr>
          </tfoot>
        </table>

        {status === "paid" && (
          <span key={serial} className="stamp" aria-hidden="true">
            Paid
          </span>
        )}

        <p aria-live="polite" className="mt-5 min-h-[2.9em] text-base">
          {messages[status]}
        </p>

        <Button
          className="mt-3 w-full"
          aria-disabled={status === "sent"}
          onClick={handleClick}
        >
          {buttonLabels[status]}
        </Button>
      </section>
    </div>
  );
};

export default Invoice;
