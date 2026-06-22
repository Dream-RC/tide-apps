import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUserStore from "@/store/modules/user";

const Header = () => {
    const { user } = useUserStore();

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white">
                        <img
                            src={user.avatar}
                            className="h-full w-full rounded-full object-cover"
                        />
                    </div>
                    <span className="font-medium">
                        Tide
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-medium text-emerald-700">
                        余额
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15 15" />
                    </svg>
                    <span className="font-semibold tabular-nums">4.98</span>
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <nav className="flex items-center gap-5 text-sm text-gray-600">
                    <a
                        href="#"
                        className="hover:text-gray-900 transition-colors"
                    >
                        引导
                    </a>
                    <a
                        href="#"
                        className="hover:text-gray-900 transition-colors"
                    >
                        文档
                    </a>
                    <a
                        href="#"
                        className="hover:text-gray-900 transition-colors"
                    >
                        工单
                    </a>
                </nav>
                <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                </button>
                <div className="h-8 w-8 cursor-pointer rounded-full ring-2 ring-white shadow-sm overflow-hidden">
                    <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.nickname}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
};

export default Header;
