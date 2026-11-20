export type SceneIconKey =
  | 'dawn'
  | 'creator-hands'
  | 'sky-clouds'
  | 'earth-garden'
  | 'seed-sprout'
  | 'bright-sun'
  | 'happy-kids'
  | 'warm-heart'
  | 'helping-hands'
  | 'shepherd-lamb'
  | 'green-pasture'
  | 'sparkling-path'
  | 'open-door'
  | 'joy-music'
  | 'lamp-feet'
  | 'bible-glow'
  | 'gift-box'
  | 'tree-eternal'
  | 'shoe-distractor'
  | 'cake-distractor'
  | 'umbrella-distractor'
  | 'balloon-distractor';

export interface PictureScene {
  id: string;
  iconKey: SceneIconKey;
  spokenPhrase: string;
}

export interface PictureLevel {
  id: string;
  levelNumber: number;
  reference: string;
  citation: string;
  fullSpokenVerse: string;
  coverIcon: SceneIconKey;
  scenes: PictureScene[];
  questionPrompt: string;
  targetSceneId: string;
  distractorIcons: SceneIconKey[];
}

export const PICTURE_LEVELS: PictureLevel[] = [
  {
    id: 'pic-gen-1-1',
    levelNumber: 1,
    reference: 'Génesis 1:1',
    citation: 'Génesis, capítulo 1, versículo 1.',
    fullSpokenVerse:
      'Génesis, capítulo 1, versículo 1. En el principio creó Dios los cielos y la tierra.',
    coverIcon: 'earth-garden',
    scenes: [
      { id: 'gen-1', iconKey: 'dawn', spokenPhrase: 'En el principio' },
      { id: 'gen-2', iconKey: 'creator-hands', spokenPhrase: 'creó Dios' },
      { id: 'gen-3', iconKey: 'sky-clouds', spokenPhrase: 'los cielos' },
      { id: 'gen-4', iconKey: 'earth-garden', spokenPhrase: 'y la tierra.' },
    ],
    questionPrompt:
      'En el principio creó Dios los cielos y... ¿qué más creó Dios? Toca el dibujo de la tierra.',
    targetSceneId: 'gen-4',
    distractorIcons: ['shoe-distractor', 'cake-distractor'],
  },
  {
    id: 'pic-jhn-1-4',
    levelNumber: 2,
    reference: 'Juan 1:4',
    citation: 'Juan, capítulo 1, versículo 4.',
    fullSpokenVerse:
      'Juan, capítulo 1, versículo 4. En Él estaba la vida, y la vida era la luz de los hombres.',
    coverIcon: 'bright-sun',
    scenes: [
      { id: 'jhn14-1', iconKey: 'seed-sprout', spokenPhrase: 'En Él estaba la vida,' },
      { id: 'jhn14-2', iconKey: 'bright-sun', spokenPhrase: 'y la vida era la luz' },
      { id: 'jhn14-3', iconKey: 'happy-kids', spokenPhrase: 'de los hombres.' },
    ],
    questionPrompt:
      'La vida de Jesús brilla muy fuerte. Toca el dibujo de la luz brillante.',
    targetSceneId: 'jhn14-2',
    distractorIcons: ['umbrella-distractor', 'shoe-distractor'],
  },
  {
    id: 'pic-1jn-4-8',
    levelNumber: 3,
    reference: '1 Juan 4:8',
    citation: 'Primera de Juan, capítulo 4, versículo 8.',
    fullSpokenVerse:
      'Primera de Juan, capítulo 4, versículo 8. El que no ama, no ha conocido a Dios; porque Dios es amor.',
    coverIcon: 'warm-heart',
    scenes: [
      { id: '1jn-1', iconKey: 'helping-hands', spokenPhrase: 'El que no ama, no ha conocido a Dios;' },
      { id: '1jn-2', iconKey: 'creator-hands', spokenPhrase: 'porque Dios' },
      { id: '1jn-3', iconKey: 'warm-heart', spokenPhrase: 'es amor.' },
    ],
    questionPrompt:
      'La Biblia dice que Dios es amor. Toca el dibujo del corazón lleno de amor.',
    targetSceneId: '1jn-3',
    distractorIcons: ['balloon-distractor', 'cake-distractor'],
  },
  {
    id: 'pic-psa-23-1',
    levelNumber: 4,
    reference: 'Salmos 23:1',
    citation: 'Salmos, capítulo 23, versículo 1.',
    fullSpokenVerse:
      'Salmos, capítulo 23, versículo 1. Jehová es mi Pastor; nada me faltará.',
    coverIcon: 'shepherd-lamb',
    scenes: [
      { id: 'psa23-1', iconKey: 'shepherd-lamb', spokenPhrase: 'Jehová es mi Pastor;' },
      { id: 'psa23-2', iconKey: 'green-pasture', spokenPhrase: 'nada me' },
      { id: 'psa23-3', iconKey: 'happy-kids', spokenPhrase: 'faltará.' },
    ],
    questionPrompt:
      'Jehová es nuestro buen Pastor que cuida a sus ovejitas. Toca el dibujo del pastor con la oveja.',
    targetSceneId: 'psa23-1',
    distractorIcons: ['umbrella-distractor', 'shoe-distractor'],
  },
  {
    id: 'pic-jhn-14-6',
    levelNumber: 5,
    reference: 'Juan 14:6',
    citation: 'Juan, capítulo 14, versículo 6.',
    fullSpokenVerse:
      'Juan, capítulo 14, versículo 6. Jesús le dijo: Yo soy el camino, y la realidad, y la vida.',
    coverIcon: 'sparkling-path',
    scenes: [
      { id: 'jhn146-1', iconKey: 'sparkling-path', spokenPhrase: 'Jesús le dijo: Yo soy el camino,' },
      { id: 'jhn146-2', iconKey: 'bible-glow', spokenPhrase: 'y la realidad,' },
      { id: 'jhn146-3', iconKey: 'seed-sprout', spokenPhrase: 'y la vida.' },
    ],
    questionPrompt:
      'Jesús dijo: Yo soy el camino. Toca el dibujo del camino dorado.',
    targetSceneId: 'jhn146-1',
    distractorIcons: ['cake-distractor', 'balloon-distractor'],
  },
  {
    id: 'pic-php-4-4',
    levelNumber: 6,
    reference: 'Filipenses 4:4',
    citation: 'Filipenses, capítulo 4, versículo 4.',
    fullSpokenVerse:
      'Filipenses, capítulo 4, versículo 4. Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!',
    coverIcon: 'joy-music',
    scenes: [
      { id: 'php44-1', iconKey: 'joy-music', spokenPhrase: 'Regocijaos en el Señor' },
      { id: 'php44-2', iconKey: 'bright-sun', spokenPhrase: 'siempre.' },
      { id: 'php44-3', iconKey: 'happy-kids', spokenPhrase: 'Otra vez digo: ¡Regocijaos!' },
    ],
    questionPrompt:
      'Estemos muy alegres cantando al Señor. Toca el dibujo de la música alegre.',
    targetSceneId: 'php44-1',
    distractorIcons: ['shoe-distractor', 'umbrella-distractor'],
  },
  {
    id: 'pic-psa-119-105',
    levelNumber: 7,
    reference: 'Salmos 119:105',
    citation: 'Salmos, capítulo 119, versículo 105.',
    fullSpokenVerse:
      'Salmos, capítulo 119, versículo 105. Lámpara es a mis pies Tu palabra, y lumbrera a mi camino.',
    coverIcon: 'lamp-feet',
    scenes: [
      { id: 'psa119-1', iconKey: 'lamp-feet', spokenPhrase: 'Lámpara es a mis pies' },
      { id: 'psa119-2', iconKey: 'bible-glow', spokenPhrase: 'Tu palabra,' },
      { id: 'psa119-3', iconKey: 'sparkling-path', spokenPhrase: 'y lumbrera a mi camino.' },
    ],
    questionPrompt:
      'La Palabra de Dios alumbra nuestros pasos. Toca el dibujo de la lámpara alumbrando los pies.',
    targetSceneId: 'psa119-1',
    distractorIcons: ['cake-distractor', 'balloon-distractor'],
  },
  {
    id: 'pic-jhn-3-16',
    levelNumber: 8,
    reference: 'Juan 3:16',
    citation: 'Juan, capítulo 3, versículo 16.',
    fullSpokenVerse:
      'Juan, capítulo 3, versículo 16. Porque de tal manera amó Dios al mundo, que ha dado a Su Hijo unigénito, para que todo aquel que en Él cree, no perezca, mas tenga vida eterna.',
    coverIcon: 'tree-eternal',
    scenes: [
      { id: 'jhn316-1', iconKey: 'earth-garden', spokenPhrase: 'Porque de tal manera amó Dios al mundo,' },
      { id: 'jhn316-2', iconKey: 'gift-box', spokenPhrase: 'que ha dado a Su Hijo unigénito,' },
      { id: 'jhn316-3', iconKey: 'warm-heart', spokenPhrase: 'para que todo aquel que en Él cree, no perezca,' },
      { id: 'jhn316-4', iconKey: 'tree-eternal', spokenPhrase: 'mas tenga vida eterna.' },
    ],
    questionPrompt:
      'Dios nos dio el regalo más grande de amor. Toca el dibujo de la caja de regalo.',
    targetSceneId: 'jhn316-2',
    distractorIcons: ['umbrella-distractor', 'shoe-distractor'],
  },
];
