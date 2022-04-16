import { genericTemplate_ru } from "./ru/genericTemplate";
import { inventoryTemplate_ru } from "./ru/inventoryTemplate";
import { templateByStory_ru } from "./ru/templateByStory";
import { templateByTime_ru } from "./ru/templateByTime";
import { textTemplate_ru } from "./ru/textTemplate";

const templates = {
  ru: {
    genericTemplate: genericTemplate_ru,
    inventoryTemplate: inventoryTemplate_ru,
    templateByStory: templateByStory_ru,
    templateByTime: templateByTime_ru,
    textTemplate: textTemplate_ru
  }
};

export function getTemplate (lang: keyof typeof templates, template: keyof typeof templates['ru']) {
  return templates[lang][template];
}
