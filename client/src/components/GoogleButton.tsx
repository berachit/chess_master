import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { googleLogin } from "@/store/authActions";

/**
 * Google Identity Services attaches itself to the global `window` object.
 * TypeScript doesn't know about it by default, so we declare it here
 * to avoid TS errors when accessing `window.google`.
 */
declare global {
  interface Window {
    google: any;
  }
}

// Renders the official Google Sign-In button and handles Google OAuth login (frontend-only).
const GoogleButton = () => {
  const dispatch = useAppDispatch();

  // useEffect ensures that Google Sign-In is initialized only once when the component is mounted.
  useEffect(() => {
    /**
     * Initialize Google Identity Services
     *
     * client_id:
     *  - Unique identifier for your Google OAuth app
     *  - Stored securely in environment variables
     *
     * callback:
     *  - Called by Google after the user successfully logs in
     *  - Contains a credential (JWT) issued by Google
     */
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        /**
         * Dispatch Google login action
         * - Decode Google credential
         * - Create app-compatible User object
         * - Store user in Redux
         * - Mark user as authenticated
         */
        dispatch(googleLogin(response.credential));
      },
    });

    /**
     * Render the official Google Sign-In button
     *
     * Google controls:
     *  - Styling
     *  - Accessibility
     *  - Security
     *
     * Button is rendered inside the div with id="google-btn"
     */
    window.google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      {
        theme: "outline", // Button style (light theme)
        size: "large", // Button size
        width: 300, // Fixed button width
      },
    );
  }, [dispatch]);

  /**
   * Container element where Google injects the button UI.
   * React does NOT control the button — Google does.
   */
  return <div id="google-btn" />;
};

export default GoogleButton;
