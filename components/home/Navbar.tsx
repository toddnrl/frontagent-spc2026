import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseReady, supabase } from "@/lib/supabase";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isSupabaseReady) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = () => {
    if (!isSupabaseReady) return;
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = () => {
    if (!isSupabaseReady) return;
    supabase.auth.signOut();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? "bg-white/90 backdrop-blur-md shadow-[0_2px_20px_rgb(0,0,0,0.04)]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">
          <div className="flex items-center">
            <span className="font-bold text-[22px] tracking-tight text-gray-900">Front Agent</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-9">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium text-[15px] transition-colors">기능 소개</a>
            <a href="#reservation" className="text-gray-600 hover:text-gray-900 font-medium text-[15px] transition-colors">동기화</a>
            <a href="#rag" className="text-gray-600 hover:text-gray-900 font-medium text-[15px] transition-colors">데이터 연동</a>
            <a href="#api" className="text-gray-600 hover:text-gray-900 font-medium text-[15px] transition-colors">개발자 API</a>
            <a href="/status" className="text-gray-600 hover:text-gray-900 font-medium text-[15px] transition-colors">상태</a>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-gray-700 font-medium text-[15px] px-2">
                  {user.user_metadata?.name ?? user.email}
                </span>
                <a
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 font-medium text-[15px] px-4 py-2 transition-colors"
                >
                  대시보드
                </a>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 font-medium text-[15px] px-4 py-2 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="text-gray-600 hover:text-gray-900 font-medium text-[15px] px-4 py-2 transition-colors"
              >
                로그인
              </button>
            )}
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-[12px] font-semibold text-[15px] transition-colors">
              무료로 시작하기
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"} bg-white shadow-xl absolute w-full rounded-b-2xl`}>
        <div className="px-5 pt-2 pb-6 space-y-1">
          <a href="#features" className="block px-3 py-3 rounded-xl text-[16px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50">기능 소개</a>
          <a href="#reservation" className="block px-3 py-3 rounded-xl text-[16px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50">동기화</a>
          <a href="#rag" className="block px-3 py-3 rounded-xl text-[16px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50">데이터 연동</a>
          <a href="#api" className="block px-3 py-3 rounded-xl text-[16px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50">개발자 API</a>
          <a href="/status" className="block px-3 py-3 rounded-xl text-[16px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50">상태</a>
          <div className="pt-4 flex flex-col gap-2 mt-2">
            {user ? (
              <>
                <a
                  href="/admin"
                  className="w-full text-center text-gray-700 bg-gray-50 hover:bg-gray-100 font-semibold px-4 py-4 rounded-xl transition-colors"
                >
                  대시보드
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-gray-700 bg-gray-50 hover:bg-gray-100 font-semibold px-4 py-4 rounded-xl transition-colors"
                >
                  로그아웃 ({user.user_metadata?.name ?? user.email})
                </button>
              </>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="w-full text-center text-gray-700 bg-gray-50 hover:bg-gray-100 font-semibold px-4 py-4 rounded-xl transition-colors"
              >
                Google로 로그인
              </button>
            )}
            <button className="w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-4 rounded-xl transition-colors">
              무료 시작
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
