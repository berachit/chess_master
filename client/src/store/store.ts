// store/store.ts — Global State Container

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"

// Think of this as:
// "Which backend tables exist in frontend memory?"
export const store = configureStore({
    reducer: {
        auth: authReducer,
    }
})

// These two lines are the backbone of type-safe Redux in TypeScript.

// RootState represents the complete shape of the Redux store.
// It is automatically inferred from store.getState(), so it always
// stays in sync when new slices are added (auth, game, etc.).
// Used mainly with useSelector for type-safe state access.
export type RootState = ReturnType<typeof store.getState>;


// AppDispatch represents the exact type of Redux dispatch function.
// It allows dispatching both normal actions and async thunks
// without TypeScript errors.
// Used with useDispatch to get a fully typed dispatch.
export type AppDispatch = typeof store.dispatch;

// RootState → What does my Redux state look like?
// AppDispatch → What can my Redux dispatch send?
