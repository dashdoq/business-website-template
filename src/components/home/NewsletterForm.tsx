"use client";

import { useState, type FormEvent } from "react";

/**
 * Sign-up for drop announcements. Not connected yet: it confirms locally and
 * says so, until a mailing service is chosen with the backend.
 */
export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "error" | "sent">("idle");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setStatus(typeof email === "string" && /^\S+@\S+\.\S+$/.test(email) ? "sent" : "error");
  };

  return (
    <section aria-labelledby="nieuwsbrief-titel" className="wrap mt-20 lg:mt-28">
      <div className="grid gap-8 rounded-2xl bg-ecru p-6 sm:p-10 md:grid-cols-2 md:items-end lg:p-14">
        <div className="space-y-4">
          <h2 id="nieuwsbrief-titel" className="display-lg">
            Hoor als eerste van de volgende drop.
          </h2>
          <p className="max-w-[44ch] text-stone">
            Eén mail per drop, met de modellen, de oplage en de dag waarop de verkoop begint.
          </p>
        </div>
        {status === "sent" ? (
          <p role="status" className="text-lg">
            Dank je. Inschrijven werkt zodra de webshop open is; tot die tijd bewaren we nog geen adressen.
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-2">
            <label htmlFor="nieuwsbrief-email" className="text-sm">
              E-mailadres
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="nieuwsbrief-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="jij@voorbeeld.nl"
                className="field min-h-12"
                aria-invalid={status === "error"}
                aria-describedby={status === "error" ? "nieuwsbrief-fout" : undefined}
              />
              <button type="submit" className="btn-primary shrink-0">
                Inschrijven
              </button>
            </div>
            {status === "error" && (
              <p id="nieuwsbrief-fout" className="text-sm">
                Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.nl.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
