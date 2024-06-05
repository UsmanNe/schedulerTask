import Log from "../models/log.js"

export default async function logService(req, res) {
  try {
    const logs = await Log.find({}).populate("taskId");
    res.status(200).send(logs);
  } catch (error) {
    res.status(500).send(error);
  }
}
