import { User, ShoppingBag, ArrowRight, MapPin, LogOutIcon } from "lucide-react";

export type MenuSection = "profile" | "orders" | "history" | "addresses";

interface ProfileSidebarProps {
    activeSection: MenuSection;
    setActiveSection: (section: MenuSection) => void;
    onLogout: () => void;
    isLogoutLoading?: boolean;
}

const ProfileSidebar = ({
    activeSection,
    setActiveSection,
    onLogout,
    isLogoutLoading,
}: ProfileSidebarProps) => {
    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <nav className="divide-y divide-slate-200">
                <button
                    onClick={() => setActiveSection("profile")}
                    className={`w-full px-6 py-4 text-left font-semibold transition ${activeSection === "profile"
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    <User className="w-4 h-4 inline mr-3" />
                    My Information
                </button>
                <button
                    onClick={() => setActiveSection("orders")}
                    className={`w-full px-6 py-4 text-left font-semibold transition ${activeSection === "orders"
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    <ShoppingBag className="w-4 h-4 inline mr-3" />
                    Current Orders
                </button>
                <button
                    onClick={() => setActiveSection("history")}
                    className={`w-full px-6 py-4 text-left font-semibold transition ${activeSection === "history"
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    <ArrowRight className="w-4 h-4 inline mr-3" />
                    Order History
                </button>
                <button
                    onClick={() => setActiveSection("addresses")}
                    className={`w-full px-6 py-4 text-left font-semibold transition ${activeSection === "addresses"
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    <MapPin className="w-4 h-4 inline mr-3" />
                    Addresses
                </button>
                <button
                    onClick={onLogout}
                    disabled={isLogoutLoading}
                    className="cursor-pointer w-full px-6 py-4 text-left font-semibold transition text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LogOutIcon className="w-4 h-4 inline mr-3" />
                    {isLogoutLoading ? "Logging out..." : "Logout"}
                </button>
            </nav>
        </div>
    );
};

export default ProfileSidebar;
