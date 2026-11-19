import { sizeChart } from "@/content/site";

export function SizeTable() {
  return (
    <div className="max-w-xl overflow-x-auto">
      <table className="w-full text-left text-sm tabular-nums">
        <caption className="sr-only">Maattabel</caption>
        <thead>
          <tr className="border-b border-ink">
            <th scope="col" className="py-2 pr-4 font-semibold">Maat</th>
            <th scope="col" className="py-2 pr-4 font-semibold">Schoenmaat (EU)</th>
            <th scope="col" className="py-2 font-semibold">Voetlengte</th>
          </tr>
        </thead>
        <tbody>
          {sizeChart.map((row) => (
            <tr key={row.size} className="border-b border-line">
              <th scope="row" className="py-2.5 pr-4 font-semibold">{row.size}</th>
              <td className="py-2.5 pr-4">{row.eu}</td>
              <td className="py-2.5">{row.foot}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
