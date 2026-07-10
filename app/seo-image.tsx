import { ImageResponse } from "next/og";

export const seoImageSize = {
  width: 1200,
  height: 630,
} as const;

export const seoImageContentType = "image/png";

export function createSeoImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#fbf7f1",
          color: "#1f1a17",
          position: "relative",
          fontFamily:
            "Figtree, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(251,247,241,0.98) 42%, rgba(246,233,224,1) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 64,
            width: 104,
            height: 104,
            display: "flex",
            borderRadius: 999,
            background:
              "linear-gradient(160deg, #f39a72 0%, #ffb651 56%, #3f8ea0 100%)",
            boxShadow: "0 18px 44px rgba(53, 37, 28, 0.16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 112,
            left: 188,
            right: 80,
            height: 1,
            display: "flex",
            background: "rgba(95, 72, 56, 0.18)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "74px 74px 62px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              maxWidth: 900,
              marginTop: 92,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 700,
                color: "#c95c45",
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Goa owner operations
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 70,
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: -2.2,
              }}
            >
              CurateMyStay
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 36,
                lineHeight: 1.14,
                fontWeight: 650,
                color: "#2e2722",
                maxWidth: 820,
              }}
            >
              Goa Vacation Rental Property Management
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.35,
                color: "#5b4d45",
                maxWidth: 860,
              }}
            >
              Transparent operations for property owners
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              {[
                "Transparent reporting",
                "Owner-first visibility",
                "Managed rental operations",
              ].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 22px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.82)",
                    border: "1px solid rgba(95, 72, 56, 0.16)",
                    color: "#3e3530",
                    fontSize: 22,
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                width: 148,
                height: 8,
                borderRadius: 999,
                background: "linear-gradient(90deg, #d96d52 0%, #ffb651 100%)",
              }}
            />
          </div>
        </div>
      </div>
    ),
    seoImageSize,
  );
}
