import { useState, useEffect, useCallback } from 'react';
import { VERSE_LEVELS, VerseLevel } from './data/verses';
import { CharacterId } from './data/characters';
import { AchievementDefinition, getUnlockedAchievements } from './data/achievements';
import {
  SaveData,
  getCompletedCount,
  getTotalStars,
  loadSaveData,
  persistSaveData,
} from './utils/storage';
import { sound } from './utils/audio';
import { TitleScreen } from './components/TitleScreen';
import { WorldMap } from './components/WorldMap';
import { GardenView } from './components/GardenView';
import { GameplayView } from './components/GameplayView';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { PictureModeView } from './components/PictureModeView';

type AppScreen =
  | 'TITLE_MENU'
  | 'WORLD_MAP'
  | 'GARDEN_VIEW'
  | 'PLAYING'
  | 'ROUND_SUMMARY'
  | 'PICTURE_MODE';

interface LastSummary {
  level: VerseLevel;
  stars: number;
  seedsEarned: number;
  accuracy: number;
  isNewUnlock: boolean;
  newlyUnlockedAchievements: AchievementDefinition[];
}

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSaveData());
  const [screen, setScreen] = useState<AppScreen>('TITLE_MENU');
  const [activeLevel, setActiveLevel] = useState<VerseLevel>(VERSE_LEVELS[0]);
  const [playInstanceKey, setPlayInstanceKey] = useState(0);
  const [lastSummary, setLastSummary] = useState<LastSummary | null>(null);

  useEffect(() => {
    sound.setMuted(save.muted);
    sound.setMusicEnabled(save.musicEnabled);
    persistSaveData(save);
  }, [save]);

  useEffect(() => {
    if (screen === 'PLAYING' || screen === 'PICTURE_MODE') {
      sound.setMusicMood('play');
    } else if (screen === 'ROUND_SUMMARY') {
      sound.setMusicMood('victory');
    } else {
      sound.setMusicMood('menu');
    }
  }, [screen]);

  useEffect(() => {
    const startOnFirstGesture = () => {
      sound.unlockAndStartMusic();
    };
    window.addEventListener('pointerdown', startOnFirstGesture, { once: true });
    window.addEventListener('keydown', startOnFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startOnFirstGesture);
      window.removeEventListener('keydown', startOnFirstGesture);
    };
  }, []);

  const handleChangeCharacter = useCallback((characterId: CharacterId) => {
    sound.playPop();
    setSave((prev) => ({ ...prev, characterId }));
  }, []);

  const handleToggleMute = useCallback(() => {
    setSave((prev) => {
      const nextMuted = !prev.muted;
      sound.setMuted(nextMuted);
      if (!nextMuted) {
        sound.playTap();
      }
      return { ...prev, muted: nextMuted };
    });
  }, []);

  const handleToggleMusic = useCallback(() => {
    setSave((prev) => {
      const nextMusic = !prev.musicEnabled;
      sound.setMusicEnabled(nextMusic);
      sound.playTap();
      return { ...prev, musicEnabled: nextMusic };
    });
  }, []);

  const handleTogglePracticeAll = useCallback(() => {
    sound.playTap();
    setSave((prev) => ({
      ...prev,
      unlockedAllPractice: !prev.unlockedAllPractice,
    }));
  }, []);

  const handleSelectLevel = useCallback((level: VerseLevel) => {
    sound.playTap();
    setActiveLevel(level);
    setPlayInstanceKey((k) => k + 1);
    setScreen('PLAYING');
  }, []);

  const handleLevelComplete = useCallback(
    (stars: number, seedsEarned: number, accuracy: number) => {
      const prevUnlockedIds = new Set(getUnlockedAchievements(save).map((a) => a.id));
      const prevProgress = save.completedLevels[activeLevel.id];
      const isNewUnlock = !prevProgress;

      const existing = save.completedLevels[activeLevel.id];
      const nextSave: SaveData = {
        ...save,
        totalSeeds: save.totalSeeds + seedsEarned,
        completedLevels: {
          ...save.completedLevels,
          [activeLevel.id]: {
            stars: existing ? Math.max(existing.stars, stars) : stars,
            bestAccuracy: existing ? Math.max(existing.bestAccuracy, accuracy) : accuracy,
            completedAt: Date.now(),
          },
        },
      };

      const newlyUnlockedAchievements = getUnlockedAchievements(nextSave).filter(
        (a) => !prevUnlockedIds.has(a.id)
      );

      setSave(nextSave);
      setLastSummary({
        level: activeLevel,
        stars,
        seedsEarned,
        accuracy,
        isNewUnlock,
        newlyUnlockedAchievements,
      });
      setScreen('ROUND_SUMMARY');
    },
    [activeLevel, save]
  );

  const handleCompletePictureLevel = useCallback(
    (levelId: string, stars: number, seedsEarned: number) => {
      setSave((prev) => {
        const existing = prev.completedPictureLevels[levelId];
        return {
          ...prev,
          totalSeeds: prev.totalSeeds + seedsEarned,
          completedPictureLevels: {
            ...prev.completedPictureLevels,
            [levelId]: {
              stars: existing ? Math.max(existing.stars, stars) : stars,
              bestAccuracy: 100,
              completedAt: Date.now(),
            },
          },
        };
      });
    },
    []
  );

  const nextLevel =
    lastSummary &&
    VERSE_LEVELS.find((l) => l.levelNumber === lastSummary.level.levelNumber + 1);

  if (screen === 'TITLE_MENU') {
    return (
      <TitleScreen
        save={save}
        characterId={save.characterId}
        onChangeCharacter={handleChangeCharacter}
        muted={save.muted}
        onToggleMute={handleToggleMute}
        musicEnabled={save.musicEnabled}
        onToggleMusic={handleToggleMusic}
        totalStars={getTotalStars(save)}
        maxStars={VERSE_LEVELS.length * 3}
        completedCount={getCompletedCount(save)}
        totalLevels={VERSE_LEVELS.length}
        onStart={() => {
          sound.playTap();
          setScreen('WORLD_MAP');
        }}
        onStartPictureMode={() => {
          sound.playTap();
          setScreen('PICTURE_MODE');
        }}
        onOpenGarden={() => {
          sound.playTap();
          setScreen('GARDEN_VIEW');
        }}
      />
    );
  }

  if (screen === 'PICTURE_MODE') {
    return (
      <PictureModeView
        save={save}
        characterId={save.characterId}
        muted={save.muted}
        onToggleMute={handleToggleMute}
        musicEnabled={save.musicEnabled}
        onToggleMusic={handleToggleMusic}
        onBackToMenu={() => setScreen('TITLE_MENU')}
        onCompletePictureLevel={handleCompletePictureLevel}
      />
    );
  }

  if (screen === 'WORLD_MAP') {
    return (
      <WorldMap
        save={save}
        onSelectLevel={handleSelectLevel}
        onOpenGarden={() => {
          sound.playTap();
          setScreen('GARDEN_VIEW');
        }}
        onBackTitle={() => {
          sound.playTap();
          setScreen('TITLE_MENU');
        }}
        onChangeCharacter={handleChangeCharacter}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onTogglePracticeAll={handleTogglePracticeAll}
      />
    );
  }

  if (screen === 'GARDEN_VIEW') {
    return (
      <GardenView
        save={save}
        onBack={() => {
          sound.playTap();
          setScreen('WORLD_MAP');
        }}
        onPlayLevel={(lvl) => {
          const isUnlocked =
            save.unlockedAllPractice ||
            lvl.levelNumber === 1 ||
            Boolean(
              save.completedLevels[
                VERSE_LEVELS.find((v) => v.levelNumber === lvl.levelNumber - 1)?.id ?? ''
              ]
            );
          if (isUnlocked) {
            handleSelectLevel(lvl);
          } else {
            setScreen('WORLD_MAP');
          }
        }}
      />
    );
  }

  if (screen === 'PLAYING') {
    return (
      <GameplayView
        key={`${activeLevel.id}-${playInstanceKey}`}
        level={activeLevel}
        characterId={save.characterId}
        muted={save.muted}
        onToggleMute={handleToggleMute}
        musicEnabled={save.musicEnabled}
        onToggleMusic={handleToggleMusic}
        onExitToMap={() => setScreen('WORLD_MAP')}
        onLevelComplete={handleLevelComplete}
      />
    );
  }

  if (screen === 'ROUND_SUMMARY' && lastSummary) {
    return (
      <RoundSummaryModal
        level={lastSummary.level}
        characterId={save.characterId}
        stars={lastSummary.stars}
        seedsEarned={lastSummary.seedsEarned}
        accuracy={lastSummary.accuracy}
        isNewUnlock={lastSummary.isNewUnlock}
        newlyUnlockedAchievements={lastSummary.newlyUnlockedAchievements}
        hasNextLevel={Boolean(nextLevel)}
        onNextLevel={() => {
          if (nextLevel) {
            handleSelectLevel(nextLevel);
          }
        }}
        onReplay={() => handleSelectLevel(lastSummary.level)}
        onOpenGarden={() => {
          sound.playTap();
          setScreen('GARDEN_VIEW');
        }}
        onBackToMap={() => {
          sound.playTap();
          setScreen('WORLD_MAP');
        }}
      />
    );
  }

  return null;
}
