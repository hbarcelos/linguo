const cefrLevels = [
  {
    code: 'A1',
    name: 'A1',
  },
  {
    code: 'A2',
    name: 'A2',
  },
  {
    code: 'B1',
    name: 'B1',
  },
  {
    code: 'B2',
    name: 'B2',
  },
  {
    code: 'C1',
    name: 'C1',
  },
  {
    code: 'C2',
    name: 'C2',
  },
];

const cefrLanguages = [
  {
    code: 'en-us',
    name: 'English (USA)',
  },
  {
    code: 'en-gb',
    name: 'English (Great Britain)',
  },
  {
    code: 'fr-fr',
    name: 'French (France)',
  },
  {
    code: 'es',
    name: 'Spanish (Spain)',
  },
  {
    code: 'es-mx',
    name: 'Spanish (Mexico)',
  },
  {
    code: 'es-ar',
    name: 'Spanish (Argentina)',
  },
  {
    code: 'pt-br',
    name: 'Portuguese (Brazil)',
  },
  {
    code: 'pt',
    name: 'Portuguese (Portugal)',
  },
  {
    code: 'de',
    name: 'German',
  },
  {
    code: 'nl',
    name: 'Dutch',
  },
  {
    code: 'ja',
    name: 'Japanese',
  },
  {
    code: 'zh-cn',
    name: 'Chinese (China)',
  },
];

export default cefrLanguages.map(language => ({
  ...language,
  referenceFramework: 'CEFR',
  levels: cefrLevels,
  /* Use versioning */
  __v: 1,
}));