const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = require("./firebaseServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL,
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Get all buses
app.get("/api/buses", async (req, res) => {
  try {
    const snapshot = await db.collection("buses").get();
    const buses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(buses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch buses" });
  }
});
app.get("/api/buses/:id", async (req, res) => {
  const busId = req.params.id;

  if (!busId) {
    return res.status(400).json({ error: "Bus ID is required" });
  }

  console.log("Fetching bus with ID:", busId);

  try {
    // print(req.params);
    const busRef = db.collection("buses").doc(busId);
    const busSnap = await busRef.get();
    if (!busSnap.exists) {
      return res.status(404).json({ error: "Bus not found" });
    }
    console.log(busSnap.data());
    res.json({ id: busSnap.id, ...busSnap.data() });
  } catch (error) {
    console.error("Error fetching bus:", error);
    res.status(500).json({ error: "Failed to fetch bus" });
  }
});
// Get all routes
app.get("/api/routes", async (req, res) => {
  try {
    const snapshot = await db.collection("default_routes").get();
    const routes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(routes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});
app.get("/api/routes/:id/stops", async (req, res) => {
  const id = req.params.id; //if needed change this here
  const { source } = req.query;
  if (!source) {
    return res.status(400).json({ error: "Source is required" });
  }

  try {
    const colName = source === "copy" ? "copy_routes" : "default_routes";
    const docSnap = await db.collection(colName).doc(id).get();
    if (!docSnap.exists) {
      return res.json({ stops: [] });
    }
    const data = docSnap.data();
    res.json({ stops: data.stops || [] });
  } catch (error) {
    console.error("ERROR FETCHING ROUTE STOP", error);
    res.status(500).json({ error: "Failed to fetch stops" });
  }
});
// Get all stops (support single document with all stops as fields)
app.get("/api/stops", async (req, res) => {
  try {
    // Try to fetch a document with all stops as fields
    const stopsDoc = await db.collection("stops").doc("all").get();
    if (stopsDoc.exists) {
      const data = stopsDoc.data();
      // Convert fields to array of { name, map }
      const stops = Object.entries(data).map(([name, map]) => ({ name, map }));
      return res.json(stops);
    }
    // Fallback: return all documents as before
    const snapshot = await db.collection("stops").get();
    const stops = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(stops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stops" });
  }
});
app.get("/api/buses/:id", async (req, res) => {
  try {
    console.log(1);
    const busRef = db.collection("buses").doc(req.params.id);
    console.log(11);
    const busSnap = await busRef.get();
    if (!busSnap.exists) {
      return res.status(404).json({ error: "Bus not found" });
    }
    res.json({ id: busSnap.id, ...busSnap.data() }); // 👈 this line
  } catch (error) {
    console.error("Error fetching bus:", error);
    res.status(500).json({ error: "Failed to fetch bus" });
  }
});

// Get a single route by ID (for bus details)
app.get("/api/routes/:id", async (req, res) => {
  try {
    const docRef = db.collection("default_routes").doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Route not found" });
    }
    res.json({ id: docSnap.id, ...docSnap.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch route" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    // Use Firebase Auth REST API to sign in
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res
        .status(401)
        .json({ error: data.error?.message || "Invalid credentials" });
    }
    // Verify the ID token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(data.idToken);
    // You can add more custom claims or checks here if needed
    res.json({ token: data.idToken, uid: decodedToken.uid });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Token verification endpoint
app.post("/api/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    res.json({ valid: true, uid: decoded.uid });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// Get a single stop by name (case-insensitive, trimmed), supporting 'all' doc structure
app.get("/api/stops/:name", async (req, res) => {
  try {
    const nameParam = req.params.name.trim().toLowerCase();
    console.log(nameParam);
    // Try to fetch from the 'all' document
    const stopsDoc = await db.collection("stops").doc("lat_lng").get();
    if (stopsDoc.exists) {
      const data = stopsDoc.data();
      console.log(data);
      // Find the field matching the name (case-insensitive, trimmed)
      const foundKey = Object.keys(data).find((key) => key === nameParam);
      if (foundKey) {
        return res.json({ name: foundKey, map: data[foundKey] });
      }
    }
    // Fallback: search all documents
    const snapshot = await db.collection("stops").get();
    console.log("sN", snapshot);
    const stop = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .find((s) => s.name && s.name.trim().toLowerCase() === nameParam);
    if (!stop) {
      return res.status(404).json({ error: "Stop not found" });
    }
    res.json(stop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stop" });
  }
});

// Get all stops with lat/lng for a given route_id
app.get("/api/routes/:id/stop-coords", async (req, res) => {
  try {
    // 1. Fetch the route
    const routeDoc = await db
      .collection("default_routes")
      .doc(req.params.id)
      .get();
    if (!routeDoc.exists) {
      return res.status(404).json({ error: "Route not found" });
    }
    const routeData = routeDoc.data();
    const stopNames = routeData.stops || [];

    // 2. Fetch the stops/lat_lng document
    const stopsDoc = await db.collection("stops").doc("lat_lng").get();
    if (!stopsDoc.exists) {
      return res.status(404).json({ error: "Stops data not found" });
    }
    const stopsData = stopsDoc.data();
    // Build a normalized lookup for stop names
    const stopsLookup = {};
    Object.keys(stopsData).forEach((key) => {
      stopsLookup[key.trim().toLowerCase()] = stopsData[key];
    });

    // 3. Map stop names to coordinates (robust match)
    const stopsWithCoords = stopNames.map((name) => {
      const normName = name.trim().toLowerCase();
      const coords = stopsLookup[normName];
      if (coords && coords[0] && coords[1]) {
        return { name, lat: coords[0], lng: coords[1] };
      }
      console.warn("No lat/lng for stop:", name);
      return { name, lat: null, lng: null };
    });

    res.json(stopsWithCoords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stop coordinates" });
  }
});
app.post("/api/buses/set-default-buses", async (req, res) => {
  try {
    const busesSnapshot = await db.collection("buses").get();
    const batch = db.batch();
    busesSnapshot.forEach((docSnap) => {
      const busRef = db.collection("buses").doc(docSnap.id);
      batch.update(busRef, { isDefault: true });
    });
    await batch.commit();
    res.status(200).json({ message: "All buses updated with isDefault: true" });
  } catch (error) {
    console.error("Error updating buses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/buses/:id/set-default", async (req, res) => {
  const id = req.params.id;
  
  const value = req.body;
  if (!id) {
    return res.status(404).json({ error: "Failed to revert" });
  }

  try {
    await db.collection("buses").doc(id).update({ isDefault: value });
    res.json({ message: `Bus ${id} is Default set to ${value}` });
  } catch (error) {
    console.error("Error updating isDefault:", error);
    res.status(500).json({ error: "Failed to update bus default state" });
  }
});
app.post("/api/notifications", async (req, res) => {
  const { message } = req.body;
  const timestamp = Date.now().toString();

  try {
    await db.collection("notifications").doc(timestamp).set({
      message,
      timestamp: new Date().toISOString(),
    });
    res.json({ message: "Notification added" });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});
app.post("/api/stops/add", async (req, res) => {
  const { stopname, lat = 0, lng = 1 } = req.body;

  try {
    const ref = await db.collection("stops").add({ stopname, lat, lng });
    res.status(201).json({ id: ref.id, stopname, lat, lng });
  } catch (error) {
    console.error("Error adding stop:", error);
    res.status(500).json({ error: "Failed to add stop" });
  }
});
app.post("/api/routes/:routeId/save-stops", async (req, res) => {
  try {
    const { routeId } = req.params;
    const { stops } = req.body;

    const routeRef = db.collection("copy_routes").doc(routeId);

    const docSnap = await routeRef.get();
    if (docSnap.exists) {
      await routeRef.update({ stops });
    } else {
      await routeRef.set({ stops });
    }

    res.status(200).json({ message: "Stops saved successfully" });
  } catch (error) {
    console.error("Error saving stops:", error);
    res.status(500).json({ error: "Failed to save stops" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
