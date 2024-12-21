let uniqueId = 0;
const timers = new Map();

function setTimeout(callback, delay, ...args) {
    const id = ++uniqueId; // Unique ID for this timer
    const start = Date.now();

    function checkTime() {
        const elapsed = Date.now() - start;
        if (elapsed >= delay) {
            callback(...args);
            timers.delete(id);
        } else {
            timers.set(id, setImmediate(checkTime));
        }
    }

    timers.set(id, setImmediate(checkTime));
    return id;
}

function clearTimeout(id) {
    if (timers.has(id)) {
        clearImmediate(timers.get(id));
        timers.delete(id);
    }
}

function setInterval(callback, interval, ...args) {
    const id = ++uniqueId;

    function scheduleNext() {
        const start = Date.now();

        function checkTime() {
            const elapsed = Date.now() - start;
            if (elapsed >= interval) {
                callback(...args);
                timers.set(id, setImmediate(scheduleNext));
            } else {
                timers.set(id, setImmediate(checkTime));
            }
        }

        timers.set(id, setImmediate(checkTime));
    }

    scheduleNext();
    return id;
}

function clearInterval(id) {
    clearTimeout(id);
}

module.exports = { setTimeout, clearTimeout, setInterval, clearInterval };
