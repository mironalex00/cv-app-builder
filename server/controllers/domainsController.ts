import isEmail from 'validator/lib/isEmail.js'
import { Request, Response } from 'express'

import { isDisposableDomain } from '../services/domainService.js'
import { sendBadRequest, sendSuccess } from '../common.js'

export async function validateEmail(req: Request, res: Response) {
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