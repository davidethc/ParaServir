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

// Ruta de salud
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api/users`);
});


