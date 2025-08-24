export interface GameInfo {
  title: string;
  developer: string;
  releaseStatus: string;
  platforms: Platform[];
  description: string;
  features: Feature[];
  lastUpdate: string;
  expectedRelease: string;
}

export interface Platform {
  name: string;
  logo: string;
  url: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface Character {
  name: string;
  role: string;
  description: string;
  image: string;
}

export interface Screenshot {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
  featured?: boolean;
}

export interface SoundTrack {
  id: string;
  title: string;
  composer: string;
  duration: number;
  audioUrl: string;
  waveformData?: number[];
}

export interface Release {
  version: string;
  date: string;
  notes: string[];
  platforms: string[];
}