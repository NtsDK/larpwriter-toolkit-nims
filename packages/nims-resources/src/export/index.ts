import { genericTemplate } from "./ru/genericTemplate";
import { inventoryTemplate } from "./ru/inventoryTemplate";
import { templateByStory } from "./ru/templateByStory";
import { templateByTime } from "./ru/templateByTime";
import { textTemplate } from "./ru/textTemplate";

const templates = {
    ru: {
        genericTemplate,
        inventoryTemplate,
        templateByStory,
        templateByTime,
        textTemplate
    }
} as const;

export function getTemplate(
    lang: keyof typeof templates,
    template: keyof typeof templates['ru']
){
    return templates[lang][template];
}
