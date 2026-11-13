import { stats } from "../constants";

const Stats = () => (
  <h2 className="heading max-w-[58rem]">
    More than {stats.people} people at {stats.companies} companies have moved {stats.volume}{" "}
    through HooBank.
  </h2>
);

export default Stats;
