import React from 'react';
import { StakeholderProfile } from '../../types/stakeholder';

interface StakeholderIconProps {
  stakeholder: StakeholderProfile;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * StakeholderIcon component displays the icon for a stakeholder
 * Icons are stored in public/icons/ directory
 */
export const StakeholderIcon: React.FC<StakeholderIconProps> = ({
  stakeholder,
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  // Map stakeholder IDs to icon file names
  const iconPath = `/icons/${stakeholder.id}.${stakeholder.id === 'regional-bodies' || stakeholder.id === 'development-partners' ? 'svg' : 'png'}`;

  return (
    <div
      className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}
      title={stakeholder.name}
    >
      <img
        src={iconPath}
        alt={`${stakeholder.name} icon`}
        className="w-full h-full object-contain"
        style={{
          filter: 'none', // Use original icon colors
        }}
      />
    </div>
  );
};
