# 👑 Chess Master - Real-Time Chess Web Application

Chess Master is a feature-rich, high-performance, real-time multiplayer chess web application designed with a premium glassmorphic dark-mode interface, immersive audio feedback, intelligent AI opponents, rating-based matchmaking, and direct player-vs-player challenge systems.

---

## 🌟 Key Features

### 👑 Real-Time Multiplayer Play
* **State Synchronization:** Fully synchronized game states powered by **Socket.io**.
* **Robust Verification:** Server-side move validation using `chess.js` to ensure anti-cheat and absolute rule adherence.
* **Game Timers:** Turn-based countdown timers supporting standard formats (Bullet, Blitz, Rapid, Classical) and custom time controls with increment (Fischer delay) support.
* **Disconnect Safety Net:** Players get a 60-second window to reconnect to an active game before forfeit.
* **Negotiations:** Seamless draw requests, resignations, early aborts (first two moves), and rematch proposals.

### 🤖 Intelligent AI Opponent (Single Player)
* **Local Engine:** Easy (Level 1), Intermediate (Level 3), and Hard (Level 5) difficulty settings processed locally on the client using `js-chess-engine`.
* **Stockfish AI:** "Impossible" difficulty powered by the **Stockfish Online API** (depth-10 search) for master-level play.

### ⚡ Smart Matchmaking
* **Rating-Based Pairing:** Automatical queue pairing using player ELO ratings with a limit of $\pm 250$ ELO difference.
* **Queue Management:** Real-time queue entry and exit matched to specific time control preferences.

### 📨 Direct & Link Invitations
* **Presence Challenge:** Challenge any online user directly from the active users list on the dashboard.
* **Custom Link Invitations:** Generate a unique link (`/invite/:code`) to invite friends from outside the application.

### 📊 Comprehensive Analytics Dashboard
* **ELO Tracking:** Displays current ELO rating with automated updates based on actual match results using the Elo algorithm ($K = 32$).
* **Statistics:** Tracks games played, wins, losses, draws, win rate, white/black performance statistics, and average opponent rating.
* **Recent Games:** Chronological game history with links to review matches.

### 🔊 Immersive Sound System
* High-fidelity sound effects for move execution, captures, castling, check announcements, promotion prompts, game-start, game-end, illegal moves, and the critical 10-second timer warning.

### 🛡️ Authentication & User Settings
* **Secure Auth:** Login/Register via JWT or via **Google OAuth 2.0**.
* **Settings:** Update custom bio, avatar, location, and update passwords. Reset password recovery workflow via nodemailer.

---

## 🛠️ Technical Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React (v18), Vite, TypeScript | User interface structure, type safety, and dev server |
| **State & Fetching** | Redux Toolkit, TanStack Query | Client auth state, global persistence, and API cache |
| **Styling & UI** | Tailwind CSS, Radix UI (shadcn/ui) | Glassmorphism design system and accessible primitives |
| **Real-time Engine** | Socket.io Client | Bidirectional event transport |
| **Chess Engines** | `chess.js`, `js-chess-engine` | Chess logic, legal move generation, and local bot play |
| **Backend Core** | Node.js, Express | RESTful APIs and server orchestration |
| **Real-time Server** | Socket.io | Game rooms, matchmaking, and presence handlers |
| **Database** | MongoDB, Mongoose | Schema definitions, indexing, and persistent storage |
| **Authentication** | JWT, BcryptJS, Google Auth Library | Local password hashing and OAuth validation |

---

## 📂 Project Structure

```
chess_master/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── assets/             # Audio effects and static imagery
│   │   ├── components/         # Custom & shadcn/ui components (ChessBoardUI, MoveList, etc.)
│   │   ├── context/            # Socket.io connection provider
│   │   ├── hooks/              # Custom React hooks (useChessGame, use-toast)
│   │   ├── pages/              # Routing views (Dashboard, Game, PlayBot, Profile)
│   │   ├── routes/             # Protected and public route guards
│   │   ├── store/              # Redux slices, actions, and store configuration
│   │   ├── utils/              # Client bots, auth helpers, sound players
│   │   ├── App.tsx             # Root page layout and route registry
│   │   └── main.tsx            # DOM mounting and provider wrapping
│   ├── package.json
│   └── tailwind.config.ts
│
├── server/                     # Backend API & Socket Server
│   ├── src/
│   │   ├── config/             # Database connection handler
│   │   ├── controllers/        # Express handlers (User, Game, Invitations, Google Auth)
│   │   ├── middlewares/        # Authentication gates for API routing
│   │   ├── models/             # Mongoose schemas (User, Game, Invitation)
│   │   ├── routes/             # Express routers
│   │   ├── services/           # Business logic (Chess.js validation, ELO calculating, mail)
│   │   ├── sockets/            # Real-time message handlers (Matchmaking, Game, Presence)
│   │   └── app.js              # Express app setup and middleware configuration
│   ├── server.js               # Entry point of the application
│   └── package.json
└── README.md                   # Project Documentation
```

---

## 🚀 Setup & Installation

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **MongoDB** (Local instance or MongoDB Atlas URI)
* **Google OAuth Credentials** (Optional, for Google Sign-in)

### Backend Configuration
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Define the variables:
   ```env
   MONGO_URI = mongodb://localhost:27017/chess_master
   PORT = 9000
   NODE_ENV = development
   JWT_SECRET = YOUR_JWT_SECRET
   GOOGLE_CLIENT_ID = YOUR_GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET = YOUR_GOOGLE_CLIENT_SECRET
   CLIENT_URL = http://localhost:8080
   ```
5. Spin up the server:
   ```bash
   npm run dev
   ```

### Frontend Configuration
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_API_URL = http://localhost:9000/api
   VITE_GOOGLE_CLIENT_ID = YOUR_GOOGLE_CLIENT_ID
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:8080` (or the port specified by Vite).

---

## 📡 WebSockets API

The application registers bidirectional socket handlers organized by domain:

### Matchmaking Handlers
* `join_queue`: Players specify their desired `timeControl` parameters. Automatically calls `findMatchAndExtract` to scan the database/in-memory queue for compatible opponents.
* `leave_queue`: Removes a player from the matchmaking queue.
* `match_found`: Emitted to both players when a compatible rating match is found, sending them the created game object.

### Game Handlers
* `join_game`: Links socket connection to a specific game room, syncs FEN/PGN history, and cancels any active disconnection timers.
* `make_move`: Submits moving nodes (`from`, `to`, `promotion`, `clientTimestamp`). Validates legal moves, updates timers, checks game-over statuses, and broadcasts updates.
* `offer_draw` / `accept_draw` / `decline_draw`: Manages draw negotiation events.
* `resign_game`: Instantly concludes the game in favor of the opponent.
* `abort_game`: Aborts games before two full moves have been played.
* `request_rematch` / `accept_rematch`: Allows players to request a rematch with swapped colors and the same time control parameters.

### Invitation Handlers
* `send_invitation`: Generates invitations. Direct invitations look up active users inside the presence table, while link invitations return a unique URL slug for sharing.
* `accept_invitation` / `accept_invite_code` / `decline_invitation`: Resolves pending invites.

### Presence Handlers
* Tracks connected socket users to update online/offline lists and dispatch status changes globally via the `online_users` event.

---

## 🔒 REST APIs

| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/user/register` | Creates a new user account | Public |
| **POST** | `/api/user/login` | Authenticates user & issues cookies | Public |
| **POST** | `/api/user/googleAuth` | Completes Google Sign-in flow | Public |
| **POST** | `/api/user/logout` | Clears local cookie credentials | Public |
| **GET** | `/api/user/me` | Fetches active authenticated user profile | Required |
| **PATCH** | `/api/user/profile` | Updates user details (bio, location, etc.) | Required |
| **POST** | `/api/user/forgotPassword` | Emails reset links using nodemailer | Public |
| **POST** | `/api/user/resetPassword/:token` | Resets account password | Public |
| **GET** | `/api/game/me/analytics` | Evaluates ELO progression, win rate ratios | Required |
| **GET** | `/api/game/getGame/:gameId` | Obtains full game history parameters | Required |
| **GET** | `/api/game/activeGames` | Lists user's ongoing active games | Required |
| **GET** | `/api/game/gameHistory` | Fetches all completed games | Required |
| **POST** | `/api/invitation` | Creates a new friendly invitation | Required |
| **GET** | `/api/invitation/pending` | Lists incoming invitations | Required |
| **GET** | `/api/invitation/code/:inviteCode` | Validates a shared invite link | Required |

---

## 📜 License

This project is licensed under the ISC License.
