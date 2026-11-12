import { goaStaysCopy } from "@/src/features/goa-stays/goa-stays-copy";

const { compare } = goaStaysCopy;

export function GoaStaysComparison() {
  return (
    <section className="scroll-mt-20 px-4 py-12 sm:px-6 sm:py-14 md:px-8 lg:scroll-mt-24 lg:py-16" id="compare">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="text-[26px] font-extrabold tracking-[-0.02em] text-public-ink sm:text-[30px]">{compare.heading}</h2>
        <p className="mt-1.5 text-[15px] leading-6 text-public-body">{compare.intro}</p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-public-hairline">
          <table className="w-full min-w-[640px] border-collapse text-left text-[15px] leading-6">
            <caption className="sr-only">{compare.caption}</caption>
            <thead>
              <tr className="border-b border-public-hairline">
                <td className="p-4" />
                {compare.columns.map((column, index) => (
                  <th
                    className={`p-4 align-top text-[15px] ${index === compare.columns.length - 1 ? "bg-public-coral-soft font-extrabold text-public-ink" : "font-semibold text-public-body"}`}
                    key={column}
                    scope="col"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compare.rows.map((row) => (
                <tr className="border-b border-public-divider last:border-b-0" key={row.label}>
                  <th className="p-4 align-top font-semibold text-public-ink" scope="row">{row.label}</th>
                  {row.cells.map((cell, index) => (
                    <td
                      className={`p-4 align-top ${index === row.cells.length - 1 ? "bg-public-coral-soft text-public-ink" : "text-public-body"}`}
                      key={index}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-public-muted">{compare.note}</p>
      </div>
    </section>
  );
}
