'use client';
import { SKILL_CATEGORIES } from '@/lib/skills-data';
import { useTranslations } from 'next-intl';

type Props = {
  selected: Set<string>;
  onToggle: (move: string) => void;
};

export function SkillsChecklist({ selected, onToggle }: Props) {
  const t = useTranslations('profile');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-100">{t('skills')}</h3>
      {SKILL_CATEGORIES.map((category) => (
        <div key={category.id} className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-400">{category.label}</h4>
          <div className="flex flex-wrap gap-2">
            {category.moves.map((move) => {
              const isSelected = selected.has(move);
              return (
                <button
                  key={move}
                  type="button"
                  onClick={() => onToggle(move)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border border-brand bg-brand text-brand-foreground'
                      : 'border border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  {move}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
