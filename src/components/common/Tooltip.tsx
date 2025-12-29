import React, { useState, useRef, useEffect } from 'react';
import { getTooltip } from '../../data/glossary';

export interface TooltipProps {
  /** The term key from glossary, OR custom content */
  content: string;
  /** Child element to wrap (the trigger) */
  children: React.ReactNode;
  /** Position of tooltip relative to trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether content is a glossary key (default) or custom text */
  isGlossaryKey?: boolean;
  /** Optional custom className for tooltip */
  className?: string;
}

/**
 * Tooltip Component
 *
 * Displays helpful explanations when hovering over technical terms.
 * Styled with IRENA colors and accessible keyboard navigation.
 *
 * Usage:
 * ```tsx
 * // With glossary key
 * <Tooltip content="renewable_share">
 *   <span>Renewable Share</span>
 * </Tooltip>
 *
 * // With custom content
 * <Tooltip content="Custom explanation here" isGlossaryKey={false}>
 *   <span>Custom Term</span>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  isGlossaryKey = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Get tooltip text from glossary or use custom content
  const tooltipText = isGlossaryKey ? getTooltip(content) : content;

  // Don't render if no content available
  if (!tooltipText) {
    return <>{children}</>;
  }

  // Adjust position if tooltip would go off-screen
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Check if tooltip goes off top
      if (position === 'top' && tooltipRect.top < 0) {
        setTooltipPosition('bottom');
      }
      // Check if tooltip goes off bottom
      else if (position === 'bottom' && tooltipRect.bottom > viewportHeight) {
        setTooltipPosition('top');
      }
      // Check if tooltip goes off left
      else if (position === 'left' && tooltipRect.left < 0) {
        setTooltipPosition('right');
      }
      // Check if tooltip goes off right
      else if (position === 'right' && tooltipRect.right > viewportWidth) {
        setTooltipPosition('left');
      }
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);
  const handleFocus = () => setIsVisible(true);
  const handleBlur = () => setIsVisible(false);

  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  // Arrow classes
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-irena-blue-dark',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-irena-blue-dark',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-irena-blue-dark',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-irena-blue-dark'
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Trigger element with visual indicator */}
      <span
        className="border-b border-dotted border-irena-blue cursor-help"
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </span>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-irena-blue-dark rounded-lg shadow-lg
            max-w-xs w-max pointer-events-none
            ${positionClasses[tooltipPosition]}
            ${className}
          `}
          style={{ minWidth: '200px', maxWidth: '300px' }}
        >
          {tooltipText}

          {/* Tooltip arrow */}
          <div
            className={`
              absolute w-0 h-0 border-4
              ${arrowClasses[tooltipPosition]}
            `}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Simplified Tooltip for inline use
 * Automatically applies glossary lookup
 */
export const Term: React.FC<{ term: string; children?: React.ReactNode }> = ({
  term,
  children
}) => {
  return (
    <Tooltip content={term} isGlossaryKey={true}>
      {children || term.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Tooltip>
  );
};

export default Tooltip;
