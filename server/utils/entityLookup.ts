import { EntityLookup, SearchableEntity, SearchOptions } from "../common";

export function createEntityLookup<T extends SearchableEntity>(
    map: Map<string, T>,
    array: readonly T[]
): EntityLookup<T> {
    return function lookup(identifier: string, options: SearchOptions = {}): T | undefined {
        if (!identifier || typeof identifier !== 'string') {
            return undefined;
        }

        const { exact = true } = options;
        const lowerId = identifier.toLowerCase();

        if (exact) {
            return map.get(identifier) ?? map.get(lowerId);
        }

        for (let i = 0; i < array.length; i++) {
            const entity = array[i];
            const terms = entity.searchTerms;
            const termsLen = terms.length;
            for (let j = 0; j < termsLen; j++) {
                if (terms[j].includes(lowerId)) {
                    return entity;
                }
            }
        }

        return undefined;
    };
}