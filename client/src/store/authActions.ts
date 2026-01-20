// authActions.ts — Async Control Layer
// This layer:
// Connects Redux <-> Services
// Handles errors cleanly

import { clearAuthUser, getAuthUser } from "@/utils/localAuth";
import { AppDispatch } from "./store";
import { authError, hydrateAuth, loginSuccess, logout } from "./authSlice";
import { loginService, signupService } from "@/services/authService";
import { decodeGoogleCredential } from "@/utils/googleAuth";
import { toast } from "@/hooks/use-toast";

export const googleLogin = (credential: string) => (dispatch: AppDispatch) => {
  const googleUser = decodeGoogleCredential(credential);

  const user = {
    id: `google_${googleUser.email}`,
    name: googleUser.name,
    email: googleUser.email,
    avatar: googleUser.picture,
    rating: 1200,
    provider: "google",
    createdAt: new Date().toISOString(),
  };
  dispatch(loginSuccess(user));

  toast({
    title: "Google Login Successful",
    description:`Welcome ${user.name}`,
  })
};

export const hydrateAuthFromStorage = () => (dispatch: AppDispatch) => {
  const user = getAuthUser();
  if (user) dispatch(hydrateAuth(user));
};

export const logOutUser = () => (dispatch: AppDispatch) => {
  clearAuthUser();
  dispatch(logout());

  toast({
    title:"Logged out successfully!"});
};

export const loginUser =
  (email: string, password: string) => (dispatch: AppDispatch) => {
    try {
      const user = loginService(email, password);
      dispatch(loginSuccess(user));
      toast({title:`Welcome back, ${user.name}!`});
    } catch (err: any) {
      dispatch(authError(err.message));
      toast(err.message || "Login failed");
    }
  };

export const signupUser =
  (name: string, email: string, password: string) =>
  (dispatch: AppDispatch) => {
    try {
      const newUser = signupService(name, email, password);
      dispatch(loginSuccess(newUser));

      toast({description:`Account created! Welcome, ${newUser.name} 🎉`});
    } catch (err: any) {
      dispatch(authError(err.message));
      toast(err.message || "Signup failed");
    }
  };
