import { useState } from "react";
import { navLinks } from "../constants";
import Button from "./Button";
import Logo from "./Logo";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-canary">
      <nav aria-label="Main" className="wrap flex items-center justify-between gap-6 py-5">
        <Logo />

        <ul className="hidden items-center gap-9 md:flex">
          {navLinks.map((nav) => (
            <li key={nav.id}>
              <a href={`#${nav.id}`} className="text-base font-medium hover:underline hover:decoration-2 hover:underline-offset-[0.3em]">
                {nav.title}
              </a>
            </li>
          ))}
          <li>
            <Button href="#open-account" small>
              Open an account
            </Button>
          </li>
        </ul>

        <button
          type="button"
          className="rounded-[3px] border-2 border-carbon px-4 py-2 text-base font-semibold md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((previous) => !previous)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      <div id="mobile-menu" hidden={!open} className="wrap pb-6 md:hidden">
        <ul className="rule-rows border-t-2 border-carbon">
          {navLinks.map((nav) => (
            <li key={nav.id}>
              <a
                href={`#${nav.id}`}
                className="block py-4 font-display text-2xl"
                onClick={() => setOpen(false)}
              >
                {nav.title}
              </a>
            </li>
          ))}
        </ul>
        <Button href="#open-account" className="mt-6 w-full" onClick={() => setOpen(false)}>
          Open an account
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
