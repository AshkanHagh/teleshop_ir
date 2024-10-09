type TaskQueue<T> = { 
    data : T, 
    resolve : (result : T) => void, 
    reject : (error : unknown) => void 
};

class WorkerPool<T> {
    workers : Worker[] = [];
    availableWorkers : Worker[] = [];
    taskQueue : TaskQueue<T>[] = [];
    workerTaskMap = new WeakMap<Worker, TaskQueue<T>>();

    constructor(numberWorkers : number, workerScript : string) {
        for (let i = 0; i < numberWorkers; i++) {
            const worker = new Worker(workerScript);
            this.setupWorker(worker);
        }
    }

    private setupWorker(worker : Worker) {
        worker.onmessage = (event : MessageEvent) => {
            const task = this.workerTaskMap.get(worker);
            this.workerTaskMap.delete(worker);

            if (task) {
                if (event.data.error) {
                    task.reject(new Error(event.data.error));
                } else {
                    task.resolve(event.data.result);
                }
            }
            
            this.availableWorkers.push(worker);
            this.runNextTask();
        };

        worker.onerror = (error) => {
            const task = this.workerTaskMap.get(worker);
            this.workerTaskMap.delete(worker);
            if (task) task.reject(error);
        };

        this.workers.push(worker);
        this.availableWorkers.push(worker);
    }

    async runWorker(data : T) : Promise<unknown> {
        return new Promise((resolve, reject) => {
            if (this.availableWorkers.length > 0) {
                const worker = this.availableWorkers.pop()!;
                this.executeTask(worker, { data, resolve, reject });
            } else {
                this.taskQueue.push({ data, resolve, reject });
            }
        });
    }

    private runNextTask() {
        if (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
            const nextTask = this.taskQueue.shift()!;
            const worker = this.availableWorkers.pop()!;
            this.executeTask(worker, nextTask);
        }
    }

    private executeTask(worker : Worker, task : TaskQueue<T>) {
        this.workerTaskMap.set(worker, task);
        worker.postMessage(task.data);
    }

    terminateAll() {
        this.workers.forEach(worker => worker.terminate());
    }
}

export default WorkerPool;