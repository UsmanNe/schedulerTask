import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";

interface Log {
  _id: string;
  executionTime: string;
  taskId: {
    _id: string;
  };
}

const LogList: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res: AxiosResponse<Log[]> = await axios.get(
          "http://localhost:5000/logs"
        );
        setLogs(res.data);
      } catch (error) {
        console.error("There was an error fetching the logs!", error);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h1>Execution Logs</h1>
      <ul>
        {logs.map((log) => (
          <li key={log._id}>
            Task ID: {log.taskId?._id} executed at{" "}
            {new Date(log.executionTime).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogList;
