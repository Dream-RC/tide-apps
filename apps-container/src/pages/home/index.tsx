import { useEffect, useMemo } from "react";
import useAppsStore from "@/store/modules/appsStore";
import { useNavigate } from "react-router";

const GRADIENTS = [
    "from-slate-700 to-slate-900",
    "from-sky-400 to-sky-600",
    "from-emerald-400 to-emerald-600",
    "from-violet-400 to-violet-600",
    "from-rose-400 to-rose-600",
    "from-amber-400 to-amber-600",
    "from-cyan-400 to-cyan-600",
    "from-indigo-400 to-indigo-600",
    "from-teal-400 to-teal-600",
    "from-orange-400 to-orange-600",
];

const Home = () => {
    const navigate = useNavigate();
    const { apps, fetchApps } = useAppsStore();

    useEffect(() => {
        fetchApps();
    }, [fetchApps]);

    const mainApps = useMemo(() => {
        return apps.map((app, idx) => ({
            ...app,
            gradient: GRADIENTS[idx % GRADIENTS.length],
            displayName: app.appName || app.appCode,
        }));
    }, [apps]);

    const miniApps = useMemo(() => {
        return apps.slice(0, 4).map((app, idx) => ({
            ...app,
            gradient: GRADIENTS[(idx + 4) % GRADIENTS.length],
            displayName: app.appName || app.appCode,
        }));
    }, [apps]);

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#fafafa]">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: "48px 48px",
                    maskImage:
                        "linear-gradient(to bottom, transparent 0%, black 20%, black 60%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, black 20%, black 60%, transparent 100%)",
                }}
            />

            <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none">
                <div
                    className="absolute bottom-0 left-0 right-0 h-full"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(100,100,100,0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(100,100,100,0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                        transform: "perspective(500px) rotateX(60deg)",
                        transformOrigin: "bottom",
                        maskImage:
                            "linear-gradient(to bottom, transparent 0%, black 40%, black 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to bottom, transparent 0%, black 40%, black 100%)",
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 flex flex-col items-center pt-16">
                <div className="mb-14 flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm text-gray-500 shadow-sm backdrop-blur-sm hover:bg-white hover:shadow transition-all cursor-pointer">
                    <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>不知道从哪里开始？查看指南了解主要功能。</span>
                    <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </div>

                <div className="flex items-start gap-12">
                    {mainApps.map((app) => (
                        <button
                            key={app.appCode}
                            onClick={() => navigate(`/${app.appCode}`)}
                            className="group flex flex-col items-center gap-3 transition-all duration-200 hover:-translate-y-1"
                        >
                            <div
                                className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${app.gradient} shadow-lg transition-all duration-200 group-hover:shadow-2xl group-hover:scale-105`}
                            >
                                <span className="text-2xl font-bold text-white">
                                    {app.displayName.charAt(0)}
                                </span>
                            </div>
                            <span className="text-sm text-gray-700 transition-colors group-hover:text-gray-900">
                                {app.displayName}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mt-auto mb-8 flex items-center justify-center">
                    <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-sm">
                        <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="6 15 12 9 18 15" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;