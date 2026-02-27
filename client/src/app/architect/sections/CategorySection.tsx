'use client';
import { LayoutGrid } from 'lucide-react';
import FieldGroup from '../components/FieldGroup';
import SectionCard from '../components/SectionCard';
import ChipSelect from '../components/ChipSelect';
import { type FormData } from '../types';

interface Props {
    data: Pick<FormData, 'startup_category' | 'product_type'>;
    errors: Record<string, string>;
    set: (k: keyof FormData, v: any) => void;
    onFocus: () => void;
}

const CATEGORIES = [
    'SaaS', 'EdTech', 'FinTech', 'HealthTech', 'AgriTech', 'E-Commerce', 'AI/ML', 'CleanTech', 'DeepTech'
];

const PRODUCT_TYPES = [
    'Web App', 'Mobile App', 'Desktop App', 'API/Headless', 'Service-Based', 'Hardware'
];

export default function CategorySection({ data, errors, set, onFocus }: Props) {
    return (
        <SectionCard num={4} title="Category" icon={<LayoutGrid className="w-5 h-5" />}
            desc="Ecosystem classification." onFocus={onFocus}>

            <FieldGroup label="Startup Category" required error={errors.startup_category}>
                <ChipSelect
                    options={CATEGORIES}
                    selected={data.startup_category}
                    onChange={v => set('startup_category', v)}
                />
            </FieldGroup>

            <FieldGroup label="Product Type" required error={errors.product_type}>
                <ChipSelect
                    options={PRODUCT_TYPES}
                    selected={data.product_type}
                    onChange={v => set('product_type', v)}
                />
            </FieldGroup>
        </SectionCard>
    );
}
