import type { FakeOrderSeedingWorkerData, KafkaGlobalTopics } from "@shared/types";
import { Worker } from "worker_threads";

type WorkerData = ({start: number, end: number, topic: KafkaGlobalTopics} | FakeOrderSeedingWorkerData)
export default (workerData: WorkerData, file: string) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(file, { workerData });
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    })
}