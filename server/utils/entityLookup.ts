import { EntityLookup, SearchableEntity, SearchOptions } from '../common.js';

export function createEntityLookup<T extends SearchableEntity>(
    map: Map<string, T>,
    array: readonly T[],
): EntityLookup<T> {
    return function lookup(identifier: string, options: SearchOptions = {}): T | undefined {
        if (!identifier || typeof identifier !== 'string') return undefined;

        const { exact = true } = options;
        const lowerId = identifier.toLowerCase();

        if (exact) {
            const fromMap = map.get(identifier) ?? map.get(lowerId);
            if (fromMap) return fromMap;

            for (let i = 0; i < array.length; i++) {
                const terms = array[i].searchTerms;
                for (let j = 0; j < terms.length; j++) {
                    if (terms[j].toLowerCase() === lowerId) return array[i];
                }
            }

            return undefined;
        }

        for (let i = 0; i < array.length; i++) {
            const terms = array[i].searchTerms;
            for (let j = 0; j < terms.length; j++) {
                if (terms[j].toLowerCase().includes(lowerId)) return array[i];
            }
        }

        return undefined;
    };
}