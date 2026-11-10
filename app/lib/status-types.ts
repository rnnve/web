export type Activity = {
  name?: string;
  type?: string;
  details?: string | null;
  state?: string | null;
  icon?: string | null;
  timestamps?: { start?: number | null; end?: number | null } | null;
};
export type DiscordProfile = {
  username?: string;
  displayName?: string;
  globalName?: string;
  avatar?: string;
  banner?: string;
  accentColor?: string;
  badges?: string[];
  status?: string;
  customStatus?:
    | string
    | { text?: string; state?: string; emoji?: { name?: string } }
    | null;
  activities?: Activity[];
  mobile?: boolean;
  desktop?: boolean;
  web?: boolean;
  guildName?: string;
};
export type SpotifyView = {
  isPlaying: boolean;
  title: string;
  artist: string;
  primaryArtist?: string;
  primaryArtistUrl?: string;
  album: string;
  artwork: string;
  progress: number;
  duration: number;
  url: string;
  device: { name: string; type: string } | null;
};
export type GitHubView = {
  login: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  bio: string;
  location: string;
  blog: string;
  repositories: number;
  followers: number;
  following: number;
  joinedAt: string;
};
