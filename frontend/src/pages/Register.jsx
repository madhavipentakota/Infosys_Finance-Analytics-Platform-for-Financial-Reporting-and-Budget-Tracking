import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Mail, User, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('analyst');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.detail || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4 relative selection:bg-brand-500 selection:text-navy-950">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-navy-950/90 backdrop-blur-xl rounded-2xl p-7 sm:p-9 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Bright cyan top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-brand-400 to-teal-500 rounded-t-2xl" />

        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-teal-500 shadow-xl shadow-brand-500/25 mb-4">
            <Sprout className="w-7 h-7 text-navy-950 font-bold stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Your Account</h1>
          <p className="text-xs text-slate-300 mt-1">Join OilCrop Intelligence analytics workspace</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. R. Sharma"
                className="w-full bg-navy-900 border border-slate-700 text-white placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-400 font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sharma@icar.gov.in"
                className="w-full bg-navy-900 border border-slate-700 text-white placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-400 font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-navy-900 border border-slate-700 text-white placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-400 font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('analyst')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  role === 'analyst'
                    ? 'bg-gradient-to-r from-brand-500/20 to-teal-500/20 border-brand-400 text-white shadow-md shadow-brand-500/10'
                    : 'bg-navy-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sprout className="w-4 h-4 text-brand-400" />
                <span>Analyst</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-brand-500/20 to-teal-500/20 border-brand-400 text-white shadow-md shadow-brand-500/10'
                    : 'bg-navy-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-400 to-teal-500 text-navy-950 font-bold text-sm shadow-xl shadow-brand-500/20 hover:from-brand-300 hover:to-teal-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-brand-300 hover:text-white font-semibold underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
