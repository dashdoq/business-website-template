import { footerLinks, socialMedia } from "../constants";
import Logo from "./Logo";

const Footer = () => (
  <footer className="bg-carbon text-white">
    <div className="wrap pb-10">
      <div className="grid gap-x-10 gap-y-12 border-t border-white/30 pt-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo className="text-canary" />
          <p className="mt-5 max-w-[20rem]">
            A new way to make payments easy, reliable and secure.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-7">
          {footerLinks.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-base font-semibold text-canary">{group.title}</h3>
              <ul className="mt-4 space-y-3 text-base">
                {group.links.map((item) => (
                  <li key={item.name}>
                    <a href={item.link} className="hover:underline hover:decoration-2 hover:underline-offset-[0.3em]">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/30 pt-6 sm:flex-row sm:items-center">
        <p className="text-base">&copy; {new Date().getFullYear()} HooBank. All rights reserved.</p>
        <ul className="flex items-center gap-6">
          {socialMedia.map((social) => (
            <li key={social.id}>
              <a href={social.link} aria-label={social.name} className="block p-1">
                <img src={social.icon} alt="" className="h-[21px] w-[21px] object-contain" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;
