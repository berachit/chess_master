// authActions.ts — Async Control Layer
// This layer:
// Connects Redux <-> Services
// Handles errors cleanly

import { clearAuthUser, getAuthUser } from "@/utils/localAuth";
import { AppDispatch } from "./store";
import { authError, hydrateAuth, loginSuccess, logout } from "./authSlice";
import { loginService, signupService } from "@/services/authService";

export const hydrateAuthFromStorage = 
    () => (dispatch : AppDispatch) => {
        const user = getAuthUser();
        if(user) dispatch(hydrateAuth(user));
}

export const logOutUser =
    () => (dispatch : AppDispatch) => {
        clearAuthUser();
        dispatch(logout());
    }

export const loginUser = 
    (email: string, password: string) => 
    (dispatch: AppDispatch) => {
        try {
            const user = loginService(email, password);
            dispatch(loginSuccess(user));
        } catch (err: any) {
            dispatch(authError(err.message));
        }
    }

export const signupUser = 
    (name: string, email: string, password: string) =>
    (dispatch: AppDispatch) => {
        try {
            const newUser = signupService(name, email, password);
            dispatch(loginSuccess(newUser));
        } catch (err: any) {
            dispatch(authError(err.message));
        }
    }