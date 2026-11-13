const InkFilter = () => (
  <svg width="0" height="0" className="absolute" aria-hidden="true">
    <filter id="stamp-ink" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="7" result="noise" />
      <feColorMatrix
        in="noise"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.4 2.55"
        result="gaps"
      />
      <feComposite in="SourceGraphic" in2="gaps" operator="in" />
    </filter>
  </svg>
);

export default InkFilter;
