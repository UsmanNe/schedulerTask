import dotenv from 'dotenv'
import express from 'express';
import cors from 'cors';
import taskChecker from './utilities/tasks-util.js'
import taskRoutes from './routes/tasks.js';
import logRoutes from './routes/logs.js';
import db from './db/connection.js';
dotenv.config()

const app = express();

app.use(cors());

app.use(express.json());
app.use('/tasks', taskRoutes);
app.use('/logs', logRoutes);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
    const port = 5000;
    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        try {
                taskChecker();    
        } catch (err) {
            console.log("Am I failing here", err)
        }
    });
    server.on('error', ()=>{
        console.error('Server failed to start:', error);
    })
});



