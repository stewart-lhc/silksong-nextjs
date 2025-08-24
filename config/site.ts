export const siteConfig = {
  name: "Silk Song Archive",
  title: "Silk Song Archive - Hollow Knight: Silksong",
  description: "Your ultimate destination for Hollow Knight: Silksong news, updates, and comprehensive game information.",
  url: "https://silksong-archive.com",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/teamcherry",
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