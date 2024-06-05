import cron from "node-cron";
import cronParser from "cron-parser";
import Task from "../models/task.js";
import Log from "../models/log.js";

export default async function checkAndExecuteTasks() {
  console.log(
    "<----------The server just started looking for pending tasks if any---------->\n"
  );
  // retrieve tasks from the database with status pending
  const tasks = await Task.find({ status: "pending" });
  // check to see if results are returned
  if (tasks.length > 0) {
    console.log(
      "<----------Tasks Found proceeding to execute accordingly---------->\n"
    );
  } else {
    console.log(
      "<----------There are no pending tasks to execute right now---------->\n"
    );
    // Further execution is no longer required break out of the function
    return "There are no pending tasks to execute right now";
  }
  // look for a pending job in one-time jobs
  const oneTimeJobs = tasks.filter((tsk) => tsk && tsk.type === "one-time");
  // later populate this with expired one time jobs
  const expiredOneTimeJobs = [];
  // later populate this with expired recurring jobs
  const expiredRecurringJobs = [];
  if (oneTimeJobs.length > 0) {
    for (const oTJob of oneTimeJobs) {
      // get a fresh instance of current date
      const now = new Date();
      if (oTJob.executionTime >= now) {
        console.log(
          "<----------Date is valid initiating task execution---------->"
        );
        // execute the task
        executeTask(oTJob, oTJob.executionTime, oTJob.type);
      } else {
        console.log(
          "<----------Can't initiate tasks in the past stopping task execution---------->"
        );
        // populate a list of stale one time jobs that can be stored inside db document and displayed on FE
        expiredOneTimeJobs.push(oTJob);
      }
    }
  }
  // look for a pending job from recurring schedules
  const recurringJobs = tasks.filter((tsk) => tsk && tsk.type === "recurring");
  if (recurringJobs.length > 0) {
    // check to see if the cron expressions are still valid
    const passiveJobs = recurringJobs.filter((task) =>
      isCronExpressionExpired(task.cronExpression)
    );
    const activeJobs = recurringJobs.filter(
      (task) => !isCronExpressionExpired(task.cronExpression)
    );
    console.log("I found pending and active tasks", activeJobs);
    console.log("I found pending and passive tasks", passiveJobs);

    // considering the valid tasks array
    if (activeJobs.length > 0) {
      activeJobs.forEach((ajob) => {
        const now = new Date();
        executeTask(ajob, now, ajob.type);
      });
    }
    if (passiveJobs.length > 0) {
      // populate a list of stale recurring jobs that can be stored inside a DB document and displayed on FE
      expiredRecurringJobs.push(oTJob);
    }
  }
}

function executeTask(job, currentTime, jobType) {
  console.log(`Executing task ${job._id} at ${currentTime}`);
  // get min and hours as one time task can be run any year any date and any day
  const { minutes, hours } = getMinAndHours(currentTime);
  try {
    const cronExpression =
      jobType === "one-time" ? `${minutes} ${hours} * * *` : job.cronExpression;
    console.log("Before scheduling", cronExpression);
    // execute the task
    const task = cron.schedule(
      cronExpression,
      async () => {
        console.log("Inside the schedule function");
        // update job status here
        if (jobType === "one-time") {
          job.status = "executed";
        } else {
          job.status = "in-progress";
        }
        try {
          // update task status in the db
          const dbTaskResp = await job.save();
          console.log(
            "<---------After confirmation saving log---------->\n",
            dbTaskResp
          );
          // create a new log entry in the database
          const log = new Log({ taskId: job._id, executionTime: currentTime });
          // update log information in the db
          const dbLogResp = await log.save();
          console.log(
            "<----------After confirmation execute task log---------->\n",
            dbLogResp
          );
        } catch (error) {
          console.log(
            "<----------Following error occured while writing to the database---------->",
            err
          );
        }
        // ensuring a one-time task never accidently runs again in the future
        if (jobType === "one-time") {
          task.stop();
        }
      },
      { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
    );
  } catch (err) {
    console.log(
      "<----------Following error occured while trying to schedule the tasks---------->\n",
      err
    );
  }
}

// Function to check if a cron expression is expired
export const isCronExpressionExpired = (cronExpression) => {
  try {
    const interval = cronParser.parseExpression(cronExpression);
    const nextExecution = interval.next().toDate();

    // Compare the next execution time with the current time
    return nextExecution < new Date();
  } catch (err) {
    // Consider parsing failed scenarios or runtime errors/bugs in the library
    console.error(
      "<----------Invalid cron expression---------->\n",
      err.message
    );
    return true;
  }
};

// Extract minutes and hours from date-time string
const getMinAndHours = (dateTime) => {
  // Date-time string
  const dateTimeString = dateTime;
  // Create a new Date object from the date-time string
  const date = new Date(dateTimeString);
  // Get the minutes and hours from the Date object
  const minutes = date.getMinutes();
  const hours = date.getHours();
  return { minutes, hours };
};
