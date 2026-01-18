import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Play from "./pages/Play";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  // <AuthProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ScrollToTop/>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/play" element={<Play/>}/>
          <Route path="/game/:id" element={<Game />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  // </AuthProvider>
);

export default App;
