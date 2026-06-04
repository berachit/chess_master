import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Play from "./pages/Play";
import PlayBot from "./pages/PlayBot";
import PlayOnline from "./pages/PlayOnline";
import PlayPrivate from "./pages/PlayPrivate";
import ScrollToTop from "./components/ScrollToTop";

import { hydrateAuthFromStorage } from "./store/authActions";
import type { AppDispatch } from "./store/store";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthRedirectRoute from "./routes/AuthRedirectRoute";
import { sounds } from "./utils/sound";

const queryClient = new QueryClient();

const App = () => {
  // Typed Redux dispatch
  const dispatch = useDispatch<AppDispatch>();

  // Runs once on app load
  // Restores auth state from localStorage (login persistence)
  useEffect(() => {
    dispatch(hydrateAuthFromStorage());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />

          <Route element={<AuthRedirectRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route path="/play" element={<Play />} />
          <Route path="/play/bot" element={<PlayBot />} />
          <Route path="/play/online" element={<PlayOnline />} />
          <Route path="/play/private" element={<PlayPrivate />} />

          {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="/profile" element={<Profile />} /> 
          {/* </Route> */}

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
