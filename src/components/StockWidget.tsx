import type { StockData } from "@/types";

interface StockWidgetProps {
  data: StockData;
}

export default function StockWidget({ data }: StockWidgetProps) {
  return (
    <section aria-labelledby="stock-heading">
      <h3
        id="stock-heading"
        className="text-lg font-bold font-heading text-(--color-text) mb-4 pb-2 border-b-2 border-(--color-secondary)"
      >
        Börse
      </h3>
      <div className="space-y-2">
        {data.indices.map((index) => {
          const isPositive = index.change >= 0;
          return (
            <div
              key={index.id}
              className="flex items-center justify-between py-2 border-b border-(--color-divider) last:border-b-0"
            >
              <div>
                <span className="text-sm font-semibold text-(--color-text)">
                  {index.name}
                </span>
                <span className="ml-2 text-sm text-(--color-text-secondary)">
                  {index.currency === "EUR"
                    ? index.value.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : index.value.toFixed(index.name === "EUR/USD" ? 4 : 2)}
                </span>
              </div>
              <span
                className={`text-sm font-medium ${isPositive ? "text-(--color-success)" : "text-(--color-error)"}`}
              >
                {isPositive ? "+" : ""}
                {index.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      {data.watchlist.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs font-medium text-(--color-text-secondary) cursor-pointer hover:text-(--color-text) transition-colors">
            Einzelwerte ({data.watchlist.length})
          </summary>
          <div className="mt-2 space-y-1">
            {data.watchlist.map((item) => {
              const isPositive = item.change >= 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-(--color-text)">
                      {item.symbol}
                    </span>
                    <span className="text-(--color-text-tertiary) truncate max-w-[100px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-(--color-text-secondary)">
                      {item.price.toFixed(2)}
                    </span>
                    <span
                      className={`font-medium ${isPositive ? "text-(--color-success)" : "text-(--color-error)"}`}
                    >
                      {isPositive ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </section>
  );
}
