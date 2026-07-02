'use client'

import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import '@/app/i18n/config'
import LeaflineLogo from '@/app/components/LeaflineLogo'
import { TEAM } from '@/app/data/team'

export default function Footer() {
  const { t } = useTranslation(['about', 'common'])

  const usefulLinks = [
    { label: t('about:usefulLinks.moa'), href: 'https://moa.gov.bd/', external: true },
    { label: t('about:usefulLinks.dam'), href: 'https://dam.gov.bd/', external: true },
    { label: t('about:usefulLinks.dae'), href: 'https://dae.gov.bd/', external: true },
    { label: t('about:usefulLinks.about'), href: '/about#team', external: false },
    { label: t('about:usefulLinks.howToUse'), href: '/about#how-to-use', external: false },
    { label: t('about:usefulLinks.why'), href: '/about#why-leafline', external: false },
  ]

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
      <div className="mx-auto max-w-5xl px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <LeaflineLogo size={26} />
          <p className="mt-3 text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            {t('about:footer.tagline')}
          </p>
        </div>

        {/* Useful Links */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('about:usefulLinks.title')}
          </p>
          <ul className="space-y-2.5">
            {usefulLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Team */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('about:footer.team')}
          </p>
          <a href="/about#team" className="flex items-center gap-2">
            {TEAM.map((member) => (
              member.avatar ? (
                <Image
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  title={member.name}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  style={{ border: `1.5px solid ${member.color}55` }}
                />
              ) : (
                <span
                  key={member.id}
                  title={member.name}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: member.color + '26', color: member.color, border: `1.5px solid ${member.color}55` }}
                >
                  {member.initials}
                </span>
              )
            ))}
          </a>
          <ul className="mt-3 space-y-1">
            {TEAM.map((member) => (
              <li key={member.id} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {member.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-8">
        <div className="h-px mb-5" style={{ background: 'var(--border)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Leafline — {t('about:footer.rights')}
        </p>
      </div>
    </footer>
  )
}
