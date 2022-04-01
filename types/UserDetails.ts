export interface UserDetails {
  id: string /* primary key */;
  username: string;
  avatar_url?: string;
  bio: string;
  color_scheme: number;
  link_color_scheme: number;
  link_rounding: number;
}
