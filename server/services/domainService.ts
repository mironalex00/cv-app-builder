import { DATA_DIR } from '../common.js';
import DataSourceServiceBuilder, { type DataSourceService } from '../utils/serviceBuilder.js';

// ============================================================================
// Path & URL Configuration
// ============================================================================
const DATA_FILE = 'domains.json';
const GITHUB_SOURCE = 'https://raw.githubusercontent.com'
const BLOCK_LIST_REPO = 'disposable-email-domains/disposable-email-domains/master'
const BLOCK_LIST_FILE = 'disposable_email_blocklist.conf'
const SOURCE_URL = `${GITHUB_SOURCE}/${BLOCK_LIST_REPO}/${BLOCK_LIST_FILE}`;

// ============================================================================
// Service‑Specific Parser
// ============================================================================
function parseDomainBlocklist(content: string): string[] {
    const length = content.length;
    const estimatedDomainCount = Math.floor(length / 20);
    const domains: string[] = new Array(estimatedDomainCount);

    let writeIndex = 0;
    let lineStart = 0;
    let lineEnd = 0;

    while (lineEnd < length) {
        lineEnd = content.indexOf('\n', lineStart);
        if (lineEnd === -1) {
            lineEnd = length;
        }

        let lineContentEnd = lineEnd;
        if (lineContentEnd > lineStart && content.charCodeAt(lineContentEnd - 1) === 13) { // '\r'
            lineContentEnd--;
        }

        const lineLength = lineContentEnd - lineStart;
        if (lineLength > 0) {
            const firstChar = content.charCodeAt(lineStart);
            if (firstChar !== 35 && firstChar !== 45) {

                let hasInvalidChar = false;
                for (let i = lineStart; i < lineContentEnd; i++) {
                    const ch = content.charCodeAt(i);
                    if (ch === 32 || ch === 58) {
                        hasInvalidChar = true;
                        break;
                    }
                }
                if (!hasInvalidChar && lineLength >= 4) {
                    if (
                        content.charCodeAt(lineStart) === 104 && // 'h'
                        content.charCodeAt(lineStart + 1) === 116 && // 't'
                        content.charCodeAt(lineStart + 2) === 116 && // 't'
                        content.charCodeAt(lineStart + 3) === 112 // 'p'
                    ) {
                        hasInvalidChar = true;
                    }
                }
                if (!hasInvalidChar) {
                    const domain = content.substring(lineStart, lineContentEnd);
                    domains[writeIndex] = domain;
                    writeIndex++;
                }
            }
        }

        lineStart = lineEnd + 1;
    }

    domains.length = writeIndex;
    return domains;
}

// ============================================================================
// Service Instance (Module Singleton)
// ============================================================================
const domainDataSource: DataSourceService<string> = new DataSourceServiceBuilder<string>()
    .withDataDir(DATA_DIR)
    .withFilename(DATA_FILE)
    .withSourceUrl(SOURCE_URL)
    .withParser(parseDomainBlocklist)
    .withNormalizer((domain) => domain.toLowerCase())
    .withRequestConfig({
        timeout: 30_000, // 30 seconds
        responseType: 'text',
        validateStatus: (status) => status === 200,
        maxContentLength: 10 * 1024 * 1024,
    })
    .build();

// ============================================================================
// Public API
// ============================================================================
export const domainCount = (): number => domainDataSource.size;
export const getDomainServiceState = domainDataSource.getState.bind(domainDataSource);
export const initDomainService = domainDataSource.initialize.bind(domainDataSource);
export const updateDomainsFromSource = domainDataSource.update.bind(domainDataSource);

export function isDisposableDomain(domain: string): boolean {
    if (!domain || typeof domain !== 'string') return false;
    return domainDataSource.has(domain);
}