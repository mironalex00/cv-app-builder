export interface JobTitleSuggestion {
    title: string;
    uuid?: string;
    importance?: number;
    category?: string;
}

const FALLBACK_TITLES: string[] = [
    // Tecnología
    'Desarrollador Frontend', 'Desarrollador Backend', 'Desarrollador Full Stack',
    'DevOps Engineer', 'Data Scientist', 'Machine Learning Engineer',
    'Cloud Architect', 'Cybersecurity Analyst', 'IT Project Manager',
    'Scrum Master', 'Product Owner', 'QA Engineer', 'UX/UI Designer',
    'Ingeniero de Software', 'Arquitecto de Soluciones', 'Administrador de Bases de Datos',
    'Analista de Sistemas', 'Especialista en Ciberseguridad', 'Desarrollador Mobile',
    // Marketing y Ventas
    'Marketing Digital', 'SEO Specialist', 'Content Creator', 'Social Media Manager',
    'Brand Manager', 'Sales Representative', 'Account Executive', 'Business Development Manager',
    'Community Manager', 'Especialista en Email Marketing', 'Analista de Mercado',
    // Finanzas y Administración
    'Financial Analyst', 'Accountant', 'Controller', 'HR Generalist',
    'Recruiter', 'Office Manager', 'Executive Assistant', 'Payroll Specialist',
    // Salud
    'Médico', 'Enfermero/a', 'Psicólogo/a', 'Fisioterapeuta', 'Nutricionista',
    // Educación
    'Profesor/a', 'Investigador/a', 'Formador/a', 'Coordinador Académico',
    // Legal
    'Abogado/a', 'Asesor Jurídico', 'Notario/a',
    // Creativo
    'Diseñador Gráfico', 'Diseñador de Producto', 'Ilustrador/a', 'Fotógrafo/a',
    // Ingeniería
    'Ingeniero Civil', 'Ingeniero Mecánico', 'Ingeniero Eléctrico', 'Ingeniero Industrial',
    // Otros
    'Consultor/a', 'Coach Profesional', 'Emprendedor/a', 'Asistente Virtual',
];

export const getJobTitleSuggestions = async (query: string): Promise<JobTitleSuggestion[]> => {
    if (query.length < 2) return [];

    try {
        const str = encodeURIComponent(query);
        const response = await fetch(
            `http://api.dataatwork.org/v1/jobs/autocomplete?begins_with=${str}&contains=${str}&ends_with=${str}`
        );

        if (!response.ok) {
            throw new Error('Error en la API');
        }

        const data = await response.json();

        const suggestions: JobTitleSuggestion[] = data.map((item: { suggestion: string; uuid?: string }) => ({
            title: item.suggestion,
            uuid: item.uuid,
        })).slice(0, 20);

        if (suggestions.length > 0) {
            return suggestions;
        }

        return getFallbackSuggestions(query);
    } catch {
        return getFallbackSuggestions(query);
    }
};

const getFallbackSuggestions = (query: string): JobTitleSuggestion[] => {
    const lowerQuery = query.toLowerCase();
    return FALLBACK_TITLES.filter(title =>
        title.toLowerCase().includes(lowerQuery)
    )
        .slice(0, 15)
        .map(title => ({ title }));
};