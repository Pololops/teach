import { ArrowLeft } from 'lucide-react';
import { Button } from './button';
import { useNavigationStore } from '@/shared/stores/navigationStore';

interface SectionLayoutProps {
  title: string;
  subtitle?: React.ReactNode;
  rightContent?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
}

/**
 * SectionLayout - Reusable layout wrapper for app sections
 * 
 * Provides consistent header with back button, title, and optional content slots.
 * Used across chat, game, and future sections for unified navigation experience.
 */
export function SectionLayout({
  title,
  subtitle,
  rightContent,
  onBack,
  children,
}: SectionLayoutProps) {
  const { navigateTo } = useNavigationStore();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigateTo('home');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Accueil
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {subtitle}
            </div>
          </div>
          {rightContent && (
            <div>
              {rightContent}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}

