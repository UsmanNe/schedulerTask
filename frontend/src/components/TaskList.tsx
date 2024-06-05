import React, { useEffect, useState } from "react";
import axios from "axios";

interface Task {
  _id: string;
  type: "one-time" | "recurring";
  executionTime: string;
  cronExpression: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [updatedExecutionTime, setUpdatedExecutionTime] = useState<string>("");
  const [updatedCronExpression, setUpdatedCronExpression] =
    useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertType, setAlertType] = useState<string>("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get<Task[]>("http://localhost:5000/tasks");
        setTasks(res.data);
      } catch (error) {
        console.error("There was an error fetching the tasks!", error);
      }
    };
    fetchTasks();
  }, []);

  const handleDelete = async (taskId: string) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
      setAlertMessage("Task deleted successfully!");
      setAlertType("success");
    } catch (error) {
      setAlertMessage("There was an error deleting the task!");
      setAlertType("error");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    if (task.type === "one-time") {
      setUpdatedExecutionTime(task.executionTime);
    } else {
      setUpdatedCronExpression(task.cronExpression);
    }
  };

  const handleUpdate = async () => {
    if (!editingTask) return;

    const updatedTask: Partial<Task> = {
      type: editingTask.type,
      executionTime:
        editingTask.type === "one-time" ? updatedExecutionTime : undefined,
      cronExpression:
        editingTask.type === "recurring" ? updatedCronExpression : undefined,
    };

    try {
      const res = await axios.put<Task>(
        `http://localhost:5000/tasks/${editingTask._id}`,
        updatedTask
      );
      setTasks(
        tasks.map((task) => (task._id === editingTask._id ? res.data : task))
      );
      setEditingTask(null);
      setAlertMessage("Task updated successfully!");
      setAlertType("success");
    } catch (error) {
      setAlertMessage("There was an error updating the task!");
      setAlertType("error");
    }
  };

  return (
    <div>
      <h1>Task List</h1>
      {alertMessage && (
        <div
          className={`alert ${
            alertType === "success" ? "alert-success" : "alert-error"
          }`}
        >
          {alertMessage}
        </div>
      )}
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            {task.type} task scheduled for{" "}
            {task.type === "one-time"
              ? new Date(task.executionTime).toLocaleString()
              : task.cronExpression}
            <button onClick={() => handleEdit(task)}>Edit</button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
      {editingTask && (
        <div>
          <h2>Edit Task</h2>
          {editingTask.type === "one-time" ? (
            <div>
              <label>
                Execution Time:
                <input
                  type="datetime-local"
                  value={updatedExecutionTime}
                  onChange={(e) => setUpdatedExecutionTime(e.target.value)}
                />
              </label>
            </div>
          ) : (
            <div>
              <label>
                Cron Expression:
                <input
                  type="text"
                  value={updatedCronExpression}
                  onChange={(e) => setUpdatedCronExpression(e.target.value)}
                />
              </label>
            </div>
          )}
          <button onClick={handleUpdate}>Update Task</button>
        </div>
      )}
    </div>
  );
};

export default TaskList;
