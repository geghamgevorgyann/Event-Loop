const {
    process,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    setImmediate,
    close,
    start,
    stop,
    fs
} = require("./EventLoop");


process.nextTick(() => console.log("Microtask 1"));
process.nextTick(() => console.log("Microtask 2"));

setTimeout(() => console.log("Timer Task"), 0);


const intervalHandle = setInterval(() => console.log("Interval Task"), 500);
setTimeout(() => clearInterval(intervalHandle), 2000);


setImmediate(() => console.log("Immediate Task"));
close(() => console.log("Close Callback"));


fs.readFile("./example.txt", (err, data) => {
    if (err) console.error(err);
    else console.log(data);
});


start(['timer',"check","microtask","close","io",]);


stop();
