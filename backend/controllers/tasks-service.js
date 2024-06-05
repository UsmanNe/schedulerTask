import Task from "../models/task.js";
import taskScheduler from "../utilities/tasks-util.js";
import cron from "node-cron";

class TaskService {
  async createTask(req, res) {
    try {
      const { cronExpression } = req.body;
      // a check to validate cron expression from the front-end
      if (cronExpression && !cron.validate(cronExpression)) {
        res.status(404).send("Please input a valid cron expression");
        return;
      }
      const task = new Task(req.body);
      console.log(task, req.body);
      const newTask = await task.save();
      // if a new task is created re-run the scheduler to execute this task
      if (newTask) {
        taskScheduler();
      }
      res.status(201).send(task);
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  }

  async getAllTasks(req, res) {
    try {
      const tasks = await Task.find({});
      res.status(200).send(tasks);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async updateTask(req, res) {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(200).send(task);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async deleteTask(req, res) {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).send(error);
    }
  }
}

export default TaskService;
