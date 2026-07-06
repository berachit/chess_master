import { Link, useLocation } from "react-router-dom";
import { Crown, Menu, X, Home, LayoutGrid, User } from "lucide-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logOutUser } from "@/store/authActions";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border bg-[#080b12]/70 backdrop-blur-[16px]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Chess<span className="text-primary">Master</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 h-full">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 hover:text-foreground h-full flex items-center gap-2 ${
                    active ? "text-primary" : "text-foreground-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-ghost">
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary btn-sm">
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={() => dispatch(logOutUser())}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden btn-icon"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#080b12]/95 border-b border-border animate-fade-in backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navLinks.filter(l => l.path !== "/").map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-foreground-muted hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-secondary text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary text-center"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    dispatch(logOutUser());
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


