import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import imgLogo from '@/assets/logo.png';
import loginCampusBg from '@/assets/login-campus-bg.png';
import loginCampusBgDark from '@/assets/login-campus-bg-dark.png';
import svgPaths from '@/assets/svg-xfjsm8tdsh';

function UserIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--auth-muted)" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0116 0" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--auth-muted)" strokeWidth="1.6">
      <rect x="4" y="11" width="16" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--auth-muted)" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--auth-muted)" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1 5L4 8L9 2" stroke="var(--auth-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 33 33">
      <path
        className="auth-login-checkmark-badge"
        d="M16.5 2.75L20.64 6.07L26 6.07L26 11.43L29.32 15.57L26 19.71L26 25.07L20.64 25.07L16.5 28.39L12.36 25.07L7 25.07L7 19.71L3.68 15.57L7 11.43L7 6.07L12.36 6.07L16.5 2.75Z"
        fill="var(--auth-primary)"
      />
      <path className="auth-login-checkmark-tick" d="M11.5 15.5L14.5 18.5L21.5 12.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SiSiLogo() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 32 32">
      <path d={svgPaths.p2a7b0700} fill="#7097E5" />
      <path d={svgPaths.p1ab30980} fill="#4C7DDF" />
      <path d={svgPaths.p12057f00} fill="#1052D4" />
      <path d={svgPaths.p33a27b80} fill="#396FDB" />
    </svg>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Нэвтрэх нэр болон нууц үгээ оруулна уу');
      return;
    }

    setLoading(true);
    const result = await login(username, password, rememberMe);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Нэвтрэх нэр эсвэл нууц үг буруу байна');
    }
  };

  const features = [
    'Дипломын ажлаа цахимаар удирдах',
    'Багш болон оюутан хоорондын харилцаа',
    'Цаг хугацаа хэмнэх боломж',
    'Тайлан мэдээг хялбар авах',
  ];

  return (
    <div className="min-h-screen bg-[var(--auth-bg)] flex transition-colors duration-200">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center py-12 px-8 relative overflow-hidden border-r border-[var(--auth-border-soft)] transition-colors duration-200">
        <img
          src={loginCampusBg}
          alt=""
          className="auth-login-campus-light pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
        <img
          src={loginCampusBgDark}
          alt=""
          className="auth-login-campus-dark pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(249,247,241,0.10)_0%,rgba(249,247,241,0.04)_38%,rgba(244,239,230,0.16)_100%)] dark:bg-[linear-gradient(180deg,rgba(11,23,36,0.08)_0%,rgba(11,23,36,0.12)_40%,rgba(11,23,36,0.18)_100%)]" />
        <div className="relative z-10 flex flex-col items-center w-full px-8 py-10">
          <img src={imgLogo} alt="МУИС лого" className="auth-login-left-logo w-40 h-auto object-contain mb-4" />
          <p
            className="auth-login-left-title font-bold text-[var(--auth-primary)] text-2xl text-center tracking-wide mb-8"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            МОНГОЛ УЛСЫН ИХ СУРГУУЛЬ
          </p>

          <p
            className="text-[var(--auth-text)] text-center text-lg mb-8 px-8"
            style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 500 }}
          >
            Та Монгол Улсын Их Сургуулийн{' '}
            <span className="font-bold">Дипломын ажлыг удирдах системийг</span>{' '}
            ашигласанаар дараах давуу талуудыг эдлэнэ
          </p>

          <div className="space-y-5 w-full max-w-md px-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <VerifiedIcon />
                <span
                  className="text-[var(--auth-text)] text-lg"
                  style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 300 }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <h1
            className="font-bold text-[var(--auth-text)] text-3xl mb-3"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Нэвтрэх
          </h1>
          <p
            className="text-[var(--auth-muted)] text-base mb-8"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Та Монгол Улсын Их Сургуулийн{' '}
            <span className="font-bold">Дипломын ажлыг удирдах системд</span>{' '}
            тавтай морилно уу.
          </p>

          {/* SSO Login */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-linear-to-b from-[var(--auth-surface)] to-[var(--auth-surface-muted)] border border-[var(--auth-border)] rounded-lg h-14 hover:border-[var(--auth-primary)] transition-all duration-200 mb-6 shadow-[0_1px_2px_rgba(16,32,51,0.06)] hover:shadow-[0_2px_6px_rgba(16,32,51,0.08)]"
          >
            <SiSiLogo />
            <span
              className="font-bold text-[var(--auth-text)] text-base"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              СиСи эрхээр нэвтрэх
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[var(--auth-border)]" />
            <span
              className="font-bold text-[var(--auth-muted)] text-sm"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              ЭСВЭЛ
            </span>
            <div className="flex-1 h-px bg-[var(--auth-border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                className="block font-bold text-[var(--auth-text)] text-base mb-2"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Нэвтрэх нэр
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  id="auth-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Нэвтрэх нэр"
                  className="w-full bg-[var(--auth-surface)] border border-[var(--auth-border)] rounded-lg h-[50px] pl-10 pr-4 text-[var(--auth-text)] placeholder-[var(--auth-muted)] text-base outline-none focus:border-[var(--auth-primary)] focus:ring-2 focus:ring-[var(--auth-primary)]/15 transition-all duration-200 shadow-[0_1px_2px_rgba(16,32,51,0.04)]"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block font-bold text-[var(--auth-text)] text-base"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  Нууц үг
                </label>
                <button
                  type="button"
                  className="font-bold text-[var(--auth-primary)] text-base hover:underline"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  Нууц үг мартсан?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Нууц үг"
                  className="w-full bg-[var(--auth-surface)] border border-[var(--auth-border)] rounded-lg h-[50px] pl-10 pr-10 text-[var(--auth-text)] placeholder-[var(--auth-muted)] text-base outline-none focus:border-[var(--auth-primary)] focus:ring-2 focus:ring-[var(--auth-primary)]/15 transition-all duration-200 shadow-[0_1px_2px_rgba(16,32,51,0.04)]"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--auth-muted)] hover:text-[var(--auth-text)]"
                  aria-label={showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded-sm border border-[var(--auth-border)] flex items-center justify-center bg-[var(--auth-surface)] flex-shrink-0"
              >
                {rememberMe && <CheckIcon />}
              </button>
              <span
                className="text-[var(--auth-muted)] text-base cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Намайг сана
              </span>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                role="alert"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="auth-login-btn"
              disabled={loading}
              className="w-full bg-linear-to-b from-[#2a5f95] to-[var(--auth-primary)] hover:from-[#326ba4] hover:to-[var(--auth-primary-dark)] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg h-14 font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(16,32,51,0.12)] hover:shadow-[0_3px_8px_rgba(16,32,51,0.14)]"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
