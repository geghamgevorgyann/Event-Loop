class Promise {
    constructor(executor) {
        this.state = "pending"; // Initial state
        this.value = undefined; // Resolved value
        this.reason = undefined; // Rejected reason
        this.onFulfilledCallbacks = []; // Fulfillment handlers
        this.onRejectedCallbacks = []; // Rejection handlers

        const resolve = (value) => {
            if (this.state === "pending") {
                this.state = "fulfilled";
                this.value = value;
                this.onFulfilledCallbacks.forEach((cb) => cb(value)); // Execute success handlers immediately
            }
        };

        const reject = (reason) => {
            if (this.state === "pending") {
                this.state = "rejected";
                this.reason = reason;
                this.onRejectedCallbacks.forEach((cb) => cb(reason)); // Execute failure handlers immediately
            }
        };

        try {
            executor(resolve, reject); // Execute synchronously
        } catch (error) {
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        // Default handlers if not provided
        onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (value) => value;
        onRejected = typeof onRejected === "function" ? onRejected : (reason) => { throw reason; };

        if (this.state === "fulfilled") {
            const result = onFulfilled(this.value);
            return new Promise((resolve) => resolve(result));
        }

        if (this.state === "rejected") {
            const result = onRejected(this.reason);
            return new Promise((resolve, reject) => reject(result));
        }

        if (this.state === "pending") {
            return new Promise((resolve, reject) => {
                this.onFulfilledCallbacks.push((value) => {
                    const result = onFulfilled(value);
                    resolve(result);
                });

                this.onRejectedCallbacks.push((reason) => {
                    const result = onRejected(reason);
                    reject(result);
                });
            });
        }
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    finally(onFinally) {
        return this.then(
            (value) => {
                onFinally && onFinally();
                return value;
            },
            (reason) => {
                onFinally && onFinally();
                throw reason;
            }
        );
    }

    static resolve(value) {
        return new Promise((resolve) => resolve(value));
    }

    static reject(reason) {
        return new Promise((_, reject) => reject(reason));
    }
}

const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("Resolved Value!"), 1000);
});

promise.then((value) => {
    console.log(value); // Logs: "Resolved Value!" after 1 second
});

module.exports = {Promise}