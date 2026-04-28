
import type { Request } from 'express';
import type { ParamNameList } from '../../common';

export function getParam(req: Request, name: string): string | undefined {
    const value = req.params[name];
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
    }
    return undefined;
}
export function getParamFirst(req: Request, paramNames: ParamNameList): string | undefined {
    for (let index = 0; index < paramNames.length; index += 1) {
        const value = getParam(req, paramNames[index]);
        if (value) {
            return value;
        }
    }
    return undefined;
}