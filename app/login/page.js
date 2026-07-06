'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LeaflineLogo from '@/app/components/LeaflineLogo'

function OtpInput({ otp, onChange, onKeyDown }) {
  return (
    <div className="otp-wrap">
      {otp.map((digit, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={6}
          className={`otp-box ${digit ? 'otp-filled' : ''}`}
          value={digit}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          autoFocus={i === 0}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}

const REGIONS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা',
  'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ',
]

function Spinner() {
  return <span className="spinner" />
}

function EyeIcon({ show }) {
  return show
    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('choose')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendCooldown, setResendCooldown] = useState(0)

  // sign in
  const [siPhone, setSiPhone] = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siShowPw, setSiShowPw] = useState(false)

  // sign up — added suEmail
  const [suName, setSuName] = useState('')
  const [suPhone, setSuPhone] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suRegion, setSuRegion] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suShowPw, setSuShowPw] = useState(false)

  // forgot password
  const [fpPhone, setFpPhone] = useState('')
  const [fpEmail, setFpEmail] = useState('')
  const [fpNewPw, setFpNewPw] = useState('')
  const [fpConfirmPw, setFpConfirmPw] = useState('')
  const [fpShowPw, setFpShowPw] = useState(false)

  function resetOtp() { setOtp(['', '', '', '', '', '']) }
  function clearError() { setError('') }

  function startResendCooldown() {
    setResendCooldown(60)
    const iv = setInterval(() => {
      setResendCooldown(p => { if (p <= 1) { clearInterval(iv); return 0 } return p - 1 })
    }, 1000)
  }

  function handleOtpChange(index, value) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('')
      const n = [...otp]
      digits.forEach((d, i) => { if (index + i < 6) n[index + i] = d })
      setOtp(n)
      document.getElementById(`otp-${Math.min(index + digits.length, 5)}`)?.focus()
      return
    }
    const digit = value.replace(/\D/g, '')
    const n = [...otp]; n[index] = digit; setOtp(n)
    if (digit && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus()
  }

  // ── Sign In ──────────────────────────────────────────────────────────────────
  async function handleSignIn(e) {
    e.preventDefault(); clearError(); setLoading(true)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: siPhone.trim(), password: siPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sign in failed.')
      const { createClient } = await import('@/lib/supabase')
      await createClient().auth.setSession(data.session)
      router.push('/'); router.refresh()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── Sign Up: step 1 — send OTP to user's email ───────────────────────────────
  async function handleSignUpSendOtp(e) {
    e.preventDefault(); clearError(); setLoading(true)
    try {
      const res = await fetch('/api/auth/signup-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: suPhone.trim(), email: suEmail.trim(), name: suName.trim(), region: suRegion, password: suPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.')
      setMode('signup-otp'); resetOtp(); startResendCooldown()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── Sign Up: step 2 — verify OTP ─────────────────────────────────────────────
  async function handleSignUpVerify(e) {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 6) { setError('Enter the full 6-digit code.'); return }
    clearError(); setLoading(true)
    try {
      const res = await fetch('/api/auth/signup-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: suPhone.trim(), email: suEmail.trim(), token, name: suName.trim(), region: suRegion, password: suPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed.')
      const { createClient } = await import('@/lib/supabase')
      await createClient().auth.setSession(data.session)
      router.push('/'); router.refresh()
    } catch (err) { setError(err.message); resetOtp(); document.getElementById('otp-0')?.focus() }
    finally { setLoading(false) }
  }

  // ── Forgot Password: step 1 — send OTP ──────────────────────────────────────
  async function handleForgotSendOtp(e) {
    e.preventDefault(); clearError(); setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fpPhone.trim(), email: fpEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.')
      setMode('forgot-otp'); resetOtp(); startResendCooldown()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── Forgot Password: step 2 — verify OTP ─────────────────────────────────────
  async function handleForgotVerify(e) {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 6) { setError('Enter the full 6-digit code.'); return }
    clearError(); setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fpPhone.trim(), email: fpEmail.trim(), token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid code.')
      setMode('forgot-reset')
    } catch (err) { setError(err.message); resetOtp(); document.getElementById('otp-0')?.focus() }
    finally { setLoading(false) }
  }

  // ── Forgot Password: step 3 — reset ─────────────────────────────────────────
  async function handleForgotReset(e) {
    e.preventDefault()
    if (fpNewPw !== fpConfirmPw) { setError('Passwords do not match.'); return }
    if (fpNewPw.length < 8) { setError('Password must be at least 8 characters.'); return }
    clearError(); setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fpPhone.trim(), email: fpEmail.trim(), newPassword: fpNewPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reset failed.')
      const { createClient } = await import('@/lib/supabase')
      await createClient().auth.setSession(data.session)
      router.push('/'); router.refresh()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── Resend helpers ────────────────────────────────────────────────────────────
  async function resendSignupOtp() {
    if (resendCooldown > 0) return
    clearError(); setLoading(true)
    try {
      await fetch('/api/auth/signup-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: suPhone.trim(), email: suEmail.trim(), name: suName.trim(), region: suRegion, password: suPassword }),
      })
      startResendCooldown()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function resendForgotOtp() {
    if (resendCooldown > 0) return
    clearError(); setLoading(true)
    try {
      await fetch('/api/auth/forgot-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fpPhone.trim(), email: fpEmail.trim() }),
      })
      startResendCooldown()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="login-root">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="login-card">
        <div className="brand" style={{ '--text-primary': '#f0fdf4' }}>
          <LeaflineLogo size={28} />
        </div>

        {/* ── CHOOSE ── */}
        {mode === 'choose' && (
          <>
            <div className="card-header">
              <h1 className="card-title">Welcome</h1>
              <p className="card-sub">Sign in to your account or create a new one.</p>
            </div>
            <div className="choose-btns">
              <button className="btn-primary" onClick={() => { clearError(); setMode('signin') }}>Sign in</button>
              <button className="btn-outline" onClick={() => { clearError(); setMode('signup') }}>Create account</button>
            </div>
          </>
        )}

        {/* ── SIGN IN ── */}
        {mode === 'signin' && (
          <>
            <div className="card-header">
              <button className="back-btn" onClick={() => { setMode('choose'); clearError() }}>← Back</button>
              <h1 className="card-title">Sign in</h1>
              <p className="card-sub">Enter your phone number and password.</p>
            </div>
            <form onSubmit={handleSignIn} className="auth-form">
              <div className="field-wrap">
                <label className="field-label">Phone number</label>
                <input className="field-input" type="tel" placeholder="01XXXXXXXXX" value={siPhone}
                  onChange={e => setSiPhone(e.target.value)} required autoFocus autoComplete="tel" />
              </div>
              <div className="field-wrap">
                <label className="field-label">Password</label>
                <div className="pw-wrap">
                  <input className="field-input" type={siShowPw ? 'text' : 'password'}
                    placeholder="Your password" value={siPassword}
                    onChange={e => setSiPassword(e.target.value)} required autoComplete="current-password" />
                  <button type="button" className="pw-toggle" onClick={() => setSiShowPw(p => !p)}>
                    <EyeIcon show={siShowPw} />
                  </button>
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="btn-loader"><Spinner /> Signing in…</span> : 'Sign in →'}
              </button>
            </form>
            <button className="link-btn center-link" onClick={() => { setMode('forgot-phone'); clearError() }}>
              Forgot password?
            </button>
          </>
        )}

        {/* ── SIGN UP ── */}
        {mode === 'signup' && (
          <>
            <div className="card-header">
              <button className="back-btn" onClick={() => { setMode('choose'); clearError() }}>← Back</button>
              <h1 className="card-title">Create account</h1>
              <p className="card-sub">We&apos;ll send a verification code to your email.</p>
            </div>
            <form onSubmit={handleSignUpSendOtp} className="auth-form">
              <div className="field-wrap">
                <label className="field-label">Full name</label>
                <input className="field-input" type="text" placeholder="Your name" value={suName}
                  onChange={e => setSuName(e.target.value)} required autoFocus />
              </div>
              <div className="field-wrap">
                <label className="field-label">Phone number</label>
                <input className="field-input" type="tel" placeholder="01XXXXXXXXX" value={suPhone}
                  onChange={e => setSuPhone(e.target.value)} required autoComplete="tel" />
              </div>
              <div className="field-wrap">
                <label className="field-label">Email address</label>
                <input className="field-input" type="email" placeholder="you@example.com" value={suEmail}
                  onChange={e => setSuEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="field-wrap">
                <label className="field-label">Region</label>
                <select className="field-input field-select" value={suRegion}
                  onChange={e => setSuRegion(e.target.value)} required>
                  <option value="">Select your region</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="field-wrap">
                <label className="field-label">Password</label>
                <div className="pw-wrap">
                  <input className="field-input" type={suShowPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters" value={suPassword}
                    onChange={e => setSuPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                  <button type="button" className="pw-toggle" onClick={() => setSuShowPw(p => !p)}>
                    <EyeIcon show={suShowPw} />
                  </button>
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="btn-loader"><Spinner /> Sending code…</span> : 'Send verification code →'}
              </button>
            </form>
          </>
        )}

        {/* ── SIGN UP OTP ── */}
        {mode === 'signup-otp' && (
          <>
            <div className="card-header">
              <button className="back-btn" onClick={() => { setMode('signup'); clearError(); resetOtp() }}>← Back</button>
              <h1 className="card-title">Verify your email</h1>
              <p className="card-sub">A 6-digit code was sent to <strong>{suEmail}</strong>. Enter it to complete registration.</p>
            </div>
            <form onSubmit={handleSignUpVerify} className="auth-form">
              <OtpInput otp={otp} onChange={handleOtpChange} onKeyDown={handleOtpKeyDown} />
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading || otp.join('').length !== 6}>
                {loading ? <span className="btn-loader"><Spinner /> Verifying…</span> : 'Verify & Create account →'}
              </button>
            </form>
            <div className="otp-actions">
              <span />
              <button className="link-btn" onClick={resendSignupOtp} disabled={resendCooldown > 0 || loading}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT: PHONE + EMAIL ── */}
        {mode === 'forgot-phone' && (
          <>
            <div className="card-header">
              <button className="back-btn" onClick={() => { setMode('signin'); clearError() }}>← Back</button>
              <h1 className="card-title">Reset password</h1>
              <p className="card-sub">Enter your registered phone number and email to receive a reset code.</p>
            </div>
            <form onSubmit={handleForgotSendOtp} className="auth-form">
              <div className="field-wrap">
                <label className="field-label">Phone number</label>
                <input className="field-input" type="tel" placeholder="01XXXXXXXXX" value={fpPhone}
                  onChange={e => setFpPhone(e.target.value)} required autoFocus autoComplete="tel" />
              </div>
              <div className="field-wrap">
                <label className="field-label">Email address</label>
                <input className="field-input" type="email" placeholder="you@example.com" value={fpEmail}
                  onChange={e => setFpEmail(e.target.value)} required autoComplete="email" />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="btn-loader"><Spinner /> Sending code…</span> : 'Send reset code →'}
              </button>
            </form>
          </>
        )}

        {/* ── FORGOT OTP ── */}
        {mode === 'forgot-otp' && (
          <>
            <div className="card-header">
              <button className="back-btn" onClick={() => { setMode('forgot-phone'); clearError(); resetOtp() }}>← Back</button>
              <h1 className="card-title">Enter reset code</h1>
              <p className="card-sub">A 6-digit code was sent to <strong>{fpEmail}</strong>.</p>
            </div>
            <form onSubmit={handleForgotVerify} className="auth-form">
              <OtpInput otp={otp} onChange={handleOtpChange} onKeyDown={handleOtpKeyDown} />
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading || otp.join('').length !== 6}>
                {loading ? <span className="btn-loader"><Spinner /> Verifying…</span> : 'Verify code →'}
              </button>
            </form>
            <div className="otp-actions">
              <span />
              <button className="link-btn" onClick={resendForgotOtp} disabled={resendCooldown > 0 || loading}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT RESET ── */}
        {mode === 'forgot-reset' && (
          <>
            <div className="card-header">
              <h1 className="card-title">New password</h1>
              <p className="card-sub">Choose a new password for your account.</p>
            </div>
            <form onSubmit={handleForgotReset} className="auth-form">
              <div className="field-wrap">
                <label className="field-label">New password</label>
                <div className="pw-wrap">
                  <input className="field-input" type={fpShowPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters" value={fpNewPw}
                    onChange={e => setFpNewPw(e.target.value)} required minLength={8} autoFocus autoComplete="new-password" />
                  <button type="button" className="pw-toggle" onClick={() => setFpShowPw(p => !p)}>
                    <EyeIcon show={fpShowPw} />
                  </button>
                </div>
              </div>
              <div className="field-wrap">
                <label className="field-label">Confirm password</label>
                <input className="field-input" type={fpShowPw ? 'text' : 'password'}
                  placeholder="Repeat password" value={fpConfirmPw}
                  onChange={e => setFpConfirmPw(e.target.value)} required autoComplete="new-password" />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="btn-loader"><Spinner /> Saving…</span> : 'Save new password →'}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .login-root { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#030a06; padding:1.5rem; position:relative; overflow:hidden; font-family:'Geist',system-ui,sans-serif; }
        .bg-grid { position:absolute; inset:0; background-image: linear-gradient(rgba(74,222,128,0.04) 1px,transparent 1px), linear-gradient(90deg,rgba(74,222,128,0.04) 1px,transparent 1px); background-size:40px 40px; }
        .bg-glow { position:absolute; width:600px; height:600px; top:50%; left:50%; transform:translate(-50%,-50%); background:radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%); pointer-events:none; }
        .login-card { position:relative; width:100%; max-width:420px; background:rgba(10,20,13,0.95); border:1px solid rgba(74,222,128,0.15); border-radius:24px; padding:2.5rem; backdrop-filter:blur(20px); box-shadow:0 0 0 1px rgba(0,0,0,0.5),0 24px 60px rgba(0,0,0,0.6),inset 0 1px 0 rgba(74,222,128,0.08); }
        .brand { display:flex; align-items:center; margin-bottom:2rem; }
        .card-header { margin-bottom:2rem; }
        .back-btn { background:none; border:none; color:#6b7280; font-size:0.82rem; cursor:pointer; padding:0; margin-bottom:1rem; transition:color 0.15s; }
        .back-btn:hover { color:#9ca3af; }
        .card-title { font-size:1.6rem; font-weight:600; color:#f0fdf4; letter-spacing:-0.02em; margin:0 0 0.5rem; }
        .card-sub { font-size:0.875rem; color:#6b7280; line-height:1.6; margin:0; }
        .card-sub strong { color:#9ca3af; font-weight:500; }
        .choose-btns { display:flex; flex-direction:column; gap:0.75rem; }
        .auth-form { display:flex; flex-direction:column; gap:1.25rem; }
        .field-wrap { display:flex; flex-direction:column; gap:0.4rem; }
        .field-label { font-size:0.8rem; font-weight:500; color:#9ca3af; letter-spacing:0.03em; text-transform:uppercase; }
        .field-input { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:0.75rem 1rem; font-size:0.95rem; color:#f0fdf4; outline:none; transition:border-color 0.2s,box-shadow 0.2s; width:100%; box-sizing:border-box; }
        .field-input::placeholder { color:#374151; }
        .field-input:focus { border-color:rgba(74,222,128,0.5); box-shadow:0 0 0 3px rgba(74,222,128,0.08); }
        .field-select { appearance:none; cursor:pointer; }
        .field-select option { background:#0a1a0d; color:#f0fdf4; }
        .pw-wrap { position:relative; }
        .pw-wrap .field-input { padding-right:2.75rem; }
        .pw-toggle { position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#6b7280; cursor:pointer; width:20px; height:20px; padding:0; transition:color 0.15s; }
        .pw-toggle:hover { color:#9ca3af; }
        .pw-toggle svg { width:100%; height:100%; }
        .otp-wrap { display:flex; gap:0.5rem; justify-content:center; }
        .otp-box { width:48px; height:56px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; font-size:1.4rem; font-weight:600; color:#f0fdf4; text-align:center; outline:none; transition:border-color 0.15s,box-shadow 0.15s,background 0.15s; caret-color:#4ade80; }
        .otp-box:focus { border-color:rgba(74,222,128,0.6); box-shadow:0 0 0 3px rgba(74,222,128,0.1); background:rgba(74,222,128,0.05); }
        .otp-filled { border-color:rgba(74,222,128,0.4); background:rgba(74,222,128,0.06); }
        .error-msg { font-size:0.82rem; color:#f87171; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:8px; padding:0.6rem 0.875rem; margin:0; }
        .btn-primary { background:#16a34a; color:#fff; border:none; border-radius:10px; padding:0.8rem 1.25rem; font-size:0.95rem; font-weight:600; cursor:pointer; transition:background 0.2s,transform 0.1s,opacity 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.1); }
        .btn-primary:hover:not(:disabled) { background:#15803d; }
        .btn-primary:active:not(:disabled) { transform:scale(0.99); }
        .btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
        .btn-outline { background:transparent; color:#4ade80; border:1px solid rgba(74,222,128,0.35); border-radius:10px; padding:0.8rem 1.25rem; font-size:0.95rem; font-weight:600; cursor:pointer; transition:background 0.2s,border-color 0.2s; }
        .btn-outline:hover { background:rgba(74,222,128,0.06); border-color:rgba(74,222,128,0.6); }
        .btn-loader { display:flex; align-items:center; justify-content:center; gap:0.5rem; }
        .spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .otp-actions { display:flex; justify-content:space-between; margin-top:0.5rem; }
        .link-btn { background:none; border:none; color:#6b7280; font-size:0.82rem; cursor:pointer; padding:0.25rem 0; transition:color 0.15s; }
        .link-btn:hover:not(:disabled) { color:#9ca3af; }
        .link-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .center-link { display:block; margin:1rem auto 0; }
      `}</style>
    </div>
  )
}