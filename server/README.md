# Scholar Commute Admin Backend

This is the Node.js backend for the Scholar Commute Admin project. It provides secure API endpoints for authentication and data access, connecting to Firebase using the Admin SDK.

---

## Features
- Secure authentication (login, token verification)
- API endpoints for buses, routes, and stops
- All Firebase credentials and logic are hidden from the frontend
- Ready for deployment and production use

---

## Prerequisites
- Node.js (v16 or higher recommended)
- A Firebase project (with Firestore and Authentication enabled)
- Service account key JSON from Firebase Console

---

## Setup

1. **Clone the repository and navigate to the backend directory:**
   ```sh
   cd server
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Add your Firebase Admin SDK service account key:**
   - Download from Firebase Console > Project Settings > Service Accounts > Generate new private key
   - Save as `server/firebaseServiceAccountKey.json`

4. **Create a `.env` file in `/server` with the following:**
   ```env
   FIREBASE_WEB_API_KEY=your_firebase_web_api_key
   FIREBASE_DB_URL=https://your-project-id.firebaseio.com
   ```
   - You can find your Web API Key in Firebase Console > Project Settings > General

---

## Running the Backend

```sh
node index.js
```

The server will start on port 5000 by default.

---

## API Endpoints

### Authentication
- `POST /api/login` — Authenticate user, returns a secure token
  - Body: `{ email, password }`
- `POST /api/verify` — Verify a session token
  - Header: `Authorization: Bearer <token>`

### Data
- `GET /api/buses` — Get all buses
- `GET /api/routes` — Get all routes
- `GET /api/routes/:id` — Get a single route by ID
- `GET /api/stops` — Get all stops

---

## Deployment
- You can deploy this backend to any Node.js-compatible host (Render, Heroku, Vercel, etc.)
- Make sure to set the environment variables in your deployment platform

---

## Security Notes
- Never commit your service account key or `.env` to public repositories
- All sensitive Firebase logic is handled server-side
- You can add more endpoints and security as needed

---

## License
MIT 