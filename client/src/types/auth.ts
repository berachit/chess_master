// auth.js -> single source of truth for user and defines what a User looks like across the app.

export interface User {
  id: string;
  name: string;
  email: string;
  rating: number;
  avatar: string;
  createdAt: string;
}

export interface UserWithPassword extends User {
  password: string; // local-only
}
