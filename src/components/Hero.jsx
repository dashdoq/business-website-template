import Button from "./Button";
import Invoice from "./Invoice";

const Hero = () => (
  <section id="home" className="overflow-hidden bg-canary">
    <div className="wrap grid items-center gap-x-10 gap-y-16 pb-24 pt-8 lg:grid-cols-12 lg:pb-28 lg:pt-10">
      <div className="headline-box lg:col-span-7">
        <h1 className="headline">
          <span className="block">You do the</span>
          <span className="block">business.</span>
          <span className="block">We&rsquo;ll handle</span>
          <span className="block">the money.</span>
        </h1>
        <p className="mt-8 max-w-[33rem] text-lg">
          HooBank takes your card payments, sends and chases your invoices, and puts a card in
          every pocket on your team. One account, one monthly statement.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Button href="#open-account">Open an account</Button>
          <a href="#features" className="link">
            See what&rsquo;s included
          </a>
        </div>
        <p className="mt-6 text-base">You get 20% off your first month.</p>
      </div>

      <div className="lg:col-span-5">
        <Invoice />
      </div>
    </div>
  </section>
);

export default Hero;
