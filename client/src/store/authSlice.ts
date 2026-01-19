// store/authSlice.ts — Redux State Machine
// Redux slice = what auth state looks like

import { User } from "@/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

// user → UI data
// isAuthenticated → route protection
// error → login/signup feedback
interface AuthState {
    user: User | null,
    isAuthenticated: boolean,
    error: string | null,
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    error: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        // Stores error message for UI.
        authError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        // Runs on refresh:
        // Loads user from storage
        // Restores session
        hydrateAuth: (state, action: PayloadAction<User | null>) =>{
            if(action.payload){
                state.user = action.payload;
                state.isAuthenticated = true;
            } else{
                state.isAuthenticated = false;
                state.user = null;
            }
        }
    }
})

export const {
    loginSuccess,
    logout,
    authError,
    hydrateAuth
} = authSlice.actions;

export default authSlice.reducer;