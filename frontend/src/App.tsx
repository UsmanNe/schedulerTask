import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TaskForm from "./components/TaskForm.tsx";
import TaskList from "./components/TaskList.tsx";
import LogList from "./components/LogList.tsx";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div>
        <nav className="center-nav">
          <ul>
            <li>
              <Link to="/tasks">Tasks</Link>
            </li>
            <li>
              <Link to="/new-task">New Task</Link>
            </li>
            <li>
              <Link to="/logs">Logs</Link>
            </li>
          </ul>
        </nav>
        <div className="route-container">
          <div className="route-content">
            <Routes>
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/new-task" element={<TaskForm />} />
              <Route path="/logs" element={<LogList />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
