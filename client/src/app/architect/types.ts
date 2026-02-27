export interface FormData {
    startup_name: string;
    idea_description: string;
    problem_statement: string;
    target_users: string;
    business_model_type: string;
    startup_category: string;
    product_type: string;
    mvp_features: string[];
    current_stage: string;
    uses_ai: boolean | null;
    collects_user_data: boolean | null;
    data_types: string[];
    competitors: string[];
    no_competitors: boolean;
    spoken_to_users: boolean | null;
    user_interviews_count: string;
    traction_users: string;
    traction_waitlist: string;
    traction_revenue: string;
    founders_count: number;
    has_tech_cofounder: boolean | null;
    previous_experience: string;
    team_size: string;
    pitch_deck: File | null;
    website_url: string;
    demo_link: string;
    github_repo: string;
    demo_video: string;
    financial_projections: File | null;
}

export const INITIAL: FormData = {
    startup_name: '',
    idea_description: '',
    problem_statement: '',
    target_users: '',
    business_model_type: '',
    startup_category: '',
    product_type: '',
    mvp_features: [],
    current_stage: '',
    uses_ai: null,
    collects_user_data: null,
    data_types: [],
    competitors: [],
    no_competitors: false,
    spoken_to_users: null,
    user_interviews_count: '',
    traction_users: '',
    traction_waitlist: '',
    traction_revenue: '',
    founders_count: 1,
    has_tech_cofounder: null,
    previous_experience: '',
    team_size: '',
    pitch_deck: null,
    website_url: '',
    demo_link: '',
    github_repo: '',
    demo_video: '',
    financial_projections: null,
};

export const SECTIONS_META = [
    { id: 1, title: 'Identity' },
    { id: 2, title: 'Problem' },
    { id: 3, title: 'Market' },
    { id: 4, title: 'Category' },
    { id: 5, title: 'Team' },
    { id: 6, title: 'Resources' },
];
