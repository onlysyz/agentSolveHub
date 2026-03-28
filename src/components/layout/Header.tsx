import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();

  const navItems = [
    { label: '问题库', path: '/' },
    { label: '分类', path: '/categories' },
    { label: '提交问题', path: '/submit-problem' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#5e7da5]/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#005bc4] to-[#695781] flex items-center justify-center">
              <span className="text-white font-bold text-sm">AS</span>
            </div>
            <span className="font-semibold text-[#1a1a1a] hidden sm:block">Agent Solve Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'text-[#005bc4]'
                    : 'text-[#575f72] hover:text-[#1a1a1a]'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="p-2 text-[#575f72] hover:text-[#1a1a1a] transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/submit-problem"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#005bc4] text-white rounded text-sm font-medium hover:bg-[#004a9f] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  提交问题
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-full bg-[#575f72]/10 hover:bg-[#575f72]/20 transition-colors"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-[#575f72]" />
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-[#005bc4] hover:bg-[#005bc4]/10 rounded transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium bg-[#005bc4] text-white rounded hover:bg-[#004a9f] transition-colors"
                >
                  注册
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[#575f72] hover:text-[#1a1a1a]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#5e7da5]/10">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-3 py-2 rounded text-sm font-medium transition-colors',
                    isActive(item.path)
                      ? 'bg-[#005bc4]/10 text-[#005bc4]'
                      : 'text-[#575f72] hover:bg-[#575f72]/10'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
