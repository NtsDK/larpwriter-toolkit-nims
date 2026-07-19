import genericTemplate from './genericTemplate';
import inventoryTemplate from './inventoryTemplate';
import templateByStory from './templateByStory';
import templateByTime from './templateByTime';
import textTemplate from './textTemplate';

export const exportTemplates = {
  genericTemplate,
  inventoryTemplate,
  templateByStory,
  templateByTime,
  textTemplate,
} as const;

export type ExportTemplateName = keyof typeof exportTemplates;
