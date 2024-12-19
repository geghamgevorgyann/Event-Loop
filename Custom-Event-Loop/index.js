const EventLoop = require("./EventLoop");

const priorities = {
    promise: 1,
    timers: 2,
    nextTicks: 3,
    immediate: 4,
    in_out:5,
    close:6
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
    () => console.log('Task 9: Another synchronous log (synchronous) '),
];

// Run the tasks
env.run(tasks);
