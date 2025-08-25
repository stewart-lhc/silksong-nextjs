'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const translations = {
  en: {
    title: 'Hollow Knight: Silksong',
    subtitle: 'September 4',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    released: 'Released!',
    unknown: 'Release Date TBA',
  },
  zh: {
    title: '空洞骑士：丝之歌',
    subtitle: '9月4日',
    days: '天',
    hours: '小时',
    minutes: '分钟',
    seconds: '秒',
    released: '已发售！',
    unknown: '发售日期待定',
  },
  es: {
    title: 'Hollow Knight: Silksong',
    subtitle: '4 de Septiembre',
    days: 'Días',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
    released: '¡Lanzado!',
    unknown: 'Fecha de lanzamiento por confirmar',
  },
  fr: {
    title: 'Hollow Knight: Silksong',
    subtitle: '4 Septembre',
    days: 'Jours',
    hours: 'Heures',
    minutes: 'Minutes',
    seconds: 'Secondes',
    released: 'Sorti !',
    unknown: 'Date de sortie à confirmer',
  },
  de: {
    title: 'Hollow Knight: Silksong',
    subtitle: '4. September',
    days: 'Tage',
    hours: 'Stunden',
    minutes: 'Minuten',
    seconds: 'Sekunden',
    released: 'Veröffentlicht!',
    unknown: 'Veröffentlichungsdatum offen',
  },
  ja: {
    title: 'ホロウナイト：シルクソング',
    subtitle: '9月4日',
    days: '日',
    hours: '時間',
    minutes: '分',
    seconds: '秒',
    released: 'リリース済み！',
    unknown: 'リリース日未定',
  },
};

export default function EmbedCountdownPage() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isReleased, setIsReleased] = useState(false);

  const theme = searchParams.get('theme') || 'light';
  const lang = searchParams.get('lang') || 'en';
  const showTitle = searchParams.get('showTitle') !== 'false';
  const layout = searchParams.get('layout') || 'horizontal';
  const showBorder = searchParams.get('border') !== 'false';

  const t = translations[lang as keyof typeof translations] || translations.en;

  // Target release date - using PRD specified date
  const targetDate = new Date('2025-09-04T00:00:00Z').getTime();

  const themeStyles =
    theme === 'dark'
      ? {
          bg: '#18181b',
          text: '#fafafa',
          accent: '#c43444',
          muted: '#a1a1aa',
          border: '#3f3f46',
        }
      : {
          bg: '#ffffff',
          text: '#18181b',
          accent: '#c43444',
          muted: '#71717a',
          border: '#e4e4e7',
        };

  const containerStyles = {
    backgroundColor: themeStyles.bg,
    color: themeStyles.text,
    border: showBorder ? `1px solid ${themeStyles.border}` : 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    maxWidth: layout === 'vertical' ? '180px' : '380px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: layout === 'vertical' ? 'center' : 'space-between',
    gap: '12px',
    minHeight: '60px',
  } as const;

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setIsReleased(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    // Initial update
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div
      style={{
        margin: '0',
        padding: '2px',
        backgroundColor: themeStyles.bg,
        minHeight: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div style={containerStyles}>
        {showTitle && (
          <div
            style={{
              textAlign: layout === 'vertical' ? 'center' : 'left',
              minWidth: '140px',
            }}
          >
            <h3
              style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: themeStyles.accent,
              }}
            >
              {t.title}
            </h3>
            <p
              style={{
                margin: '0',
                fontSize: '12px',
                color: themeStyles.muted,
              }}
            >
              {t.subtitle}
            </p>
          </div>
        )}

        {isReleased ? (
          <div
            style={{
              textAlign: 'center',
              fontWeight: '600',
              color: themeStyles.accent,
              fontSize: '16px',
            }}
          >
            {t.released}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: layout === 'vertical' ? '8px' : '12px',
              flexDirection: layout === 'vertical' ? 'column' : 'row',
              alignItems: 'center',
            }}
          >
            <CountdownUnit
              value={countdown.days}
              label={t.days}
              themeStyles={themeStyles}
            />
            <CountdownUnit
              value={countdown.hours}
              label={t.hours}
              themeStyles={themeStyles}
            />
            <CountdownUnit
              value={countdown.minutes}
              label={t.minutes}
              themeStyles={themeStyles}
            />
            <CountdownUnit
              value={countdown.seconds}
              label={t.seconds}
              themeStyles={themeStyles}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownUnit({
  value,
  label,
  themeStyles,
}: {
  value: number;
  label: string;
  themeStyles: any;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        fontSize: '12px',
      }}
    >
      <span
        style={{
          fontWeight: '600',
          fontSize: '16px',
          color: themeStyles.accent,
        }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span
        style={{
          color: themeStyles.muted,
          fontSize: '10px',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}
