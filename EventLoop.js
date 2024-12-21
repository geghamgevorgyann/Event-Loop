class EventLoop {
  constructor() {
    this.queues = {
      microtask: {
        nextTick: [],
        promises: []
      },
      timer: [],
      interval: [],
      io: [],
      check: [],
      close: []
    };
    this.running = false;
    this.intervalHandles = new Map();
  }

  static fs = {
    readFile: (path, callback) => {
      eventLoop.addIO(() => {
        callback(null, `File content of ${path}`);
      });
    }
  };

  static process = {
    nextTick: function(callback) {
      eventLoop.queues.microtask.nextTick.push(callback);
    }
  }


  setTimeout(callback, delay) {
    const executeAt = Date.now() + delay;
    const timer = { callback, executeAt };
    this.queues.timer.push(timer);
    return timer;
  }

  clearTimeout(handle) {
    this.queues.timer = this.queues.timer.filter(timer => timer !== handle);
  }

  setInterval(callback, interval) {
    const intervalHandle = setInterval(() => {
      callback();
    }, interval);
    this.intervalHandles.set(intervalHandle, callback);
    return intervalHandle;
  }

  clearInterval(handle) {
    clearInterval(handle);
    this.intervalHandles.delete(handle);
  }


  addIO(callback) {
    this.queues.io.push(callback);
  }

  setImmediate(callback) {
    this.queues.check.push(callback);
  }

  close(callback) {
    this.queues.close.push(callback);
  }


  processPhase(queueName) {
    if (queueName === "microtask") {
      const { nextTick, promises } = this.queues.microtask;
      while (nextTick.length > 0) {
        const task = nextTick.shift();
        task();
      }
      while (promises.length > 0) {
        const task = promises.shift();
        task();
      }
    } else if (queueName === "timer") {
      const now = Date.now();
      this.queues.timer = this.queues.timer.filter(timer => {
        if (timer.executeAt <= now) {
          timer.callback();
          return false;
        }
        return true;
      });
    } else {
      const queue = this.queues[queueName];
      while (queue.length > 0) {
        const task = queue.shift();
        task();
      }
    }
  }

  start(controlOrder = ["microtask", "io", "check", "close","timer"]) {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      for (const phase of controlOrder) {
        this.processPhase(phase);
      }


      if (
          !Object.values(this.queues).some(queue =>
              Array.isArray(queue)
                  ? queue.length > 0
                  : Object.values(queue).some(subQueue => subQueue.length > 0)
          ) &&
          this.running
      ) {
        this.stop();
        return;
      }

      if (this.running) {
        setImmediate(loop);
      }
    };

    loop();
  }

  stop() {
    this.running = false;
  }
}

const eventLoop = new EventLoop();

module.exports = {
  setTimeout: (callback, delay) => eventLoop.setTimeout(callback, delay),
  clearTimeout: handle => eventLoop.clearTimeout(handle),
  setInterval: (callback, interval) => eventLoop.setInterval(callback, interval),
  clearInterval: handle => eventLoop.clearInterval(handle),
  setImmediate: callback => eventLoop.setImmediate(callback),
  close: callback => eventLoop.close(callback),
  start: (controlOrder) => eventLoop.start(controlOrder),
  stop: () => setTimeout(() => eventLoop.stop(), 3000),
  process: EventLoop.process,
  fs: EventLoop.fs
};
