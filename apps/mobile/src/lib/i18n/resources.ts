import en from '@/translations/en.json';
import sw from '@/translations/sw.json';

export const resources = {
  en: {
    translation: en,
  },
  sw: {
    translation: sw,
  },
};

export type Language = keyof typeof resources;
