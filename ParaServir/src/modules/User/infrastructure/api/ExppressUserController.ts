import type { Request, Response } from "express";
import { UserCreate } from "../../Application/UserCreate/UserCreate";
import { UserGetAll } from "../../Application/UsetGetAll/UserGetAll";
import { UserGetOneById } from "../../Application/UserGetOneById/UserGetOneById";
import { UserEdit } from "../../Application/UserEdit/UserEdit";
import { UserDelete } from "../../Application/UserDelete/UserDelete";
import { UserLogin } from "../../Application/UserLogin/UserLogin";
import { UserNotFoundError } from "../../Domain/UserNotFoundError";

export class ExpressUserController {
  private userCreate: UserCreate;
  private userGetAll: UserGetAll;
  private userGetOneById: UserGetOneById;
  private userEdit: UserEdit;
  private userDelete: UserDelete;
  private userLogin: UserLogin;

  constructor(
    userCreate: UserCreate,
    userGetAll: UserGetAll,
    userGetOneById: UserGetOneById,
    userEdit: UserEdit,
    userDelete: UserDelete,
    userLogin: UserLogin
  ) {
    this.userCreate = userCreate;
    this.userGetAll = userGetAll;
    this.userGetOneById = userGetOneById;
    this.userEdit = userEdit;
    this.userDelete = userDelete;
    this.userLogin = userLogin;
  }

  /**
   * POST /api/users
   * Crear un nuevo usuario
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { id, name, email, password, role } = req.body;

      if (!id || !name || !email || !password) {
        res.status(400).json({ 
          error: "Missing required fields", 
          required: ["id", "name", "email", "password"] 
        });
        return;
      }

      // Validar que el rol sea válido
      const validRoles = ["usuario", "trabajador"];
      const userRole = role && validRoles.includes(role) ? role : "usuario";
      const isVerified = req.body.isVerified || false;
      const createdAt = req.body.createdAt ? new Date(req.body.createdAt) : new Date();

      // Separar nombre y apellido si vienen juntos
      const nameParts = name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await this.userCreate.run(id, firstName, lastName, email, password, userRole, isVerified, createdAt);
      
      res.status(201).json({ 
        message: "User created successfully",
        user: { id, name, email, role, isVerified }
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ 
        error: "Failed to create user", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * GET /api/users
   * Obtener todos los usuarios
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userGetAll.run();
      
      res.status(200).json(
        users.map(user => ({
          id: user.id.value,
          name: user.name.value,
          email: user.email.value,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt.value,
          updatedAt: user.updatedAt
        }))
      );
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ 
        error: "Failed to get users", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * GET /api/users/:id
   * Obtener un usuario por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userGetOneById.run(id);
      
      res.status(200).json({
        id: user.id.value,
        name: user.name.value,
        email: user.email.value,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt.value,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error getting user:", error);
      res.status(500).json({ 
        error: "Failed to get user", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * PUT /api/users/:id
   * Actualizar un usuario
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ 
          error: "Missing required fields", 
          required: ["name", "email", "password"] 
        });
        return;
      }

      await this.userEdit.run(id, name, email, password);
      
      res.status(200).json({ 
        message: "User updated successfully",
        user: { id, name, email }
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error updating user:", error);
      res.status(500).json({ 
        error: "Failed to update user", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * DELETE /api/users/:id
   * Eliminar un usuario
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.userDelete.run(id);
      
      res.status(200).json({ 
        message: "User deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ 
        error: "Failed to delete user", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * POST /api/users/login
   * Iniciar sesión (obtener usuario por email y password)
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ 
          error: "Missing required fields", 
          required: ["email", "password"] 
        });
        return;
      }

      const user = await this.userLogin.run(email, password);
      
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id.value,
          name: user.name.value,
          email: user.email.value,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(401).json({ error: error.message });
        return;
      }
      console.error("Error logging in:", error);
      res.status(500).json({ 
        error: "Failed to login", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }
}
