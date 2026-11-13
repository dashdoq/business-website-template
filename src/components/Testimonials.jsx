import { feedback } from "../constants";
import Clients from "./Clients";
import Feedback from "./Feedback";
import Stats from "./Stats";

const Testimonials = () => (
  <section id="customers" className="bg-canary">
    <div className="wrap py-24 lg:py-32">
      <Stats />
      <p className="mt-6 max-w-[30rem]">Here&rsquo;s what three of them told us.</p>

      <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
        {feedback.map((card) => (
          <Feedback key={card.id} {...card} />
        ))}
      </div>

      <div className="mt-20">
        <Clients />
      </div>
    </div>
  </section>
);

export default Testimonials;
