import express, { type Express } from "express";
import cors from "cors";
import { ServiceContainer } from "./modules/Shared/Infrastructure/ServiceContainer";

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar contenedor de servicios
const serviceContainer = new ServiceContainer();
const userController = serviceContainer.getUserController();
const workerController = serviceContainer.getWorkerController();

// Rutas de usuarios
app.post("/api/users", (req, res) => {
  userController.create(req, res).catch((err) => {
    console.error("Error in create:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

app.get("/api/users", (req, res) => {
  userController.getAll(req, res).catch((err) => {
    console.error("Error in getAll:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

app.get("/api/users/:id", (req, res) => {
  userController.getById(req, res).catch((err) => {
    console.error("Error in getById:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

app.put("/api/users/:id", (req, res) => {
  userController.update(req, res).catch((err) => {
    console.error("Error in update:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

app.delete("/api/users/:id", (req, res) => {
  userController.delete(req, res).catch((err) => {
    console.error("Error in delete:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

// Ruta de login
app.post("/api/users/login", (req, res) => {
  userController.login(req, res).catch((err) => {
    console.error("Error in login:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

// Rutas de trabajadores (Worker Profiles)
app.post("/api/workers/profiles", (req, res) => {
  workerController.createProfile(req, res).catch((err) => {
    console.error("Error in createProfile:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

app.get("/api/workers/profiles/user/:userId", (req, res) => {
  workerController.getProfileByUserId(req, res).catch((err) => {
    console.error("Error in getProfileByUserId:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

app.put("/api/workers/profiles/:id", (req, res) => {
  workerController.updateProfile(req, res).catch((err) => {
    console.error("Error in updateProfile:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

// Rutas de servicios de trabajadores (Worker Services)
app.post("/api/workers/services", (req, res) => {
  workerController.createService(req, res).catch((err) => {
    console.error("Error in createService:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

app.get("/api/workers/services/worker/:workerId", (req, res) => {
  workerController.getServicesByWorkerId(req, res).catch((err) => {
    console.error("Error in getServicesByWorkerId:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

app.put("/api/workers/services/:id", (req, res) => {
  workerController.updateService(req, res).catch((err) => {
    console.error("Error in updateService:", err);
    res.status(500).json({ error: "Internal server error" });
  });
});

// Ruta de salud
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available:`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`   - Workers: http://localhost:${PORT}/api/workers`);
});


