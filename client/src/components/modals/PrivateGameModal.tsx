/**
 * Modal for creating private matches with friends.
 */

import { X, Users, WifiOff } from "lucide-react";

type PrivateGameModalProps = {
  onClose: () => void;
};

const PrivateGameModal = ({ onClose }: PrivateGameModalProps) => {
  const handleOfflineGame = () => {
    console.log("Offline game selected");
    // later:
    // navigate("/play/private/offline");
  };

  const handleOnlinePrivateGame = () => {
    console.log("Online private game selected");
    // later:
    // navigate("/play/private/online");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          title="Close modal"
          className="absolute right-4 top-4 text-foreground-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Private Game
        </h2>
        <p className="mb-6 text-sm text-foreground-muted">
          Choose how you want to play with your friend.
        </p>

        {/* Options */}
        <div className="space-y-3">
          {/* Offline */}
          <button
            onClick={handleOfflineGame}
            className="flex w-full items-center gap-4 rounded-lg border border-border p-4 hover:border-primary/50 hover:bg-primary/5 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">
                Offline (Same Device)
              </p>
              <p className="text-sm text-foreground-muted">
                Play locally on one screen
              </p>
            </div>
          </button>

          {/* Online */}
          <button
            onClick={handleOnlinePrivateGame}
            className="flex w-full items-center gap-4 rounded-lg border border-border p-4 hover:border-primary/50 hover:bg-primary/5 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">
                Online Private Game
              </p>
              <p className="text-sm text-foreground-muted">
                Create a link and invite a friend
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateGameModal;
