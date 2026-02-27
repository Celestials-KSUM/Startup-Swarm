import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
    name: string;
    className?: string;
    size?: number | string;
    strokeWidth?: number;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, size, strokeWidth }) => {
    const IconComponent = (LucideIcons as any)[name];

    if (!IconComponent) {
        // Return a default icon if the name doesn't match
        return <LucideIcons.HelpCircle className={className} size={size} strokeWidth={strokeWidth} />;
    }

    return <IconComponent className={className} size={size} strokeWidth={strokeWidth} />;
};

export default DynamicIcon;
