import express from "express";
import TaskService from "../controllers/tasks-service.js";

const router = express.Router();
const taskService = new TaskService();

router.post("/", (req, res) => taskService.createTask(req, res));

router.get("/", (req, res) => taskService.getAllTasks(req, res));

router.put("/:id", (req, res) => taskService.updateTask(req, res));

router.delete("/:id", (req, res) => taskService.deleteTask(req, res));

export default router;
