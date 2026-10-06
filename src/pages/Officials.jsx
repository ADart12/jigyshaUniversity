import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

export const Officials = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your ID and password.');
      return;
    }
    setLoading(true);
    setError('');
    // Mock login — replace with real auth when backend is ready
    setTimeout(() => {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 lg:p-8 pb-24">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-river-tint rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-river" />
          </div>
          <h1 className="font-condensed text-[28px] leading-[34px] font-semibold text-ink">Officials</h1>
          <p className="text-granite font-sans text-sm mt-2">
            Access road monitoring and incident management tools.
          </p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleLogin} className="bg-snow border border-mist p-6 rounded-md shadow-sm space-y-5">
          <div>
            <label className="block font-sans text-sm font-semibold mb-1 text-ink">Official ID / Email</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-granite" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your official ID or email"
                className="w-full pl-10 p-3 bg-white border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm font-semibold mb-1 text-ink">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-granite" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 p-3 bg-white border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-granite hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-river rounded"
            />
            <label htmlFor="remember" className="font-sans text-sm text-ink">Remember me</label>
          </div>

          {error && (
            <div className="p-3 bg-tint-severe border border-risk-severe rounded-md text-risk-severe font-sans text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-12 bg-river text-white rounded-md font-sans font-medium hover:bg-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-granite text-xs font-sans mt-6">
          For authorized personnel only.
        </p>
      </div>
    </div>
  );
};
