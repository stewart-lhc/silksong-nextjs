export const siteConfig = {
  name: "Hollow Knight Silksong",
  title: "Hollow Knight Silksong - Official News & Updates",
  description: "Your ultimate destination for Hollow Knight: Silksong news, updates, and comprehensive game information.",
  url: "https://www.hollowknightsilksong.org",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://x.com/teamcherry",
    github: "https://github.com/team-cherry",
    steam: "https://store.steampowered.com/app/1030300/Hollow_Knight_Silksong/",
  },
  creator: "Silk Song Archive Team",
  keywords: [
    "Hollow Knight",
    "Silksong", 
    "Team Cherry",
    "Metroidvania",
    "Indie Game",
    "Hornet",
    "Gaming",
    "Adventure",
  ],
} as const;

export type SiteConfig = typeof siteConfig;