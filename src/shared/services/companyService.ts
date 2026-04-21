// Lista estática ampliada de empresas/instituciones (puedes ampliarla)
const COMPANY_SUGGESTIONS = [
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'SpaceX',
    'IBM', 'Oracle', 'Salesforce', 'Adobe', 'Intel', 'Cisco', 'Deloitte', 'PwC',
    'Accenture', 'McKinsey & Company', 'BCG', 'Bain & Company', 'Goldman Sachs',
    'JPMorgan Chase', 'Banco Santander', 'BBVA', 'CaixaBank', 'Telefónica',
    'Inditex', 'Mercadona', 'Repsol', 'Iberdrola', 'Endesa', 'Universidad Complutense',
    'Universidad Politécnica', 'Harvard University', 'MIT', 'Stanford University',
    'Hospital Universitario', 'Clínica Mayo', 'Freelance', 'Autónomo',
];

export const getCompanySuggestions = (query: string): string[] => {
    if (query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return COMPANY_SUGGESTIONS.filter(name =>
        name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
};