import type { Request, Response } from 'express'
import isEmail from 'validator/lib/isEmail.js'

import { domainCount, getDomainServiceState, isDisposableDomain } from '../../services/domainService.js'

import { sendBadRequest, sendSuccess } from '../../shared/http/response.js';

async function validateEmail(req: Request, res: Response) {
    if (!req.body || typeof req.body !== 'object') {
        return sendBadRequest(res, 'Invalid request body');
    }

    const email = req.body.email;
    if (!email || typeof email !== 'string') {
        return sendBadRequest(res, 'Email is required and must be a string');
    }
    if (email.length > 254) {
        return sendBadRequest(res, 'Email exceeds maximum length');
    }
    if (!isEmail(email)) {
        return sendBadRequest(res, 'Invalid email format');
    }

    const domain = email.split('@')[1].toLowerCase()
    if (isDisposableDomain(domain)) {
        return sendBadRequest(res, 'Disposable email addresses are not allowed');
    }

    return sendSuccess(res, { valid: true });
}

async function blocklistSize(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { count: domainCount() });
};

async function domainServiceStatus(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, getDomainServiceState());
};

export default {
    blocklistSize,
    domainServiceStatus,
    validateEmail,
} as const;