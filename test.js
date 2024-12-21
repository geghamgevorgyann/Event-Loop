let nextTickQueue = [];
let setTimeoutQueue = [];

function customNextTick(fn) {
  nextTickQueue.push(fn);
}

function customSetTimeout(fn, delay) {
  setTimeoutQueue.push({ fn, delay });
}

function startCustomEventLoop() {
  // Process setTimeout tasks first
  while (setTimeoutQueue.length > 0) {
    const { fn, delay } = setTimeoutQueue.shift();
    setTimeout(fn, delay);
  }

  // Then process nextTick tasks
  while (nextTickQueue.length > 0) {
    const fn = nextTickQueue.shift();
    fn();
  }
}

// Example usage
customNextTick(() => console.log('nextTick 1'));
customSetTimeout(() => console.log('setTimeout 1'), 100);
customNextTick(() => console.log('nextTick 2'));
customSetTimeout(() => console.log('setTimeout 2'), 50);

startCustomEventLoop();
