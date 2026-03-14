import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Lightbulb, History, Leaf, Globe, LogOut, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { lang, setLang, t } = useLanguage();

    const navItems = [
        { path: '/', label: t.nav.dashboard, icon: LayoutDashboard },
        { path: '/insights', label: t.nav.insights, icon: Lightbulb },
        { path: '/satellite-monitoring', label: t.nav.satellite, icon: Globe },
        { path: '/history', label: t.nav.history, icon: History },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="w-full md:w-72 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 z-50">
            <div className="p-6">
                <div className="flex items-center space-x-3 mb-10">
                    <div className="p-2 bg-green-600 rounded-xl">
                        <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-gray-800 tracking-tighter">KrishiAI</span>
                </div>

                <div className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                                location.pathname === item.path
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-green-600'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-white' : 'group-hover:text-green-600'}`} />
                            <span className="font-bold">{item.label}</span>
                            {item.path === '/satellite-monitoring' && (
                                <span className="ml-auto text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black animate-pulse">SIH ELITE</span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mt-auto p-6 space-y-4">
                {/* Language Toggle */}
                <button 
                    onClick={() => {
                        const cycle = { 'en': 'hi', 'hi': 'or', 'or': 'en' };
                        setLang(cycle[lang]);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl text-gray-600 hover:bg-gray-100 transition shadow-sm border border-gray-100"
                >
                    <div className="flex items-center space-x-3 text-sm font-bold">
                        <Globe className="w-4 h-4 text-green-600" />
                        <span className="capitalize">{lang === 'or' ? 'ଓଡ଼ିଆ' : lang === 'hi' ? 'हिन्दी' : 'English'}</span>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-black">Next</span>
                </button>

                {/* User Info / Auth */}
                {user ? (
                    <div className="p-4 bg-gray-900 rounded-3xl text-white shadow-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                {(user.name || user.email || 'F').charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate">{user.name || user.email || 'Farmer'}</p>
                                <p className="text-[10px] text-gray-400 truncate opacity-70">Farmer Profile</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition"
                        >
                            <LogOut className="w-4 h-4 text-red-400" />
                            <span>{t.nav.logout}</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Link 
                            to="/login"
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition active:scale-95"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>{t.nav.login}</span>
                        </Link>
                        <Link 
                            to="/signup"
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-white border-2 border-green-600 text-green-600 rounded-2xl font-bold hover:bg-green-50 transition active:scale-95"
                        >
                            <span>{t.nav.signup}</span>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
