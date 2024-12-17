class EventLoop {
    constructor() {
        this.queue = [];
        this.timers = [];
        this.activeHandles = 0;
        this.stopFlag = false;
    }

    // Initialize the event loop
    init() {
        this.stopFlag = false;
        this.activeHandles = 0;
        this.queue = [];
        this.timers = [];
        console.log("Event loop initialized.");
    }

    // Add a callback to the queue
    enqueue(callback) {
        this.queue.push(callback);
    }

    // Add a timer
    setTimer(callback, delay) {
        const timer = {
            callback,
            expiry: Date.now() + delay,
        };
        this.timers.push(timer);
    }

    // Process timers
    processTimers() {
        const now = Date.now();
        this.timers = this.timers.filter((timer) => {
            if (timer.expiry <= now) {
                timer.callback();
                return false;
            }
            return true;
        });
    }

    // Process the event queue
    processQueue() {
        while (this.queue.length > 0) {
            const callback = this.queue.shift();
            callback();
        }
    }

    // Start the event loop
    run() {
        while (!this.stopFlag) {
            this.processTimers();
            this.processQueue();
        }
        console.log("Event loop stopped.");
    }

    // Stop the event loop
    stop() {
        this.stopFlag = true;
    }
}

// Example usage
const loop = new EventLoop();
loop.init();

// Add tasks to the queue
loop.enqueue(() => console.log("Task 1 executed."));
loop.enqueue(() => console.log("Task 2 executed."));

// Add timers
loop.setTimer(() => console.log("Timer 1 fired."), 1000);
loop.setTimer(() => console.log("Timer 2 fired."), 2000);

// Start the loop in a separate asynchronous function to allow timers to work
setTimeout(() => loop.run(), 0);

// Stop the loop after 3 seconds
setTimeout(() => loop.stop(), 3000);
