'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { supabase, isSupabaseReady } from '@/lib/supabase'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.55-1.84.86-3.06.86-2.36 0-4.36-1.6-5.08-3.74H.9v2.33A9 9 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.92 10.68A5.4 5.4 0 0 1 3.64 9c0-.58.1-1.15.28-1.68V4.99H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.01l3.02-2.33z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.46 3.44 1.34l2.58-2.58A8.6 8.6 0 0 0 9 0 9 9 0 0 0 .9 4.99l3.02 2.33C4.64 5.18 6.64 3.58 9 3.58z"
    />
  </svg>
)

export function LoginDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    if (!isSupabaseReady) return
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <h2 className="m-0 text-[26px] font-extrabold text-[#16191f]">
          Call bee 시작하기
        </h2>
        <p className="mt-2 mb-7 text-[14px] leading-[1.6] text-[#7a8190]">
          구글 계정으로 로그인하면 가입까지 한 번에 끝나요.
        </p>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          disabled={loading || !isSupabaseReady}
          onClick={handleGoogleLogin}
        >
          <GoogleIcon />
          {loading ? '이동 중...' : 'Google로 계속하기'}
        </Button>

        {!isSupabaseReady && (
          <p className="mt-4 text-[12px] text-[#b5471f]">
            로그인 설정이 아직 준비되지 않았습니다.
          </p>
        )}

        <p className="mt-6 text-[12px] leading-[1.6] text-[#9aa1ad]">
          계속 진행하면 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </Dialog>
  )
}
