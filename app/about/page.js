'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import '@/app/i18n/config'
import LeaflineLogo from '@/app/components/LeaflineLogo'
import ThemeToggle from '@/app/components/ThemeToggle'
import Footer from '@/app/components/Footer'
import { TEAM } from '@/app/data/team'
import { SOCIAL_ICONS } from '@/app/components/SocialIcons'

function LanguageToggle() {
  const { t, i18n } = useTranslation('common')
  const isEn = i18n.language === 'en' || i18n.language?.startsWith('en-')
  return (
    <button
      onClick={() => i18n.changeLanguage(isEn ? 'bn' : 'en')}
      className="text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
      style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}
    >
      {t('switchLang')}
    </button>
  )
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="text-center mb-10">
      <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--brand)' }}>{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
    </div>
  )
}

function TeamCard({ member }) {
  const socialEntries = Object.entries(member.socials).filter(([, url]) => url)
  return (
    <div
      className="flex flex-col items-center text-center gap-3 rounded-2xl p-6"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      {member.avatar ? (
        <Image src={member.avatar} alt={member.name} width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold"
          style={{ background: member.color + '26', color: member.color, border: `2px solid ${member.color}55` }}
        >
          {member.initials}
        </div>
      )}
      <div>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{member.affiliation}</p>
      </div>
      {socialEntries.length > 0 && (
        <div className="flex items-center gap-2 mt-1">
          {socialEntries.map(([platform, url]) => {
            const Icon = SOCIAL_ICONS[platform]
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on ${platform}`}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand-ring)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {Icon && <Icon size={14} />}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AboutPage() {
  const { t } = useTranslation(['about', 'common'])
  const role = t('about:team.role')
  const teamWithRole = TEAM.map(m => ({ ...m, affiliation: role }))

  const steps = t('about:howToUse.steps', { returnObjects: true }) || []
  const points = t('about:why.points', { returnObjects: true }) || []

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="flex items-center flex-1">
          <LeaflineLogo size={28} />
        </Link>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <main className="flex-1">
        {/* ── Team ── */}
        <section id="team" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-16">
          <SectionHeader eyebrow={t('about:team.eyebrow')} title={t('about:team.title')} />
          <p className="text-center text-sm max-w-lg mx-auto -mt-6 mb-10" style={{ color: 'var(--text-secondary)' }}>
            {t('about:team.desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {teamWithRole.map(member => <TeamCard key={member.id} member={member} />)}
          </div>
        </section>

        {/* ── How to Use ── */}
        <section id="how-to-use" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-16">
          <SectionHeader eyebrow={t('about:howToUse.eyebrow')} title={t('about:howToUse.title')} />
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-2xl p-5"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{step.title}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Why Leafline ── */}
        <section id="why-leafline" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-16">
          <SectionHeader eyebrow={t('about:why.eyebrow')} title={t('about:why.title')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {points.map((point, i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              >
                <p className="font-semibold" style={{ color: 'var(--brand)' }}>{point.title}</p>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{point.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
