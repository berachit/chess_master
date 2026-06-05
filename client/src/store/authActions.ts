// authActions.ts — Async Control Layer
// This layer:
// Connects Redux <-> Services
// Handles errors cleanly

import { AppDispatch } from "./store";
import { authError, hydrateAuth, loginSuccess, logout } from "./authSlice";
import { toast } from "@/hooks/use-toast";
import {
  getMeService,
  googleAuthService,
  loginService,
  logoutService,
  signUpService,
} from "@/services/authService";

const getErrorMessage = (err: any): string => {
  return err.response?.data?.message || err.message || "Something went wrong";
};

export const googleLogin =
  (credential: string) => async (dispatch: AppDispatch) => {
    try {
      const user = await googleAuthService(credential);
      dispatch(loginSuccess(user));

      toast({
        title: "Google Login Successful",
        description: `Welcome ${user.name}`,
      });
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      dispatch(authError(errMsg));
      toast({
        title: "Google Login Failed",
        description: errMsg,
        variant: "destructive",
      });
    }
  };

export const hydrateAuthFromStorage = () => async (dispatch: AppDispatch) => {
  try {
    const user = await getMeService();
    dispatch(hydrateAuth(user));
  } catch (error) {
    dispatch(hydrateAuth(null));
  }
};

export const logOutUser = () => async (dispatch: AppDispatch) => {
  try {
    await logoutService();
    dispatch(logout());

    toast({
      title: "Logged out successfully!",
    });
  } catch (err) {
    const errMsg = getErrorMessage(err);
    dispatch(logout());
    toast({
      title: "Logged Out",
      description: errMsg,
    });
  }
};

export const loginUser =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      const user = await loginService(email, password);
      dispatch(loginSuccess(user));
      toast({ title: `Welcome back, ${user.name}!` });
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      dispatch(authError(errMsg));
      toast({
        title: "Login failed",
        description: errMsg,
        variant: "destructive",
      });
    }
  };
  
  export const signupUser =
  (name: string, email: string, password: string) =>
    async (dispatch: AppDispatch) => {
      try {
        const newUser = await signUpService(name, email, password);
        dispatch(loginSuccess(newUser));
        
        toast({ description: `Account created! Welcome, ${newUser.name} 🎉` });
      } catch (err: any) {
        const errMsg = getErrorMessage(err);
        dispatch(authError(errMsg));
        toast({
          title: "Signup failed",
          description: errMsg,
          variant: "destructive",
        });
    }
  };
