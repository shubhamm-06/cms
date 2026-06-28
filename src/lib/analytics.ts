type DataLayerValue = boolean | number | string | null;
type DataLayerParams = Record<string, DataLayerValue | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, DataLayerValue>>;
  }
}

export function trackDataLayerEvent(event: string, params: DataLayerParams = {}) {
  if (typeof window === "undefined") return;

  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, DataLayerValue>;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...safeParams,
  });
}
