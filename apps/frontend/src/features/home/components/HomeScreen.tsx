import { MessageSquare, Smile } from 'lucide-react';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import { FeatureTile } from './FeatureTile';

/**
 * Home screen with feature tiles for navigation
 */
export function HomeScreen() {
  const { navigateTo } = useNavigationStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Bienvenue sur Teach</h1>
          <p className="text-muted-foreground">
            Choisissez comment vous souhaitez pratiquer votre anglais aujourd'hui
          </p>
        </div>

        {/* Feature Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureTile
            title="Jeu des émojis"
            description="Testez votre vocabulaire en devinant les mots à partir des émojis. Amusant et interactif!"
            icon={Smile}
            onClick={() => navigateTo('game')}
          />
          <FeatureTile
            title="Pratique de conversation"
            description="Conversez avec une IA pour améliorer votre anglais à votre niveau avec des corrections en temps réel."
            icon={MessageSquare}
            onClick={() => navigateTo('chat')}
          />
        </div>
      </div>
    </div>
  );
}

