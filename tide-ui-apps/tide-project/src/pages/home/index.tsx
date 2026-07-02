// ============ 样式变量 ============
const theme = {
  card: "#ffffff",
  textPrimary: "#1f2328",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  blue: "#3b82f6",
  blueLight: "#dbeafe",
  green: "#10b981",
  greenLight: "#d1fae5",
  orange: "#f59e0b",
  orangeLight: "#fef3c7",
  purple: "#8b5cf6",
  purpleLight: "#ede9fe",
  red: "#ef4444",
  grayBg: "#f9fafb",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
  shadowLg: "0 4px 12px rgba(0,0,0,0.06)",
};

// ============ 通用容器样式 ============
const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  color: theme.textPrimary,
};

const cardStyle: React.CSSProperties = {
  background: theme.card,
  borderRadius: "12px",
  boxShadow: theme.shadow,
  padding: "20px",
};

// ============ 顶部用户栏 ============
const TopBar: React.FC = () => {
  const barStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  };

  const leftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const avatarStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 30% 30%, #ff9a9e 0%, #fad0c4 30%, #a18cd1 60%, #fbc2eb 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: "18px",
  };

  const infoStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const nameStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 600,
  };

  const subStyle: React.CSSProperties = {
    fontSize: "12px",
    color: theme.textSecondary,
  };

  const rightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const iconBtnStyle: React.CSSProperties = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: theme.grayBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "none",
  };

  const bellIcon: React.CSSProperties = {
    position: "relative",
    width: "18px",
    height: "18px",
  };

  const badgeStyle: React.CSSProperties = {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: theme.red,
  };

  return (
    <div style={barStyle}>
      <div style={leftStyle}>
        <div style={avatarStyle}>RC</div>
        <div style={infoStyle}>
          <div style={nameStyle}>项目管理员</div>
          <div style={subStyle}>
            用户ID: 35637031 · 欢迎回来,今天是 2024年6月10日 星期一
          </div>
        </div>
      </div>
      <div style={rightStyle}>
        <button style={iconBtnStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 7v5l3 2"></path>
          </svg>
          <span style={badgeStyle}></span>
        </button>
        <button style={iconBtnStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// ============ 统计卡片 ============
interface StatCardProps {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon, color, bgColor }) => {
  const container: React.CSSProperties = {
    ...cardStyle,
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const iconBox: React.CSSProperties = {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color,
  };

  const content: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "13px",
    color: theme.textSecondary,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 700,
  };

  const changeStyle: React.CSSProperties = {
    fontSize: "11px",
    color: theme.textMuted,
  };

  const changeColor: React.CSSProperties = {
    color: change >= 0 ? theme.green : theme.red,
    fontWeight: 600,
  };

  return (
    <div style={container}>
      <div style={iconBox}>{icon}</div>
      <div style={content}>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{value}</div>
        <div style={changeStyle}>
          较上月 <span style={changeColor}>{change >= 0 ? "↑" : "↓"} {Math.abs(change)}</span>
        </div>
      </div>
    </div>
  );
};

const StatCards: React.FC = () => {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  };

  const icons = {
    folder: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    users: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    clock: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 7v5l4 2"></path>
      </svg>
    ),
    bell: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    ),
  };

  return (
    <div style={gridStyle}>
      <StatCard label="我管理的项目" value={4} change={1} icon={icons.folder} color={theme.blue} bgColor={theme.blueLight} />
      <StatCard label="我参与的项目" value={7} change={2} icon={icons.users} color={theme.green} bgColor={theme.greenLight} />
      <StatCard label="待处理审批" value={12} change={3} icon={icons.clock} color={theme.orange} bgColor={theme.orangeLight} />
      <StatCard label="项目通知" value={3} change={-1} icon={icons.bell} color={theme.purple} bgColor={theme.purpleLight} />
    </div>
  );
};

// ============ 主要内容区：项目概览 + 最近动态 + 快捷操作 ============
const MainContent: React.FC = () => {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1.3fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  };

  return (
    <div style={gridStyle}>
      <ProjectOverview />
      <RecentActivity />
      <QuickActions />
    </div>
  );
};

// 项目概览
const ProjectOverview: React.FC = () => {
  const title: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "16px",
  };

  const donutBox: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 0 16px",
  };

  const ring = {
    total: 30,
    progress: 20,
    completed: 6,
    paused: 3,
    notStarted: 1,
  };

  const getSegment = (value: number, color: string, offset: number) => {
    const circumference = 2 * Math.PI * 60;
    const length = (value / ring.total) * circumference;
    return (
      <circle
        cx="80"
        cy="80"
        r="60"
        fill="transparent"
        stroke={color}
        strokeWidth="16"
        strokeDasharray={`${length} ${circumference}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 80 80)"
      />
    );
  };

  const circumference = 2 * Math.PI * 60;
  const progressLen = (ring.progress / ring.total) * circumference;
  const completedLen = (ring.completed / ring.total) * circumference;
  const pausedLen = (ring.paused / ring.total) * circumference;

  const legendStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontSize: "13px",
    color: theme.textSecondary,
  };

  const legendItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const dotRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <div style={cardStyle}>
      <div style={title}>项目概览</div>
      <div style={donutBox}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f3f4f6" strokeWidth="16" />
          {getSegment(ring.progress, theme.blue, 0)}
          {getSegment(ring.completed, theme.green, progressLen)}
          {getSegment(ring.paused, theme.orange, progressLen + completedLen)}
          <text x="80" y="78" textAnchor="middle" fontSize="26" fontWeight="700" fill={theme.textPrimary}>68%</text>
          <text x="80" y="96" textAnchor="middle" fontSize="12" fill={theme.textSecondary}>整体进度</text>
        </svg>
      </div>
      <div style={legendStyle}>
        <div style={legendItemStyle}>
          <div style={dotRow}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.blue }}></span>
            进行中项目
          </div>
          <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{ring.progress}</span>
        </div>
        <div style={legendItemStyle}>
          <div style={dotRow}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.green }}></span>
            已完成项目
          </div>
          <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{ring.completed}</span>
        </div>
        <div style={legendItemStyle}>
          <div style={dotRow}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.orange }}></span>
            已暂停项目
          </div>
          <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{ring.paused}</span>
        </div>
        <div style={legendItemStyle}>
          <div style={dotRow}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.grayBg, border: `1px solid ${theme.border}` }}></span>
            未开始项目
          </div>
          <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{ring.notStarted}</span>
        </div>
      </div>
    </div>
  );
};

// 最近动态
const RecentActivity: React.FC = () => {
  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  };

  const title: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
  };

  const more: React.CSSProperties = {
    fontSize: "12px",
    color: theme.blue,
    cursor: "pointer",
  };

  const items = [
    { time: "09:15", text: "「企业官网改版」有新的审批待处理", type: "审批", color: theme.orange },
    { time: "09:30", text: "「移动端开发」任务已更新", type: "任务", color: theme.blue },
    { time: "昨天 16:20", text: "「数据分析平台」文档已上传", type: "文档", color: theme.green },
    { time: "昨天 16:45", text: "「产品设计系统」成员申请加入", type: "成员", color: theme.purple },
  ];

  return (
    <div style={cardStyle}>
      <div style={header}>
        <div style={title}>最近动态</div>
        <div style={more}>查看全部动态 →</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px",
              background: item.color + "15",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: item.color, flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "13px" }}>{item.text}</div>
              <div style={{ fontSize: "11px", color: theme.textMuted }}>{item.time}</div>
            </div>
            <span style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "4px",
              background: item.color + "15",
              color: item.color,
            }}>{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 快捷操作
const QuickActions: React.FC = () => {
  const title: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "16px",
  };

  const actions = [
    { label: "创建项目", color: theme.blue, icon: "+" },
    { label: "邀请成员", color: theme.green, icon: "👥" },
    { label: "发起审批", color: theme.orange, icon: "📋" },
    { label: "新建任务", color: theme.purple, icon: "✓" },
  ];

  return (
    <div style={cardStyle}>
      <div style={title}>快捷操作</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {actions.map((a, idx) => (
          <button key={idx} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "16px 8px",
            border: `1px solid ${theme.border}`,
            borderRadius: "8px",
            background: "#fff",
            cursor: "pointer",
            transition: "all 0.2s",
          }} onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = a.color;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 2px 8px ${a.color}20`;
          }} onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = theme.border;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: a.color + "15",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: a.color, fontSize: "16px", fontWeight: 700,
            }}>{a.icon}</div>
            <span style={{ fontSize: "12px", color: theme.textPrimary }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============ 下方内容：我的项目 + 项目成员 + 待处理审批 ============
const BottomContent: React.FC = () => {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1.3fr",
    gap: "16px",
    marginBottom: "24px",
  };

  return (
    <div style={gridStyle}>
      <MyProjects />
      <ProjectMembers />
      <PendingApproval />
    </div>
  );
};

// 我的项目
const MyProjects: React.FC = () => {
  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  };

  const title: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
  };

  const more: React.CSSProperties = {
    fontSize: "12px",
    color: theme.blue,
    cursor: "pointer",
  };

  const projects = [
    { name: "企业官网改版", role: "管理员", progress: 80, date: "2024-06-20", color: theme.blue },
    { name: "移动端开发", role: "管理员", progress: 65, date: "2024-06-18", color: theme.green },
    { name: "数据分析平台", role: "普通成员", progress: 45, date: "2024-06-15", color: theme.orange },
    { name: "产品设计系统", role: "普通成员", progress: 90, date: "2024-06-10", color: theme.purple },
    { name: "内部协作工具", role: "管理员", progress: 30, date: "2024-06-08", color: "#ec4899" },
  ];

  const tableHeader: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1.2fr 1fr",
    fontSize: "12px",
    color: theme.textMuted,
    padding: "8px 0",
    borderBottom: `1px solid ${theme.border}`,
    marginBottom: "4px",
  };

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1.2fr 1fr",
    padding: "12px 0",
    alignItems: "center",
    fontSize: "13px",
    borderBottom: `1px solid ${theme.grayBg}`,
  };

  return (
    <div style={cardStyle}>
      <div style={header}>
        <div style={title}>我的项目</div>
        <div style={more}>查看全部 →</div>
      </div>
      <div style={tableHeader}>
        <div>项目名称</div>
        <div>角色</div>
        <div>进度</div>
        <div>更新时间</div>
      </div>
      {projects.map((p, idx) => (
        <div key={idx} style={rowStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "6px",
              background: p.color + "20", color: p.color,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700,
            }}>📁</div>
            <span style={{ fontWeight: 500 }}>{p.name}</span>
          </div>
          <div style={{ color: theme.textSecondary, fontSize: "12px" }}>{p.role}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{
              width: "100%", height: "6px", background: theme.grayBg,
              borderRadius: "3px", overflow: "hidden",
            }}>
              <div style={{
                width: `${p.progress}%`, height: "100%",
                background: p.progress >= 80 ? theme.green : p.progress >= 50 ? theme.blue : theme.orange,
                borderRadius: "3px",
              }}></div>
            </div>
            <span style={{ fontSize: "11px", color: theme.textMuted }}>{p.progress}%</span>
          </div>
          <div style={{ color: theme.textMuted, fontSize: "12px" }}>{p.date}</div>
        </div>
      ))}
    </div>
  );
};

// 项目成员
const ProjectMembers: React.FC = () => {
  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  };

  const title: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
  };

  const more: React.CSSProperties = {
    fontSize: "12px",
    color: theme.blue,
    cursor: "pointer",
  };

  const statBar: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-around",
    padding: "12px",
    background: theme.grayBg,
    borderRadius: "8px",
    marginBottom: "16px",
  };

  const statItem: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  };

  const members = [
    { name: "张三", role: "系统工程师", date: "2024-06-18", color: theme.blue, initial: "张" },
    { name: "李四", role: "前端工程师", date: "2024-06-15", color: theme.green, initial: "李" },
    { name: "王五", role: "设计师", date: "2024-06-12", color: theme.orange, initial: "王" },
    { name: "赵六", role: "产品经理", date: "2024-06-08", color: theme.purple, initial: "赵" },
  ];

  return (
    <div style={cardStyle}>
      <div style={header}>
        <div style={title}>项目成员</div>
        <div style={more}>查看全部 →</div>
      </div>
      <div style={statBar}>
        <div style={statItem}>
          <span style={{ fontSize: "18px", fontWeight: 700 }}>32</span>
          <span style={{ fontSize: "11px", color: theme.textSecondary }}>总人数</span>
        </div>
        <div style={statItem}>
          <span style={{ fontSize: "18px", fontWeight: 700, color: theme.blue }}>5</span>
          <span style={{ fontSize: "11px", color: theme.textSecondary }}>管理员</span>
        </div>
        <div style={statItem}>
          <span style={{ fontSize: "18px", fontWeight: 700, color: theme.green }}>12</span>
          <span style={{ fontSize: "11px", color: theme.textSecondary }}>开发人员</span>
        </div>
        <div style={statItem}>
          <span style={{ fontSize: "18px", fontWeight: 700, color: theme.orange }}>8</span>
          <span style={{ fontSize: "11px", color: theme.textSecondary }}>设计人员</span>
        </div>
        <div style={statItem}>
          <span style={{ fontSize: "18px", fontWeight: 700, color: theme.purple }}>7</span>
          <span style={{ fontSize: "11px", color: theme.textSecondary }}>其他人员</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {members.map((m, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: m.color, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 600, flexShrink: 0,
            }}>{m.initial}</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "13px", fontWeight: 500 }}>{m.name}</span>
              <span style={{ fontSize: "11px", color: theme.textMuted }}>{m.role}</span>
            </div>
            <span style={{ fontSize: "11px", color: theme.textMuted }}>{m.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 待处理审批
const PendingApproval: React.FC = () => {
  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  };

  const title: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
  };

  const more: React.CSSProperties = {
    fontSize: "12px",
    color: theme.blue,
    cursor: "pointer",
  };

  const approvals = [
    { title: "企业官网改版 - 需求变更申请", project: "企业官网改版", user: "李四", time: "10分钟前" },
    { title: "李四 申请加入项目", project: "移动端开发", user: "李四", time: "30分钟前" },
    { title: "数据分析平台 - 文档上传审批", project: "数据分析平台", user: "王五", time: "1小时前" },
    { title: "移动端开发 - 任务延期申请", project: "移动端开发", user: "赵六", time: "2小时前" },
  ];

  const btnGo: React.CSSProperties = {
    padding: "4px 10px",
    fontSize: "11px",
    border: `1px solid ${theme.blue}`,
    background: "#fff",
    color: theme.blue,
    borderRadius: "4px",
    cursor: "pointer",
  };

  const btnReview: React.CSSProperties = {
    padding: "4px 10px",
    fontSize: "11px",
    border: `1px solid ${theme.green}`,
    background: "#fff",
    color: theme.green,
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <div style={cardStyle}>
      <div style={header}>
        <div style={title}>待处理审批</div>
        <div style={more}>查看全部 →</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {approvals.map((a, idx) => (
          <div key={idx} style={{
            padding: "12px",
            background: theme.grayBg,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 500 }}>{a.title}</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: theme.textMuted }}>
                {a.user} · {a.project} · {a.time}
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {idx % 2 === 0 ? (
                  <button style={btnGo}>去处理</button>
                ) : (
                  <button style={btnReview}>去处理</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ 最下方：任务统计 + 项目文件 + 项目通知 ============
const FooterContent: React.FC = () => {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1.2fr",
    gap: "16px",
  };

  return (
    <div style={gridStyle}>
      <TaskStats />
      <ProjectFiles />
      <ProjectNotifications />
    </div>
  );
};

// 任务统计
const TaskStats: React.FC = () => {
  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  };

  const title: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
  };

  // 生成模拟图表数据
  const chartData = [
    { day: "1日", tasks: 5, completed: 3 },
    { day: "2日", tasks: 8, completed: 6 },
    { day: "3日", tasks: 6, completed: 4 },
    { day: "4日", tasks: 10, completed: 7 },
    { day: "5日", tasks: 7, completed: 5 },
    { day: "6日", tasks: 4, completed: 3 },
    { day: "7日", tasks: 9, completed: 6 },
    { day: "8日", tasks: 12, completed: 8 },
    { day: "9日", tasks: 11, completed: 9 },
    { day: "10日", tasks: 15, completed: 11 },
    { day: "11日", tasks: 13, completed: 10 },
    { day: "12日", tasks: 14, completed: 12 },
    { day: "13日", tasks: 10, completed: 8 },
  ];

  const maxVal = Math.max(...chartData.map((d) => d.tasks));
  const chartHeight = 140;
  const chartWidth = 320;
  const paddingLeft = 30;
  const paddingBottom = 25;

  const getX = (i: number) =>
    paddingLeft + (i * (chartWidth - paddingLeft - 10)) / (chartData.length - 1);
  const getY = (v: number) => chartHeight - paddingBottom - (v / maxVal) * (chartHeight - paddingBottom - 10);

  // 生成折线点
  const taskPoints = chartData.map((d, i) => `${getX(i)},${getY(d.tasks)}`).join(" ");
  const completedPoints = chartData.map((d, i) => `${getX(i)},${getY(d.completed)}`).join(" ");

  const summaryRow: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: `1px solid ${theme.border}`,
  };

  const summaryItem: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  };

  return (
    <div style={cardStyle}>
      <div style={header}>
        <div style={title}>任务统计</div>
        <span style={{ fontSize: "11px", color: theme.textMuted }}>最近13天</span>
      </div>

      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ display: "block" }}>
        {/* Y轴刻度 */}
        {[0, 5, 10, 15].map((v) => (
          <g key={v}>
            <line
              x1={paddingLeft}
              y1={getY(v)}
              x2={chartWidth - 10}
              y2={getY(v)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <text x={paddingLeft - 6} y={getY(v) + 3} fontSize="10" fill={theme.textMuted} textAnchor="end">
              {v}
            </text>
          </g>
        ))}

        {/* X轴标签 */}
        {chartData.map((d, i) => (
          i % 3 === 0 ? (
            <text key={i} x={getX(i)} y={chartHeight - 8} fontSize="10" fill={theme.textMuted} textAnchor="middle">
              {d.day}
            </text>
          ) : null
        ))}

        {/* 任务折线 (蓝色区域填充) */}
        <polyline
          points={`${paddingLeft},${getY(0)} ${taskPoints} ${chartWidth - 10},${getY(0)}`}
          fill={theme.blue + "15"}
          stroke="none"
        />
        <polyline points={taskPoints} fill="none" stroke={theme.blue} strokeWidth="2" />

        {/* 已完成折线 */}
        <polyline points={completedPoints} fill="none" stroke={theme.green} strokeWidth="2" />

        {/* 数据点 */}
        {chartData.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.tasks)} r="3" fill="#fff" stroke={theme.blue} strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.completed)} r="3" fill="#fff" stroke={theme.green} strokeWidth="2" />
          </g>
        ))}

        {/* 高亮当前点 */}
        <circle cx={getX(12)} cy={getY(chartData[12].tasks)} r="5" fill={theme.blue} opacity="0.2" />
        <text x={getX(12)} y={getY(chartData[12].tasks) - 8} fontSize="10" fill={theme.blue} textAnchor="middle" fontWeight="600">
          完成任务: 85
        </text>
      </svg>

      {/* 图例 */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: theme.textSecondary }}>
          <span style={{ width: "10px", height: "2px", background: theme.blue }}></span>
          总任务
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: theme.textSecondary }}>
          <span style={{ width: "10px", height: "2px", background: theme.green }}></span>
          已完成
        </div>
      </div>

      <div style={summaryRow}>
        <div style={summaryItem}>
          <span style={{ fontSize: "16px", fontWeight: 700 }}>128</span>
          <span style={{ fontSize: "11px", color: theme.textSecondary }}>总任务数</span>
        </div>
        <div style={summaryItem}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: theme.green }}>86</span>
          <span style={{ fontSize: "11px", color: theme.textSecondary }}>已完成</span>
        </div>
        <div style={summaryItem}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: theme.blue }}>67%</span>
          <span style={{ fontSize: "11px", color: theme.textSecondary }}>完成率</span>
        </div>
        <div style={summaryItem}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: theme.orange }}>12</span>
          <span style={{ fontSize: "11px", color: theme.textSecondary }}>待处理</span>
        </div>
      </div>
    </div>
  );
};

// 项目文件
const ProjectFiles: React.FC = () => {
  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  };

  const title: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
  };

  const more: React.CSSProperties = {
    fontSize: "12px",
    color: theme.blue,
    cursor: "pointer",
  };

  const files = [
    { name: "产品需求文档V2.0.pdf", project: "企业官网改版", date: "2024-06-20", color: "#ef4444", icon: "P" },
    { name: "设计规范V1.0.sketch", project: "产品设计系统", date: "2024-06-18", color: "#8b5cf6", icon: "S" },
    { name: "数据分析报告.docx", project: "数据分析平台", date: "2024-06-15", color: "#3b82f6", icon: "D" },
    { name: "项目计划表.xlsx", project: "企业官网改版", date: "2024-06-10", color: "#10b981", icon: "X" },
  ];

  return (
    <div style={cardStyle}>
      <div style={header}>
        <div style={title}>项目文件</div>
        <div style={more}>查看全部 →</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {files.map((f, idx) => (
          <div key={idx} style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            borderRadius: "8px",
            background: theme.grayBg,
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: f.color + "20", color: f.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700, flexShrink: 0,
            }}>{f.icon}</div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "12px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <span style={{ fontSize: "11px", color: theme.textMuted }}>{f.project} · {f.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 项目通知
const ProjectNotifications: React.FC = () => {
  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  };

  const title: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
  };

  const notifications = [
    { text: "系统维护通知: 将于6月20日 02:00-04:00进行系统维护", time: "10:30", type: "系统" },
    { text: "项目进度提醒: 移动端开发 剩余30%,请及时跟进", time: "昨天", type: "提醒" },
    { text: "成员申请通知: 有2人申请加入项目,请及时处理", time: "2天前", type: "成员" },
    { text: "任务截止提醒: 有3个任务将在3天内到期", time: "3天前", type: "任务" },
  ];

  return (
    <div style={cardStyle}>
      <div style={header}>
        <div style={title}>项目通知</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {notifications.map((n, idx) => (
          <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: theme.blueLight, color: theme.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", lineHeight: 1.5 }}>{n.text}</span>
              <span style={{ fontSize: "11px", color: theme.textMuted }}>{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ 主应用 ============
const App: React.FC = () => {
  return (
    <div style={pageStyle}>
      <TopBar />
      <StatCards />
      <MainContent />
      <BottomContent />
      <FooterContent />
    </div>
  );
};

export default App;