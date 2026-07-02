import React from "react";

const theme = {
  bg: "#f5f6fa",
  card: "#ffffff",
  textPrimary: "#1f2328",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  black: "#111111",
  blue: "#3b82f6",
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: theme.bg,
  padding: "24px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  color: theme.textPrimary,
};

const HeaderBar: React.FC = () => {
  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  };

  const leftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
  };

  const countStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: theme.textMuted,
  };

  const docLinkStyle: React.CSSProperties = {
    fontSize: "14px",
    color: theme.blue,
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: 500,
  };

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    background: theme.black,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  };

  return (
    <div style={headerStyle}>
      <div style={leftStyle}>
        <span style={titleStyle}>项目列表</span>
        <span style={countStyle}>0</span>
        <span style={docLinkStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: "-2px", marginRight: "4px" }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          文档
        </span>
      </div>
      <button
        style={btnStyle}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#000";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = theme.black;
        }}
      >
        <span style={{ fontSize: "16px", lineHeight: "1", fontWeight: 700 }}>+</span>
        新建项目
      </button>
    </div>
  );
};

const EmptyState: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    background: theme.card,
    borderRadius: "12px",
    border: `1px solid ${theme.border}`,
    padding: "80px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  const iconRow: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "40px",
  };

  const iconStyle = (bg: string): React.CSSProperties => ({
    width: "90px",
    height: "90px",
    borderRadius: "20px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.textSecondary,
    position: "relative",
    zIndex: 2,
  });

  const centerIconStyle: React.CSSProperties = {
    width: "110px",
    height: "110px",
    borderRadius: "24px",
    background: "#fff",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.black,
    position: "relative",
    zIndex: 2,
    margin: "0 24px",
  };

  const connectorLine: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    height: "2px",
    background: `linear-gradient(90deg, ${theme.border} 0%, ${theme.border} 50%, transparent 100%)`,
    backgroundSize: "10px 2px",
    backgroundRepeat: "repeat-x",
    zIndex: 1,
    width: "120px",
    transform: "translateY(-50%)",
  };

  const title: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 600,
    color: theme.textPrimary,
    marginBottom: "8px",
  };

  const description: React.CSSProperties = {
    fontSize: "14px",
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 1.8,
    maxWidth: "400px",
  };

  return (
    <div style={containerStyle}>
      <div style={iconRow}>
        <div style={iconStyle("#f3f4f6")}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
            <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
            <rect x="6" y="8" width="3" height="4" rx="0.5" fill="currentColor" stroke="none" />
            <rect x="10" y="6" width="3" height="4" rx="0.5" fill="currentColor" stroke="none" />
            <rect x="14" y="10" width="3" height="4" rx="0.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div style={{ ...connectorLine, left: "calc(50% - 180px)" }}></div>
        <div style={centerIconStyle}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        </div>
        <div style={{ ...connectorLine, right: "calc(50% - 180px)", background: `linear-gradient(90deg, transparent 0%, ${theme.border} 50%, ${theme.border} 100%)`, backgroundSize: "10px 2px", backgroundRepeat: "repeat-x" }}></div>
        <div style={iconStyle("#f3f4f6")}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
      </div>
      <div style={title}>创建您的第一个项目</div>
      <div style={description}>
        点击此处创建项目，仅需几步即可完成
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div style={pageStyle}>
      <HeaderBar />
      <EmptyState />
    </div>
  );
};

export default App;