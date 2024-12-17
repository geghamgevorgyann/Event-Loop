class CallStack {
    constructor() {
        this.stack = [];
    }

    // Add a task to the call stack
    push(taskName) {
        this.stack.push(taskName);
        this.log();
    }

    // Remove the top task from the call stack
    pop() {
        const taskName = this.stack.pop();
        this.log();
        return taskName;
    }

    // Log the current state of the call stack
    log() {
        console.log("Call Stack:", this.stack.length ? this.stack.join(" -> ") : "Empty");
    }
}

class EventLoop {
    constructor(priorities) {
        this.queue = [];       // Macrotask queue
        this.timers = [];      // Timers (setTimeout)
        this.microtasks = [];  // Microtasks (Promises)
        this.nextNotes = [];   // "Next Note" tasks (custom task type)
        this.running = false;  // Control flag for the event loop
        this.priorities = priorities; // Priority mapping for task types
        this.callStack = new CallStack(); // Initialize the call stack
    }

    // Initialize/reset the event loop
    init() {
        this.queue = [];
        this.timers = [];
        this.microtasks = [];
        this.nextNotes = [];
    }

    // Run the event loop
    async run(tasks) {
        tasks.forEach((task, index) => {
            if (typeof task === "function") {
                this.enqueue(task, `Task ${index + 1}`);
            }
        });

        this.running = true;
        while (this.running) {
            const tasksByPriority = [
                { queue: this.microtasks, priority: this.priorities.promise },
                { queue: this.timers, priority: this.priorities.timers },
                { queue: this.nextNotes, priority: this.priorities.nextNote },
                { queue: this.queue, priority: this.priorities.macrotask || 4 },
            ];

            tasksByPriority.sort((a, b) => a.priority - b.priority);

            let tasksProcessed = false;
            for (const { queue } of tasksByPriority) {
                if (queue.length) {
                    const { task, taskName } = queue.shift();
                    this.callStack.push(taskName); // Push task to call stack
                    await task();
                    this.callStack.pop(); // Pop task from call stack
                    tasksProcessed = true;
                    break;
                }
            }

            if (!tasksProcessed) {
                this.running = false;
            }
        }

        this.init();
    }

    // Add a microtask (Promises)
    addMicrotask(task, taskName = "Microtask") {
        this.microtasks.push({ task, taskName });
    }

    // Schedule a timer (setTimeout)
    scheduleTimer(callback, delay, taskName = "Timer Task") {
        const timerTask = () =>
            new Promise((resolve) =>
                setTimeout(() => {
                    callback();
                    resolve();
                }, delay)
            );
        this.timers.push({ task: timerTask, taskName });
    }

    // Add a custom "Next Note" task
    addNextNote(task, taskName = "Next Note Task") {
        this.nextNotes.push({ task, taskName });
    }

    // Enqueue a macrotask
    enqueue(task, taskName = "Macrotask") {
        this.queue.push({
            task: () => {
                try {
                    const result = task();
                    if (result instanceof Promise) {
                        this.addMicrotask(() => result, `${taskName} - Microtask`);
                    }
                } catch (error) {
                    console.error(`${taskName} error:`, error);
                }
            },
            taskName,
        });
    }
}

// Define priorities for task types
const priorities = {
    promise: 1,
    timers: 2,
    nextNote: 3,
    macrotask: 4,
};

// Create the event loop
const env = new EventLoop(priorities);

// Define tasks
const tasks = [
    () => console.log('Task 1: log1 (synchronous)'),
    () => setTimeout(() => console.log('Task 2: setTimeout with 0ms (asynchronous)'), 0),
    () => {
        let sum = 0;
        for (let i = 0; i < 1000000; i++) sum += i; // Simulating a CPU-intensive synchronous task
        console.log('Task 3: Computation complete (synchronous)');
    },
    () => setTimeout(() => console.log('Task 4: setTimeout with 100ms (asynchronous)'), 100),
    () => new Promise((resolve) => resolve('Task 5: Promise resolved (asynchronous)'))
        .then((message) => console.log(message)),
    () => console.log('Task 6: log2 (synchronous)'),
    () => new Promise((resolve) => setTimeout(() => resolve('Task 7: Delayed Promise (asynchronous)'), 50))
        .then((message) => console.log(message)),
    () => fetch('https://jsonplaceholder.typicode.com/posts/1')
        .then((response) => response.json())
        .then((data) => console.log('Task 8: Fetched data (asynchronous)', data))
        .catch((err) => console.error('Task 8: Fetch error', err)),
    () => console.log('Task 9: Another synchronous log (synchronous)'),
];

// Run the tasks
env.run(tasks);
