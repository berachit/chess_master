// services/authService.ts -> Authentication business logic
// What it does?
// Handles signup & login logic
// Validates credentials
// Converts unsafe user → safe user

// Redux should not contain logic
// UI should not touch storage
// Backend swap happens here only

// REPLACE THIS WITH BACKEND

import { User, UserWithPassword } from "@/types/auth"
import { getUsers, saveAuthUser, saveUsers } from "@/utils/localAuth"


export const signupService = (
  name: string,
  email: string,
  password: string
): User => {
  const users = getUsers();

  if (users.find(u => u.email === email)) {
    throw new Error("User already exists");
  }

  const newUser: UserWithPassword = {
    id: `u_${Date.now()}`,
    name,
    email,
    password,
    rating: 1200,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);

// Advanced JS/TS trick:
// Removes password
// Ensures UI never sees it
  const { password: _, ...safeUser } = newUser;
  saveAuthUser(safeUser);

  return safeUser;
};

export const loginService = (
    email: string,
    password:string,
) : User => {
    const users = getUsers();

    const user = users.find(
    u => u.email === email && u.password === password
  );

    if (!user) {
    throw new Error("Invalid credentials");
  }

  const { password: _, ...safeUser } = user;
  saveAuthUser(safeUser);

  return safeUser;

}