import { signupUrl } from "../constants";
import Button from "./Button";

const CTA = () => (
  <section id="open-account" className="bg-carbon text-white">
    <div className="wrap headline-box py-24 lg:py-32">
      <h2 className="headline max-w-[9em] text-canary">Open an account in ten minutes.</h2>
      <p className="mt-8 max-w-[32rem] text-lg">
        Everything you need to accept card payments and grow your business, anywhere on the
        planet.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
        <Button href={signupUrl} tone="canary">
          Open an account
        </Button>
        <p className="text-base">You get 20% off your first month.</p>
      </div>
    </div>
  </section>
);

export default CTA;
