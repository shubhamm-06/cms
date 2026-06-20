import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return <table className="cms-table">{children}</table>;
}
