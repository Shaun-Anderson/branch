export interface UserDetails {
  id: string /* primary key */;
  username: string;
  avatar_url?: string;
  bio: string;
  colorScheme: number;
}
