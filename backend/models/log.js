import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    executionTime: Date
});

const Log = mongoose.model('Log', logSchema);

export default Log;
