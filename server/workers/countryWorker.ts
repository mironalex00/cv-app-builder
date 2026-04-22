import { parentPort, workerData } from 'node:worker_threads';

import { transformCountryData } from '../shared/location/location.helpers.ts';

try {

    const rawContent = workerData;
    let contentStr: string;

    if (rawContent instanceof ArrayBuffer || ArrayBuffer.isView(rawContent)) {
        contentStr = Buffer.from(rawContent as ArrayBuffer | ArrayBufferLike).toString('utf-8');
    } else {
        contentStr = String(rawContent);
    }
    const parsed = JSON.parse(contentStr);

    if (!Array.isArray(parsed)) {
        throw new TypeError('Invalid countries JSON: root must be an array');
    }

    if (parentPort) {
        parentPort.postMessage(transformCountryData(parsed));
    } else {
        console.error('Worker thread error: No parentPort available.');
    }
} catch (err) {
    if (parentPort) {
        parentPort.postMessage({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}