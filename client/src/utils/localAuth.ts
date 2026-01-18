// utils/localAuth.ts → Fake Database + Fake Session (TEMP)

import { User, UserWithPassword } from "@/types/auth";

const USERS_KEY = "users";
const AUTH_USER_KEY = "authUser";

// User = a person’s data
// AuthUser = proof that the person is currently logged in

export function getUsers(): UserWithPassword[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

export function saveUsers(users: UserWithPassword){
    return localStorage.setItem(USERS_KEY , JSON.stringify(users));
}

export function saveAuthUser(user: User){
    return localStorage.setItem
}
