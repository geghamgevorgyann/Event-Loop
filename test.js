function test(cb) {
  cb()
}


const tasks = [
test(() =>setInterval(() => console.log("Task 1"), 1000)),
test(() =>setTimeout(() => console.log("Task 2")),1000),
test(() =>proccess.nextTicks(() => console.log("Task 3")))
]
tasks.forEach(task => task())