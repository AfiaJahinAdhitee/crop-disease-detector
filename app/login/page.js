'use client'

import { useState } from 'react'
import { sendOTP, verifyOTP } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  async function handleSendOTP(e) {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setLoading(true)
    try {
      await sendOTP(email.trim())
      setStep('otp')
      startResendCooldown()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function startResendCooldown() {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setError('')
    setLoading(true)
    try {
      await sendOTP(email.trim())
      startResendCooldown()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index, value) {
    // Accept paste of full OTP
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('')
      const newOtp = [...otp]
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d })
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      document.getElementById(`otp-${nextIndex}`)?.focus()
      return
    }
    const digit = value.replace(/\D/g, '')
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 6) { setError('Enter the full 6-digit code.'); return }
    setError('')
    setLoading(true)
    try {
      await verifyOTP(email.trim(), token)
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err.message)
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      {/* Background texture */}
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="login-card">
        {/* Logo / brand */}
        <div className="brand">
          <div className="brand-icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 3C16 3 8 9 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 9 16 3 16 3Z" fill="currentColor" opacity="0.9"/>
              <path d="M16 10C16 10 11 14 11 19C11 21.8 13.2 24 16 24" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <span className="brand-label">CROP2</span>
        </div>

        {step === 'email' ? (
          <>
            <div className="card-header">
              <h1 className="card-title">Welcome back</h1>
              <p className="card-sub">Enter your email to receive a one-time sign-in code. New users are registered automatically.</p>
            </div>

            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="field-wrap">
                <label className="field-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {error && <p className="error-msg">{error}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="btn-loader">
                    <span className="spinner" /> Sending code…
                  </span>
                ) : 'Send code →'}
              </button>
            </form>

            <p className="footer-note">
              A 6-digit code will be sent to your inbox. No password needed.
            </p>
          </>
        ) : (
          <>
            <div className="card-header">
              <h1 className="card-title">Check your email</h1>
              <p className="card-sub">
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below to sign in.
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="auth-form">
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
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {error && <p className="error-msg">{error}</p>}

              <button type="submit" className="btn-primary" disabled={loading || otp.join('').length !== 6}>
                {loading ? (
                  <span className="btn-loader"><span className="spinner" /> Verifying…</span>
                ) : 'Verify & Sign in →'}
              </button>
            </form>

            <div className="otp-actions">
              <button
                onClick={() => { setStep('email'); setOtp(['','','','','','']); setError('') }}
                className="link-btn"
              >
                ← Change email
              </button>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="link-btn"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #030a06;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          font-family: 'Geist', system-ui, sans-serif;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(74, 222, 128, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74, 222, 128, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(10, 20, 13, 0.95);
          border: 1px solid rgba(74, 222, 128, 0.15);
          border-radius: 24px;
          padding: 2.5rem;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.5),
            0 24px 60px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(74, 222, 128, 0.08);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 2rem;
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          color: #4ade80;
        }

        .brand-label {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #4ade80;
          text-transform: uppercase;
        }

        .card-header {
          margin-bottom: 2rem;
        }

        .card-title {
          font-size: 1.6rem;
          font-weight: 600;
          color: #f0fdf4;
          letter-spacing: -0.02em;
          margin: 0 0 0.5rem;
        }

        .card-sub {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        .card-sub strong {
          color: #9ca3af;
          font-weight: 500;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .field-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .field-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          color: #f0fdf4;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
          box-sizing: border-box;
        }

        .field-input::placeholder { color: #374151; }

        .field-input:focus {
          border-color: rgba(74, 222, 128, 0.5);
          box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.08);
        }

        .otp-wrap {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .otp-box {
          width: 48px;
          height: 56px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          font-size: 1.4rem;
          font-weight: 600;
          color: #f0fdf4;
          text-align: center;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          caret-color: #4ade80;
        }

        .otp-box:focus {
          border-color: rgba(74, 222, 128, 0.6);
          box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
          background: rgba(74, 222, 128, 0.05);
        }

        .otp-filled {
          border-color: rgba(74, 222, 128, 0.4);
          background: rgba(74, 222, 128, 0.06);
        }

        .error-msg {
          font-size: 0.82rem;
          color: #f87171;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 0.6rem 0.875rem;
          margin: 0;
        }

        .btn-primary {
          background: #16a34a;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.8rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, opacity 0.2s;
          letter-spacing: 0.01em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .btn-primary:hover:not(:disabled) {
          background: #15803d;
        }

        .btn-primary:active:not(:disabled) {
          transform: scale(0.99);
        }

        .btn-primary:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .btn-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .otp-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
        }

        .link-btn {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.82rem;
          cursor: pointer;
          padding: 0.25rem 0;
          transition: color 0.15s;
        }

        .link-btn:hover:not(:disabled) { color: #9ca3af; }
        .link-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .footer-note {
          margin: 1.5rem 0 0;
          font-size: 0.78rem;
          color: #374151;
          text-align: center;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}