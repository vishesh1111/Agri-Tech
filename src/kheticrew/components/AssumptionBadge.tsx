import React from 'react';
import { useStore, useTranslation } from '../store/useStore';
import { Assumptions } from '../lib/types';
import { Info } from 'lucide-react';

interface Props {
  assumptionKey?: keyof Assumptions;
  customText?: string;
  className?: string;
}

export const AssumptionBadge: React.FC<Props> = ({
  assumptionKey,
  customText,
  className = '',
}) => {
  const setActiveTab = useStore((state) => state.setActiveTab);
  const t = useTranslation();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('settings');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={t.app.assumptionTooltip}
      aria-label={`Assumption parameter: ${assumptionKey || customText || 'tagged'}. Click to inspect and edit.`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer min-h-[26px] ${className}`}
    >
      <Info className="w-3 h-3 text-amber-700 shrink-0" aria-hidden="true" />
      <span>{customText || t.app.assumptionTag}</span>
    </button>
  );
};
