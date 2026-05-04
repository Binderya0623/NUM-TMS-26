import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import imgLogo from '@/assets/logo.png';
import imgStudent from '@/assets/student.png';
import svgPaths from '@/assets/svg-xfjsm8tdsh';

function PhoneIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path
        d="M17.45 22.5C8.67 22.5 1.5 15.33 1.5 6.55A4.54 4.54 0 016.04 2h.5a1 1 0 01.92.62l2 4.8a1 1 0 01-.22 1.1L7.3 10.47a12.08 12.08 0 005.23 5.23l2-1.95a1 1 0 011.1-.22l4.8 2a1 1 0 01.62.92v.5A4.54 4.54 0 0117.45 22.5z"
        stroke="#666465" strokeMiterlimit="10" strokeWidth="1.5"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M12.5 14.5a5 5 0 100-10 5 5 0 000 10z" stroke="#666465" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M6.89 17.49L9.19 19.79" stroke="#666465" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M9 12l-6.5 6.5" stroke="#666465" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#666465" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#666465" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 33 33">
      <path
        d="M16.5 2.75L20.64 6.07L26 6.07L26 11.43L29.32 15.57L26 19.71L26 25.07L20.64 25.07L16.5 28.39L12.36 25.07L7 25.07L7 19.71L3.68 15.57L7 11.43L7 6.07L12.36 6.07L16.5 2.75Z"
        fill="#36BA2D"
      />
      <path d="M11.5 15.5L14.5 18.5L21.5 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!username.trim() || !password || !confirmPassword) {
      setError('Бүх талбарыг бөглөнө үү');
      return;
    }

    if (username.trim().length < 3) {
      setError('Нэвтрэх нэр хамгийн багадаа 3 тэмдэгт байх ёстой');
      return;
    }

    if (password.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой');
      return;
    }

    if (password !== confirmPassword) {
      setError('Нууц үг таарахгүй байна');
      return;
    }

    setLoading(true);
    // Шинэ бүртгэл анхны үед 'student' дүртэй болно
    const result = await register(username, password, 'student');
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login.xhtml';
      }, 2000);
    } else {
      setError(result.error || 'Энэ нэвтрэх нэр аль хэдийн бүртгэлтэй байна');
    }
  };

  const features = [
    'Сургуулийн цахим шуудангаар нэвтрэх',
    'Дипломын ажлаа цахимаар удирдах',
    'Хоорондын харилцааг хялбарчлах',
    'Цаг хугацаа хэмнэх боломж',
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Left Panel — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <h1
            className="font-bold text-black text-3xl mb-3"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Бүртгүүлэх
          </h1>
          <p
            className="text-[#666465] text-base mb-8"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Та Монгол Улсын Их Сургуулийн{' '}
            <span className="font-bold">Дипломын ажлыг удирдах системд</span>{' '}
            тавтай морилно уу.
          </p>

          {/* SSO Register */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#c4c4c4] rounded-lg h-14 hover:bg-gray-50 transition-colors mb-6"
          >
            <SiSiLogo />
            <span
              className="font-bold text-black text-base"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              СиСи эрхээр бүртгүүлэх
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#c4c4c4]" />
            <span
              className="font-bold text-[#666465] text-sm"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              ЭСВЭЛ
            </span>
            <div className="flex-1 h-px bg-[#c4c4c4]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                className="block font-bold text-black text-base mb-2"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Нэвтрэх нэр
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <PhoneIcon />
                </div>
                <input
                  type="text"
                  id="reg-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Нэвтрэх нэр"
                  className="w-full bg-white border border-[#c4c4c4] rounded-lg h-[50px] pl-10 pr-4 text-[#666465] text-base outline-none focus:border-[#1455bd] transition-colors"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block font-bold text-black text-base mb-2"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Нууц үг
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <KeyIcon />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Нууц үг (хамгийн багадаа 6 тэмдэгт)"
                  className="w-full bg-white border border-[#c4c4c4] rounded-lg h-[50px] pl-10 pr-10 text-[#666465] text-base outline-none focus:border-[#1455bd] transition-colors"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666465] hover:text-black"
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="block font-bold text-black text-base mb-2"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Нууц үг давтах
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <KeyIcon />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="reg-confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Нууц үг давтах"
                  className="w-full bg-white border border-[#c4c4c4] rounded-lg h-[50px] pl-10 pr-10 text-[#666465] text-base outline-none focus:border-[#1455bd] transition-colors"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666465] hover:text-black"
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded-sm border border-[#666465] flex items-center justify-center bg-white flex-shrink-0"
              >
                {rememberMe && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 5L4 8L9 2" stroke="#1455bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span
                className="text-[#666465] text-base cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Намайг сана
              </span>
            </div>

            {/* Error / Success */}
            {error && (
              <p className="text-red-500 text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-600 text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                Амжилттай бүртгэгдлээ! Нэвтрэх хуудас руу шилжиж байна...
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="auth-register-btn"
              disabled={loading || success}
              className="w-full bg-[#1455bd] hover:bg-[#0f4399] disabled:opacity-70 text-white rounded-lg h-14 font-bold text-base transition-colors"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="font-bold text-[#1455bd] text-base hover:underline"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              Нэвтрэх хуудас руу буцах
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-white flex-col items-center justify-between py-12 px-8 relative overflow-hidden">
        <div className="flex flex-col items-center w-full">
          <img src={imgLogo} alt="МУИС лого" className="w-40 h-auto object-contain mb-4" />
          <p
            className="font-bold text-[#1b4588] text-2xl text-center tracking-wide mb-8"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            МОНГОЛ УЛСЫН ИХ СУРГУУЛЬ
          </p>

          <p
            className="text-black text-center text-lg mb-8 px-8"
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
                  className="text-black text-lg"
                  style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 300 }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p
              className="text-[#666465] text-base"
              style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 300 }}
            >
              Холбогдох утас: 7575-4400
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-[240px]">
          <img src={imgStudent} alt="" className="w-full h-auto object-contain scale-x-[-1]" />
        </div>

        <p
          className="text-[#666465] text-sm text-center mt-4 relative z-10"
          style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 300 }}
        >
          2026 © Бүх эрх хуулиар хамгаалагдсан.
        </p>
      </div>
    </div>
  );
}
