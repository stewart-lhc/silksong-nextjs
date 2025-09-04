'use client';

import { useSearchParams } from 'next/navigation';


const translations = {
  en: {
    title: 'Hollow Knight: Silksong',
    buyNow: 'Buy Now',
    platforms: {
      steam: 'Steam (PC/Mac/Linux)',
      xbox: 'Xbox (Series X|S/One)',
      nintendo: 'Nintendo (Switch/Switch2)',
      playstation: 'PlayStation (PS4/PS5)',
      gog: 'GOG',
      humble: 'Humble Bundle',
    },
  },
  zh: {
    title: '空洞骑士：丝之歌',
    buyNow: '立即购买',
    platforms: {
      steam: 'Steam (PC/Mac/Linux)',
      xbox: 'Xbox (Series X|S/One)',
      nintendo: 'Nintendo (Switch/Switch2)',
      playstation: 'PlayStation (PS4/PS5)',
      gog: 'GOG',
      humble: 'Humble Bundle',
    },
  },
  es: {
    title: 'Hollow Knight: Silksong',
    buyNow: 'Comprar Ahora',
    platforms: {
      steam: 'Steam (PC/Mac/Linux)',
      xbox: 'Xbox (Series X|S/One)',
      nintendo: 'Nintendo (Switch/Switch2)',
      playstation: 'PlayStation (PS4/PS5)',
      gog: 'GOG',
      humble: 'Humble Bundle',
    },
  },
  fr: {
    title: 'Hollow Knight: Silksong',
    buyNow: 'Acheter Maintenant',
    platforms: {
      steam: 'Steam (PC/Mac/Linux)',
      xbox: 'Xbox (Series X|S/One)',
      nintendo: 'Nintendo (Switch/Switch2)',
      playstation: 'PlayStation (PS4/PS5)',
      gog: 'GOG',
      humble: 'Humble Bundle',
    },
  },
  de: {
    title: 'Hollow Knight: Silksong',
    buyNow: 'Jetzt Kaufen',
    platforms: {
      steam: 'Steam (PC/Mac/Linux)',
      xbox: 'Xbox (Series X|S/One)',
      nintendo: 'Nintendo (Switch/Switch2)',
      playstation: 'PlayStation (PS4/PS5)',
      gog: 'GOG',
      humble: 'Humble Bundle',
    },
  },
  ja: {
    title: 'ホロウナイト：シルクソング',
    buyNow: '今すぐ購入',
    platforms: {
      steam: 'Steam (PC/Mac/Linux)',
      xbox: 'Xbox (Series X|S/One)',
      nintendo: 'Nintendo (Switch/Switch2)',
      playstation: 'PlayStation (PS4/PS5)',
      gog: 'GOG',
      humble: 'Humble Bundle',
    },
  },
};

// Purchase links data
const purchaseLinks = [
  {
    id: 'steam',
    url: 'https://store.steampowered.com/app/1030300',
    key: 'steam' as const,
  },
  {
    id: 'xbox',
    url: 'https://www.xbox.com/en-us/games/store/hollow-knight-silksong/9n116v0599hb',
    key: 'xbox' as const,
  },
  {
    id: 'nintendo',
    url: 'https://www.nintendo.com/games/detail/hollow-knight-silksong-switch/',
    key: 'nintendo' as const,
  },
  {
    id: 'playstation',
    url: 'https://store.playstation.com/en-us/concept/10005908',
    key: 'playstation' as const,
  },
  {
    id: 'gog',
    url: 'https://www.gog.com/game/hollow_knight_silksong',
    key: 'gog' as const,
  },
  {
    id: 'humble',
    url: 'https://www.humblebundle.com/store/hollow-knight-silksong',
    key: 'humble' as const,
  },
];

export default function EmbedCountdownPage() {
  const searchParams = useSearchParams();

  const theme = searchParams.get('theme') || 'light';
  const lang = searchParams.get('lang') || 'en';
  const showTitle = searchParams.get('showTitle') !== 'false';
  const layout = searchParams.get('layout') || 'horizontal';
  const showBorder = searchParams.get('border') !== 'false';

  const t = translations[lang as keyof typeof translations] || translations.en;

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
    maxWidth: layout === 'vertical' ? '280px' : '600px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    minHeight: '160px',
  } as const;


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
            <a
              href="https://hollowknightsilksong.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <h3
                style={{
                  margin: '0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: themeStyles.accent,
                  cursor: 'pointer',
                }}
              >
                {t.title}
              </h3>
            </a>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: layout === 'vertical' ? 'column' : 'row',
            flexWrap: layout === 'vertical' ? 'nowrap' : 'wrap',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {purchaseLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                backgroundColor: themeStyles.accent,
                color: themeStyles.bg,
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: 'pointer',
                minWidth: layout === 'vertical' ? '200px' : '140px',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t.platforms[link.key]}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

