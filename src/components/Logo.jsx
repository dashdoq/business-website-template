const Logo = ({ className = "" }) => (
  <a
    href="#home"
    className={`inline-flex items-center gap-2.5 font-display text-2xl leading-none ${className}`}
  >
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
      <rect x="13" y="2" width="15" height="21" rx="1.5" className="fill-pink" transform="rotate(12 20 12)" />
      <rect x="4" y="8" width="15" height="21" rx="1.5" fill="currentColor" />
    </svg>
    HooBank
  </a>
);

export default Logo;
