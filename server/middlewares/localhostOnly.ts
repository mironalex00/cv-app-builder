import { NextFunction, Request, Response } from 'express';
import { sendForbidden } from '../common.js';

export default function localhostOnly(req: Request, res: Response, next: NextFunction): void {
    const remoteAddress = req.socket.remoteAddress;

    const isLocalhost =
        remoteAddress === '127.0.0.1' ||
        remoteAddress === '::1' ||
        remoteAddress === '::ffff:127.0.0.1';

    if (!isLocalhost) {
        console.warn(`[Security] Blocked external access attempt to Swagger UI from: ${remoteAddress}`);
        return sendForbidden(res, 'Forbidden: Access limited to development environment');
    }

    next();
};