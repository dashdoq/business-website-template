"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/content/site";

/**
 * Contact form layout. Sending is connected together with the backend; until
 * then it points people to the e-mail address instead of pretending to send.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.currentTarget.reportValidity()) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div role="status" className="max-w-xl space-y-3 bg-ecru p-6">
        <p className="text-lg font-semibold">Het formulier werkt nog niet.</p>
        <p>
          Je bericht is niet verstuurd. Mail ons op{" "}
          <a href={`mailto:${site.email}`} className="link">
            {site.email}
          </a>
          , dan antwoorden we zo snel mogelijk.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="contact-naam" className="text-sm">Naam</label>
        <input id="contact-naam" name="naam" autoComplete="name" required className="field" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="contact-email" className="text-sm">E-mailadres</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required className="field" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="contact-bestelling" className="text-sm">
          Bestelnummer <span className="text-stone">(als je dat hebt)</span>
        </label>
        <input id="contact-bestelling" name="bestelling" className="field" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="contact-bericht" className="text-sm">Bericht</label>
        <textarea id="contact-bericht" name="bericht" rows={6} required className="field py-2" />
      </div>
      <button type="submit" className="btn-primary">Bericht versturen</button>
    </form>
  );
}
