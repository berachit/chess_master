import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User as UserIcon, MapPin, Sparkles, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfileService } from "@/services/authService";
import { loginSuccess } from "@/store/authSlice";
import { useToast } from "@/hooks/use-toast";

const EditProfile = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState(currentUser?.name || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [location, setLocation] = useState(currentUser?.location || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 24) {
        throw new Error("Username must be between 3 and 24 characters");
      }

      const updatedUser = await updateProfileService({
        username: trimmedUsername,
        avatar: avatar.trim(),
        bio: bio.trim(),
        location: location.trim(),
      });

      dispatch(loginSuccess(updatedUser));
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
      navigate("/profile");
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Avatar presets helper
  const AVATAR_PRESETS = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=Pawn",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Knight",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Bishop",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Rook",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Queen",
    "https://api.dicebear.com/7.x/bottts/svg?seed=King",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-16 flex-grow flex items-center justify-center">
        <div className="max-w-xl w-full px-4">
          {/* Back to Profile Link */}
          <button
            onClick={() => navigate("/profile")}
            disabled={loading}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm font-semibold mb-6 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Profile
          </button>

          {/* Edit Card */}
          <div className="card-glass border border-card-border/80 p-4 sm:p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden animate-fade-in">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                  Edit Profile <UserIcon className="w-6 h-6 text-primary" />
                </h1>
                <p className="text-xs sm:text-sm text-foreground-muted mt-1.5 font-medium">
                  Update your chess master identity, avatar, location, and bio description.
                </p>
              </div>

              {/* Error Box */}
              {error && (
                <div className="mb-6 bg-destructive/10 border border-destructive/30 p-3 rounded-xl flex items-center gap-3 text-destructive text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-5">
                {/* Username Input */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-foreground-muted tracking-widest uppercase block mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    disabled={loading}
                    className="input font-semibold"
                  />
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-foreground-muted tracking-widest uppercase block mb-2">
                    Profile Avatar
                  </label>

                  {/* Preset Row */}
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {AVATAR_PRESETS.map((presetUrl) => {
                      const isSelected = avatar === presetUrl;
                      return (
                        <button
                          key={presetUrl}
                          type="button"
                          disabled={loading}
                          onClick={() => setAvatar(presetUrl)}
                          className={`aspect-square rounded-xl overflow-hidden border-2 bg-secondary/50 flex items-center justify-center transition-all p-1 hover:scale-105 active:scale-95
                            ${isSelected ? "border-primary bg-primary/10 shadow-[0_0_10px_rgba(20,184,166,0.2)]" : "border-border hover:border-border/80"}`}
                        >
                          <img src={presetUrl} alt="Avatar preset" className="w-full h-full object-contain" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Or paste custom image/SVG URL"
                      disabled={loading}
                      className="input text-xs font-mono"
                    />
                    {avatar && (
                      <div className="w-12 h-12 rounded-xl bg-secondary/80 border border-border flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                        <img
                          src={avatar}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Input */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-foreground-muted tracking-widest uppercase block mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Internet, London, New York"
                      disabled={loading}
                      className="input pl-10 font-medium"
                    />
                  </div>
                </div>

                {/* Bio Input */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-foreground-muted tracking-widest uppercase block mb-2">
                    Bio Description
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other players about yourself..."
                    disabled={loading}
                    rows={3}
                    className="input py-2.5 font-medium resize-none min-h-[90px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/45 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white tracking-wide text-center shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_4px_30px_rgba(20,184,166,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 animate-pulse" /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    disabled={loading}
                    className="py-3 px-6 rounded-xl font-semibold bg-secondary text-foreground border border-border hover:bg-secondary/70 transition-all text-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};

export default EditProfile;
