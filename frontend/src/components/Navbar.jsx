import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Lightbulb, History, Leaf } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/insights', label: 'AI Insights', icon: Lightbulb },
        { path: '/history', label: 'History', icon: History },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Leaf className="h-8 w-8 text-green-600 mr-2" />
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">KrishiAI</span>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                                        location.pathname === item.path
                                            ? 'border-green-600 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    {/* Mobile menu button (simplified for now) */}
                    <div className="flex items-center sm:hidden">
                        <div className="flex space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`${
                                        location.pathname === item.path ? 'text-green-600' : 'text-gray-400'
                                    }`}
                                >
                                    <item.icon className="w-6 h-6" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
