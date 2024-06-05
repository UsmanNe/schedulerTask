import React, { useState, useEffect } from "react";
import axios from "axios";

const TaskForm = () => {
  const [type, setType] = useState("one-time");
  const [executionTime, setExecutionTime] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 3000); // Clear the message after 3 seconds

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [alertMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const task = {
      type,
      executionTime: type === "one-time" ? executionTime : undefined,
      cronExpression: type === "recurring" ? cronExpression : undefined,
    };

    try {
      await axios.post("http://localhost:5000/tasks", task);
      setAlertMessage("Task created successfully!");
      setAlertType("success");
    } catch (error) {
      setAlertMessage("There was an error creating the task!");
      setAlertType("error");
    }
  };

  return (
    <div>
      <h1>New Task</h1>
      {alertMessage && (
        <div
          className={`alert ${
            alertType === "success" ? "alert-success" : "alert-error"
          }`}
        >
          {alertMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Task Type:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="one-time">One-Time</option>
            <option value="recurring">Recurring</option>
          </select>
        </label>
        {type === "one-time" && (
          <label>
            Execution Time:
            <input
              required
              type="datetime-local"
              value={executionTime}
              onChange={(e) => setExecutionTime(e.target.value)}
            />
          </label>
        )}
        {type === "recurring" && (
          <label>
            Cron Expression:
            <input
              required
              placeholder="* * * * *"
              type="text"
              onChange={(e) => setCronExpression(e.target.value)}
              title="Valid cron job pattern: * * * * *"
              pattern="^((\*(\/\d+)?|([0-5]?\d)(-([0-5]?\d))?(\/\d+)?)(,(\*(\/\d+)?|([0-5]?\d)(-([0-5]?\d))?(\/\d+)?))* (\*(\/\d+)?|([01]?\d|2[0-3])(\/\d+)?)(,(\*(\/\d+)?|([01]?\d|2[0-3])(\/\d+)?))* (\*(\/\d+)?|(0?[1-9]|[12]\d|3[01])(\/\d+)?)(,(\*(\/\d+)?|(0?[1-9]|[12]\d|3[01])(\/\d+)?))* (\*(\/\d+)?|(0?[1-9]|1[0-2])(\/\d+)?)(,(\*(\/\d+)?|(0?[1-9]|1[0-2])(\/\d+)?))* (\*(\/\d+)?|([0-7])(\/\d+)?)(,(\*(\/\d+)?|([0-7])(\/\d+)?))*)$"
            />
          </label>
        )}
        <button type="submit">Create Task</button>
      </form>
    </div>
  );
};

export default TaskForm;
