import { sizeChart } from "@/content/site";

export function SizeTable() {
  return (
    <div className="max-w-xl overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-left text-sm tabular-nums">
        <caption className="sr-only">Maattabel</caption>
        <thead>
          <tr className="border-b border-line bg-tile">
            <th scope="col" className="py-2.5 pr-4 pl-4 font-semibold">Maat</th>
            <th scope="col" className="py-2.5 pr-4 font-semibold">Schoenmaat (EU)</th>
            <th scope="col" className="py-2.5 pr-4 font-semibold">Voetlengte</th>
          </tr>
        </thead>
        <tbody>
          {sizeChart.map((row) => (
            <tr key={row.size} className="border-b border-line last:border-0">
              <th scope="row" className="py-2.5 pr-4 pl-4 font-semibold">{row.size}</th>
              <td className="py-2.5 pr-4">{row.eu}</td>
              <td className="py-2.5 pr-4">{row.foot}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
