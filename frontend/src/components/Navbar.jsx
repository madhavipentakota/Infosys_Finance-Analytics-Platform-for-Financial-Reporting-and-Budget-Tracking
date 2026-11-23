import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, ShieldCheck, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-950/95 backdrop-blur-xl border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-400/40 transition-all">
            <Sprout className="w-5 h-5 text-navy-950 group-hover:scale-110 transition-transform stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">OilCrop</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold tracking-wider uppercase">
                Intelligence
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Real-World Oilseed Agriculture Analytics</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 bg-navy-900/80">
          <Database className="w-3.5 h-3.5 text-brand-400" />
          <span className="font-medium">DES • CACP • Agmarknet • ICAR-IIOR • IMD</span>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-white">{user.name}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                {isAdmin ? (
                  <span className="text-brand-300 flex items-center gap-0.5 font-medium">
                    <ShieldCheck className="w-3 h-3 text-brand-400" /> Admin
                  </span>
                ) : (
                  <span className="text-teal-300 font-medium">Analyst</span>
                )}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center text-navy-950 font-extrabold text-xs shadow-md shadow-brand-500/20">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/30"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-brand-400 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-400 to-teal-500 text-navy-950 font-semibold shadow-md shadow-brand-500/20 hover:from-brand-300 hover:to-teal-400 transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
