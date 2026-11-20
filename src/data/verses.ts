export type RewardIconKey =
  | 'sun'
  | 'lamp'
  | 'heart'
  | 'staff'
  | 'key'
  | 'crown'
  | 'branch'
  | 'harp'
  | 'shield'
  | 'torch'
  | 'breath'
  | 'tree';

export interface VerseReward {
  id: string;
  name: string;
  description: string;
  iconKey: RewardIconKey;
  accentColor: string;
}

export interface VerseLevel {
  id: string;
  levelNumber: number;
  worldId: number;
  reference: string;
  verseText: string;
  kidNote: string;
  orderChunks: string[];
  blankWordsStep1: string[];
  blankWordsStep3: string[];
  distractors: string[];
  reward: VerseReward;
}

export interface WorldInfo {
  id: number;
  title: string;
  subtitle: string;
  themeColor: string;
}

export const WORLDS: WorldInfo[] = [
  {
    id: 1,
    title: 'La Creación y la Luz',
    subtitle: 'Primeros pasos en la Palabra',
    themeColor: '#1B4332',
  },
  {
    id: 2,
    title: 'Jesús, Nuestro Tesoro',
    subtitle: 'Conociendo quién es el Señor',
    themeColor: '#1E3A5F',
  },
  {
    id: 3,
    title: 'Creciendo en el Señor',
    subtitle: 'La vida diaria de los hijos de Dios',
    themeColor: '#5C3D2E',
  },
  {
    id: 4,
    title: 'La Palabra y el Fruto',
    subtitle: 'Tesoros eternos en tu corazón',
    themeColor: '#3B2F63',
  },
];

export const VERSE_LEVELS: VerseLevel[] = [
  {
    id: 'gen-1-1',
    levelNumber: 1,
    worldId: 1,
    reference: 'Génesis 1:1',
    verseText: 'En el principio creó Dios los cielos y la tierra.',
    kidNote: 'Antes de que existiera nada, Dios ya estaba allí y creó un mundo hermoso para nosotros.',
    orderChunks: ['En el principio', 'creó Dios', 'los cielos', 'y la tierra.'],
    blankWordsStep1: ['principio', 'Dios', 'tierra'],
    blankWordsStep3: ['principio', 'creó', 'cielos', 'tierra'],
    distractors: ['noche', 'mar'],
    reward: {
      id: 'rew-sun',
      name: 'Sol de la Creación',
      description: 'Recuerda que Dios creó los cielos y la tierra con Su palabra.',
      iconKey: 'sun',
      accentColor: '#D97706',
    },
  },
  {
    id: 'jhn-1-4',
    levelNumber: 2,
    worldId: 1,
    reference: 'Juan 1:4',
    verseText: 'En Él estaba la vida, y la vida era la luz de los hombres.',
    kidNote: 'Cuando recibimos a Jesús en nuestro corazón, Su vida brilla dentro de nosotros como una luz.',
    orderChunks: ['En Él', 'estaba la vida,', 'y la vida', 'era la luz', 'de los hombres.'],
    blankWordsStep1: ['vida', 'luz', 'hombres'],
    blankWordsStep3: ['Él', 'vida', 'luz', 'hombres'],
    distractors: ['camino', 'nube'],
    reward: {
      id: 'rew-lamp',
      name: 'Lámpara de Luz',
      description: 'La vida de Cristo brilla con alegría en el corazón de los niños.',
      iconKey: 'lamp',
      accentColor: '#CA8A04',
    },
  },
  {
    id: '1jn-4-8',
    levelNumber: 3,
    worldId: 1,
    reference: '1 Juan 4:8',
    verseText: 'El que no ama, no ha conocido a Dios; porque Dios es amor.',
    kidNote: 'Dios no solo nos da cosas buenas: ¡Su propia naturaleza es amor!',
    orderChunks: ['El que no ama,', 'no ha conocido', 'a Dios;', 'porque Dios', 'es amor.'],
    blankWordsStep1: ['ama', 'Dios', 'amor'],
    blankWordsStep3: ['ama', 'conocido', 'Dios', 'amor'],
    distractors: ['temor', 'fuerza'],
    reward: {
      id: 'rew-heart',
      name: 'Corazón de Amor',
      description: 'Dios es amor y quiere llenar nuestra casa de bondad.',
      iconKey: 'heart',
      accentColor: '#DC2626',
    },
  },
  {
    id: 'psa-23-1',
    levelNumber: 4,
    worldId: 2,
    reference: 'Salmos 23:1',
    verseText: 'Jehová es mi Pastor; nada me faltará.',
    kidNote: 'Así como un buen pastor cuida a sus ovejitas, el Señor cuida cada paso que das.',
    orderChunks: ['Jehová es', 'mi Pastor;', 'nada me', 'faltará.'],
    blankWordsStep1: ['Jehová', 'Pastor', 'faltará'],
    blankWordsStep3: ['Jehová', 'Pastor', 'nada', 'faltará'],
    distractors: ['amigo', 'sobrará'],
    reward: {
      id: 'rew-staff',
      name: 'Cayado del Pastor',
      description: 'Nuestro Pastor siempre nos guía a verdes pastos y aguas tranquilas.',
      iconKey: 'staff',
      accentColor: '#059669',
    },
  },
  {
    id: 'jhn-14-6',
    levelNumber: 5,
    worldId: 2,
    reference: 'Juan 14:6',
    verseText: 'Jesús le dijo: Yo soy el camino, y la realidad, y la vida; nadie viene al Padre sino por Mí.',
    kidNote: 'Jesús mismo es el camino real que nos lleva directamente al abrazo de Dios Padre.',
    orderChunks: [
      'Jesús le dijo:',
      'Yo soy el camino,',
      'y la realidad,',
      'y la vida;',
      'nadie viene al Padre',
      'sino por Mí.',
    ],
    blankWordsStep1: ['camino', 'realidad', 'vida'],
    blankWordsStep3: ['camino', 'realidad', 'vida', 'Padre'],
    distractors: ['puente', 'casa'],
    reward: {
      id: 'rew-key',
      name: 'Llave del Camino',
      description: 'Cristo es nuestro camino, nuestra realidad y nuestra vida cada día.',
      iconKey: 'key',
      accentColor: '#2563EB',
    },
  },
  {
    id: 'rom-10-13',
    levelNumber: 6,
    worldId: 2,
    reference: 'Romanos 10:13',
    verseText: 'Porque todo aquel que invoque el nombre del Señor, será salvo.',
    kidNote: 'Invocar es llamar en voz alta al Señor: "¡Oh Señor Jesús!" Él siempre escucha.',
    orderChunks: ['Porque todo aquel', 'que invoque', 'el nombre del Señor,', 'será salvo.'],
    blankWordsStep1: ['invoque', 'nombre', 'salvo'],
    blankWordsStep3: ['aquel', 'invoque', 'nombre', 'salvo'],
    distractors: ['escuche', 'cielo'],
    reward: {
      id: 'rew-crown',
      name: 'Corona del Nombre',
      description: 'Al invocar Su dulce nombre disfrutamos Su presencia y salvación.',
      iconKey: 'crown',
      accentColor: '#D97706',
    },
  },
  {
    id: 'eph-6-1',
    levelNumber: 7,
    worldId: 3,
    reference: 'Efesios 6:1',
    verseText: 'Hijos, obedeced en el Señor a vuestros padres, porque esto es justo.',
    kidNote: 'Obedecer a mamá y papá con alegría agrada mucho al corazón del Señor.',
    orderChunks: ['Hijos, obedeced', 'en el Señor', 'a vuestros padres,', 'porque esto', 'es justo.'],
    blankWordsStep1: ['obedeced', 'padres', 'justo'],
    blankWordsStep3: ['Hijos', 'obedeced', 'Señor', 'padres', 'justo'],
    distractors: ['jugad', 'amigos'],
    reward: {
      id: 'rew-branch',
      name: 'Ramo de Obediencia',
      description: 'Crecer en el Señor comienza honrando y obedeciendo en casa.',
      iconKey: 'branch',
      accentColor: '#16A34A',
    },
  },
  {
    id: 'php-4-4',
    levelNumber: 8,
    worldId: 3,
    reference: 'Filipenses 4:4',
    verseText: 'Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!',
    kidNote: 'Nuestra alegría verdadera no depende de las cosas, sino de estar unidos al Señor.',
    orderChunks: ['Regocijaos', 'en el Señor', 'siempre.', 'Otra vez digo:', '¡Regocijaos!'],
    blankWordsStep1: ['Regocijaos', 'Señor', 'siempre'],
    blankWordsStep3: ['Regocijaos', 'Señor', 'siempre', 'digo'],
    distractors: ['nunca', 'llorad'],
    reward: {
      id: 'rew-harp',
      name: 'Arpa de Gozo',
      description: 'Un corazón que se regocija en el Señor canta cada mañana.',
      iconKey: 'harp',
      accentColor: '#EA580C',
    },
  },
  {
    id: 'php-4-13',
    levelNumber: 9,
    worldId: 3,
    reference: 'Filipenses 4:13',
    verseText: 'Todo lo puedo en Aquel que me reviste de poder.',
    kidNote: 'Cuando algo parece difícil, Cristo vive en nosotros para darnos Su fuerza.',
    orderChunks: ['Todo lo puedo', 'en Aquel', 'que me reviste', 'de poder.'],
    blankWordsStep1: ['Todo', 'Aquel', 'poder'],
    blankWordsStep3: ['Todo', 'puedo', 'reviste', 'poder'],
    distractors: ['miedo', 'sueño'],
    reward: {
      id: 'rew-shield',
      name: 'Escudo de Poder',
      description: 'Con Aquel que nos reviste de poder, podemos vencer cualquier temor.',
      iconKey: 'shield',
      accentColor: '#0284C7',
    },
  },
  {
    id: 'psa-119-105',
    levelNumber: 10,
    worldId: 4,
    reference: 'Salmos 119:105',
    verseText: 'Lámpara es a mis pies Tu palabra, y lumbrera a mi camino.',
    kidNote: 'La Biblia ilumina nuestro caminar para que nunca tropecemos en la oscuridad.',
    orderChunks: ['Lámpara es', 'a mis pies', 'Tu palabra,', 'y lumbrera', 'a mi camino.'],
    blankWordsStep1: ['Lámpara', 'palabra', 'camino'],
    blankWordsStep3: ['Lámpara', 'pies', 'palabra', 'lumbrera', 'camino'],
    distractors: ['piedra', 'valle'],
    reward: {
      id: 'rew-torch',
      name: 'Antorcha de la Palabra',
      description: 'Tu palabra alumbra cada paso de nuestra vida.',
      iconKey: 'torch',
      accentColor: '#D97706',
    },
  },
  {
    id: '2ti-3-16',
    levelNumber: 11,
    worldId: 4,
    reference: '2 Timoteo 3:16',
    verseText: 'Toda la Escritura es aliento de Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia.',
    kidNote: 'Cada vez que leemos la Biblia con fe, ¡respiramos el aliento fresco de Dios!',
    orderChunks: [
      'Toda la Escritura',
      'es aliento de Dios,',
      'y útil para enseñar,',
      'para redargüir,',
      'para corregir,',
      'para instruir en justicia.',
    ],
    blankWordsStep1: ['Escritura', 'aliento', 'enseñar', 'justicia'],
    blankWordsStep3: ['Escritura', 'aliento', 'útil', 'corregir', 'justicia'],
    distractors: ['historia', 'silencio'],
    reward: {
      id: 'rew-breath',
      name: 'Soplo de Vida',
      description: 'La Escritura es el aliento mismo de Dios para alimentarnos.',
      iconKey: 'breath',
      accentColor: '#0D9488',
    },
  },
  {
    id: 'jhn-3-16',
    levelNumber: 12,
    worldId: 4,
    reference: 'Juan 3:16',
    verseText: 'Porque de tal manera amó Dios al mundo, que ha dado a Su Hijo unigénito, para que todo aquel que en Él cree, no perezca, mas tenga vida eterna.',
    kidNote: 'El regalo más grande de la historia: Dios dio a Su Hijo para darnos Su vida eterna.',
    orderChunks: [
      'Porque de tal manera',
      'amó Dios al mundo,',
      'que ha dado a Su Hijo unigénito,',
      'para que todo aquel',
      'que en Él cree,',
      'no perezca,',
      'mas tenga vida eterna.',
    ],
    blankWordsStep1: ['amó', 'mundo', 'Hijo', 'cree', 'eterna'],
    blankWordsStep3: ['manera', 'amó', 'Hijo', 'cree', 'vida', 'eterna'],
    distractors: ['cielo', 'oro'],
    reward: {
      id: 'rew-tree',
      name: 'Fruto de Vida Eterna',
      description: 'Has completado todo el jardín con la vida eterna de Cristo.',
      iconKey: 'tree',
      accentColor: '#15803D',
    },
  },
];

export interface ParsedWord {
  index: number;
  raw: string;
  leadingPunct: string;
  clean: string;
  trailingPunct: string;
}

export function parseVerseWords(verseText: string): ParsedWord[] {
  const parts = verseText.split(/\s+/).filter(Boolean);
  return parts.map((raw, index) => {
    const match = raw.match(/^([¡¿«"]*)([^.,;:!?»"]+)([.,;:!?»"]*)$/);
    if (!match) {
      return { index, raw, leadingPunct: '', clean: raw, trailingPunct: '' };
    }
    return {
      index,
      raw,
      leadingPunct: match[1] || '',
      clean: match[2],
      trailingPunct: match[3] || '',
    };
  });
}
