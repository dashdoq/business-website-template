import { clients } from "../constants";

const LOGO_HEIGHT_REM = 2;

const Clients = () => (
  <div className="flex flex-col gap-x-12 gap-y-6 border-t-2 border-carbon pt-8 lg:flex-row lg:items-center">
    <p className="shrink-0 text-base font-semibold">Some of those companies</p>
    <ul className="flex flex-1 flex-wrap items-center gap-x-12 gap-y-6 lg:justify-between">
      {clients.map((client) => (
        <li key={client.id}>
          <span
            role="img"
            aria-label={client.name}
            className="block bg-carbon"
            style={{
              height: `${LOGO_HEIGHT_REM}rem`,
              width: `${LOGO_HEIGHT_REM * client.ratio}rem`,
              WebkitMask: `url(${client.logo}) center / contain no-repeat`,
              mask: `url(${client.logo}) center / contain no-repeat`,
            }}
          />
        </li>
      ))}
    </ul>
  </div>
);

export default Clients;
