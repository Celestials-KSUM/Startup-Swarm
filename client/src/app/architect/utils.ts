import { type FormData } from './types';

export function calcStrength(form: FormData): number {
    let score = 0;
    let totalFields = 0;

    const weights: Record<string, number> = {
        startup_name: 5,
        idea_description: 10,
        problem_statement: 10,
        target_users: 10,
        business_model_type: 5,
        startup_category: 5,
        product_type: 5,
        mvp_features: 10,
        current_stage: 5,
        founders_count: 5,
        has_tech_cofounder: 5,
        previous_experience: 5,
        team_size: 5,
        spoken_to_users: 5,
        competition: 5,
        links: 5
    };

    if (form.startup_name) score += weights.startup_name;
    if (form.idea_description.length > 20) score += weights.idea_description;
    if (form.problem_statement.length > 20) score += weights.problem_statement;
    if (form.target_users.length > 10) score += weights.target_users;
    if (form.business_model_type) score += weights.business_model_type;
    if (form.startup_category) score += weights.startup_category;
    if (form.product_type) score += weights.product_type;
    if (form.mvp_features.length >= 3) score += weights.mvp_features;
    if (form.current_stage) score += weights.current_stage;
    if (form.founders_count > 0) score += weights.founders_count;
    if (form.has_tech_cofounder !== null) score += weights.has_tech_cofounder;
    if (form.previous_experience) score += weights.previous_experience;
    if (form.team_size) score += weights.team_size;
    if (form.spoken_to_users !== null) score += weights.spoken_to_users;
    if (form.competitors.length > 0 || form.no_competitors) score += weights.competition;
    if (form.website_url || form.demo_link) score += weights.links;

    return Math.min(100, score);
}

export function strengthMeta(pct: number) {
    if (pct < 30) return { label: 'Incomplete', color: '#EF4444' };
    if (pct < 60) return { label: 'Improving', color: '#F59E0B' };
    if (pct < 85) return { label: 'Strong', color: '#10B981' };
    return { label: 'Excellent', color: '#2563EB' };
}
