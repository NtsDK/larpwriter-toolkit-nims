const langs = ['ru'];

const templateNames = `genericTemplate
inventoryTemplate
templateByStory
templateByTime
textTemplate`.split('\n');

const templates = {};

langs.forEach( lang => {
    templates[lang] = templateNames.reduce((acc, templateName) => {
        acc[templateName] = require(`./${lang}/${templateName}`);
        return acc;
    }, {});
});

exports.getTemplate = (lang, template) => templates[lang][template];
