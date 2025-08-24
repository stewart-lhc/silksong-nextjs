import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Silksong Countdown Widget',
  description: 'Embeddable countdown widget for Hollow Knight: Silksong release',
  robots: 'noindex, nofollow',
};

interface CountdownProps {
  searchParams: {
    theme?: 'light' | 'dark';
    lang?: 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja';
    showTitle?: 'true' | 'false';
    layout?: 'horizontal' | 'vertical';
    border?: 'true' | 'false';
  };
}

const translations = {
  en: {
    title: 'Hollow Knight: Silksong',
    subtitle: 'Coming Soon',
    days: 'Days',
    hours: 'Hours', 
    minutes: 'Minutes',
    seconds: 'Seconds',
    released: 'Released!',
    unknown: 'Release Date TBA'
  },
  zh: {
    title: '空洞骑士：丝之歌',
    subtitle: '即将到来',
    days: '天',
    hours: '小时',
    minutes: '分钟', 
    seconds: '秒',
    released: '已发售！',
    unknown: '发售日期待定'
  },
  es: {
    title: 'Hollow Knight: Silksong',
    subtitle: 'Próximamente',
    days: 'Días',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos', 
    released: '¡Lanzado!',
    unknown: 'Fecha de lanzamiento por confirmar'
  },
  fr: {
    title: 'Hollow Knight: Silksong',
    subtitle: 'Bientôt disponible',
    days: 'Jours',
    hours: 'Heures',
    minutes: 'Minutes',
    seconds: 'Secondes',
    released: 'Sorti !',
    unknown: 'Date de sortie à confirmer'
  },
  de: {
    title: 'Hollow Knight: Silksong', 
    subtitle: 'Kommt bald',
    days: 'Tage',
    hours: 'Stunden',
    minutes: 'Minuten',
    seconds: 'Sekunden',
    released: 'Veröffentlicht!',
    unknown: 'Veröffentlichungsdatum offen'
  },
  ja: {
    title: 'ホロウナイト：シルクソング',
    subtitle: '近日公開',
    days: '日',
    hours: '時間',
    minutes: '分',
    seconds: '秒',
    released: 'リリース済み！',
    unknown: 'リリース日未定'
  }
};

export default function EmbedCountdownPage({ searchParams }: CountdownProps) {
  const theme = searchParams.theme || 'light';
  const lang = searchParams.lang || 'en';
  const showTitle = searchParams.showTitle !== 'false';
  const layout = searchParams.layout || 'horizontal';
  const showBorder = searchParams.border !== 'false';
  
  const t = translations[lang];
  
  // Target release date - using a placeholder date since actual date is TBA
  const targetDate = '2025-12-31T23:59:59Z';
  
  const themeStyles = theme === 'dark' ? {
    bg: '#0f0f23',
    text: '#ffffff',
    accent: '#8b5cf6',
    muted: '#64748b',
    border: '#374151'
  } : {
    bg: '#ffffff', 
    text: '#1f2937',
    accent: '#7c3aed',
    muted: '#6b7280',
    border: '#d1d5db'
  };

  const containerStyles = layout === 'vertical' ? {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: '16px'
  } : {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: '12px'
  };

  return (
    <html lang={lang}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        margin: '0', 
        padding: '8px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: themeStyles.bg
      }}>
        <div 
          id="silksong-countdown"
          style={{
            backgroundColor: themeStyles.bg,
            color: themeStyles.text,
            border: showBorder ? `1px solid ${themeStyles.border}` : 'none',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: layout === 'vertical' ? '200px' : '400px',
            ...containerStyles
          }}
        >
          {showTitle && (
            <div style={{ textAlign: layout === 'vertical' ? 'center' : 'left' }}>
              <h3 style={{ 
                margin: '0 0 4px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: themeStyles.accent
              }}>
                {t.title}
              </h3>
              <p style={{ 
                margin: '0', 
                fontSize: '12px', 
                color: themeStyles.muted 
              }}>
                {t.subtitle}
              </p>
            </div>
          )}
          
          <div 
            id="countdown-display"
            style={{
              display: 'flex',
              gap: layout === 'vertical' ? '8px' : '12px',
              flexDirection: layout === 'vertical' ? 'column' : 'row',
              alignItems: 'center'
            }}
          >
            <div id="days" className="countdown-unit" style={unitStyle(themeStyles)}>
              <span className="number">--</span>
              <span className="label">{t.days}</span>
            </div>
            <div id="hours" className="countdown-unit" style={unitStyle(themeStyles)}>
              <span className="number">--</span>
              <span className="label">{t.hours}</span>
            </div>
            <div id="minutes" className="countdown-unit" style={unitStyle(themeStyles)}>
              <span className="number">--</span>
              <span className="label">{t.minutes}</span>
            </div>
            <div id="seconds" className="countdown-unit" style={unitStyle(themeStyles)}>
              <span className="number">--</span>
              <span className="label">{t.seconds}</span>
            </div>
          </div>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const targetDate = new Date('${targetDate}').getTime();
                const t = ${JSON.stringify(t)};
                
                function updateCountdown() {
                  const now = new Date().getTime();
                  const diff = targetDate - now;
                  
                  if (diff <= 0) {
                    document.getElementById('countdown-display').innerHTML = 
                      '<div style="text-align: center; font-weight: 600; color: ${themeStyles.accent};">' + 
                      t.unknown + '</div>';
                    return;
                  }
                  
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                  
                  const daysEl = document.getElementById('days');
                  const hoursEl = document.getElementById('hours'); 
                  const minutesEl = document.getElementById('minutes');
                  const secondsEl = document.getElementById('seconds');
                  
                  if (daysEl) daysEl.querySelector('.number').textContent = days.toString().padStart(2, '0');
                  if (hoursEl) hoursEl.querySelector('.number').textContent = hours.toString().padStart(2, '0');
                  if (minutesEl) minutesEl.querySelector('.number').textContent = minutes.toString().padStart(2, '0');
                  if (secondsEl) secondsEl.querySelector('.number').textContent = seconds.toString().padStart(2, '0');
                }
                
                // Initial update
                updateCountdown();
                
                // Update every second
                setInterval(updateCountdown, 1000);
              })();
            `
          }}
        />
      </body>
    </html>
  );
}

function unitStyle(theme: any) {
  return {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    fontSize: '12px'
  };
}