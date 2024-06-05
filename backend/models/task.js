import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    type: String,
    executionTime: Date,
    cronExpression: String,
    status: { type: String, default: 'pending' }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
