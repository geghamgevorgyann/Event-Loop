class EventLoop {
  constructor(priorities) {
    this.running = false;
    this.priorities = priorities;
    this.queue = [];
    this.promises = [];
    this.nextTicks = [];
    this.timers = [];
    this.in_out=[]
    this.immediate=[]
    this.close=[]
  }

  // Initialize/reset the event loop
  init() {
    this.queue = [];
    this.promises = [];
    this.nextTicks = [];
    this.timers = [];
    this.in_out=[]
    this.immediate=[]
    this.close=[]
  }

  getTaskType(task) {
    const taskString = task.toString();

    if (taskString.includes("Promise") || taskString.includes(".then")) {
      return "promise";
    } else if (taskString.includes("setTimeout")) {
      return "timers";
    } else if (taskString.includes("setInterval")) {
      return "intervals";
    } else if (taskString.includes("clearInterval")) {
      return "clearIntervals";
    } else if (taskString.includes("setImmediate")) {
      return "immediate";
    } else if (taskString.includes("process.nextTick")) {
      return "nextTicks";
    } else if (taskString.includes("fetch")) {
      return "in_out";
    } else if (taskString.includes("close")) {
      return "close";
    } else {
      return "synchronous"; // Default for CPU-bound tasks or synchronous logs
    }
  }

  orderingEvents(tasks) {

    tasks.forEach((task, index) => {
      if (typeof task === "function") {
        const type = this.getTaskType(task);

        const priority = this.priorities[type] || Infinity;
        this.enqueue(task, `Task ${index + 1}`, priority);
      }
    });


    this.queue.sort((a, b) => a.priority - b.priority);


    this.queue.forEach(({ task, name }) => {
      console.log(`Executing ${name}`);
      task();
    });
  }

}

module.exports = EventLoop