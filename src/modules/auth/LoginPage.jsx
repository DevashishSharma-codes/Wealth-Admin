import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/UI/Toast";
import { Lock, User, Eye, EyeOff, ShieldCheck, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { USERS } from "../../services/authService";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Developer credentials assistant state
  const [showAssistant, setShowAssistant] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showToast("Please enter both username and password.", "error");
      return;
    }

    setLoading(true);

    // Simulate network delay for realistic look
    setTimeout(() => {
      const result = login(username, password, rememberMe);
      setLoading(false);
      
      if (result.success) {
        showToast(`Welcome back, ${result.user.role}!`, "success");
      } else {
        showToast(result.error, "error");
      }
    }, 800);
  };

  const handleFillCredentials = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    showToast(`Filled credentials for ${user.role}`, "info");
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden p-4">
      {/* Decorative blurred gradients for depth and premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#2B7FFF]/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35vw] h-[35vw] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 flex flex-col gap-5">
        {/* Main Glassmorphic Login Card */}
        <div className="bg-white/95 border border-zinc-200/80 shadow-2xl rounded-3xl p-8 backdrop-blur-md transition-all duration-300">
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3 bg-zinc-50 border border-zinc-200/50 px-3.5 py-1.5 rounded-full">
              <img src="/logo.png" alt="Wealth Wisdom" className="h-7 w-auto object-contain shrink-0" />
              <div className="border-l border-zinc-200 pl-2 text-left">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                  Enterprise
                </span>
                <span className="text-[8px] text-[#2B7FFF] font-extrabold uppercase tracking-wider block -mt-0.5">
                  Admin
                </span>
              </div>
            </div>
            <h1 className="text-xl font-extrabold text-zinc-800 tracking-tight">Admin Gate Access</h1>
            <p className="text-[11px] text-zinc-400 font-semibold mt-1.5 leading-relaxed">
              Authorized personnel only. Please sign in to access the Wealth Admin Panel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                Username
              </label>
              <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 focus-within:border-[#2B7FFF] focus-within:bg-white rounded-xl px-3.5 py-3 transition-all">
                <User className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-transparent border-none text-xs text-zinc-700 outline-none w-full placeholder-zinc-400 font-semibold"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                Password
              </label>
              <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 focus-within:border-[#2B7FFF] focus-within:bg-white rounded-xl px-3.5 py-3 transition-all relative">
                <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none text-xs text-zinc-700 outline-none w-full placeholder-zinc-400 font-semibold pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-[#2B7FFF] focus:ring-[#2B7FFF] cursor-pointer"
                />
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 disabled:bg-blue-500/50 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md hover:shadow-lg hover:shadow-blue-500/10 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Sign In to Panel
                </>
              )}
            </button>
          </form>
        </div>

        {/* Developer sandbox helper tool */}
        <div className="bg-white/80 border border-zinc-200/50 rounded-2xl shadow-md overflow-hidden transition-all duration-200">
          <button
            onClick={() => setShowAssistant(!showAssistant)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50/50 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Dev Mode: Click-to-Fill Credentials
            </span>
            {showAssistant ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAssistant && (
            <div className="px-4 pb-4 pt-2 border-t border-zinc-100 bg-zinc-50/50 space-y-2.5 animate-fade-in">
              <p className="text-[10px] text-zinc-400 font-semibold">
                Click any profile button below to auto-populate credentials for validation testing:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {USERS.map((user, idx) => (
                  <div
                    key={user.username}
                    onClick={() => handleFillCredentials(user)}
                    className="p-2 border border-zinc-200/60 rounded-xl bg-white hover:border-[#2B7FFF]/50 hover:shadow-sm cursor-pointer transition-all duration-250 flex flex-col text-left group"
                  >
                    <span className="text-[10px] font-extrabold text-zinc-700 group-hover:text-[#2B7FFF]">
                      {user.role}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-semibold mt-0.5 font-mono">
                      u: {user.username}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-semibold font-mono">
                      p: {user.password}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
