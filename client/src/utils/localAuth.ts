// utils/localAuth.ts → Fake Database + Fake Session (TEMP)

// DELETE THIS AFTER BACKEND

import { User, UserWithPassword } from "@/types/auth";

const USERS_KEY = "users";
const AUTH_USER_KEY = "authUser";

// User = a person’s data
// AuthUser = proof that the person is currently logged in

// Reads all registered users
// If none exist → returns empty array
export const getUsers = (): UserWithPassword[] =>
  JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

// Writes users list
export const saveUsers = (users: UserWithPassword[]) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

// Stores only safe user info
export const saveAuthUser = (user: User) =>
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

// Used on page refresh
// Reads saved session
// Allows persistent login
export const getAuthUser = (): User | null =>
  JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");

export const clearAuthUser = () =>
  localStorage.removeItem(AUTH_USER_KEY);