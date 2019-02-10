exports.defaultLang = 'ru';
exports.Dictionaries = {};

const langs = ['ru', 'en'];

const modules = `about
adaptations
admins
advices
binding
briefings
common
constant
entity
entrance
errors
gears
groups
header
log-viewer
overview
profile-filter
profiles
role-grid
sliders
social-network
stories
text-search
timeline
utils
dialogs`.split('\n');


langs.forEach((lang) => {
    exports.Dictionaries[lang] = modules.reduce((acc, module) => {
        acc[module] = require(`./${lang}/${module}`);
        return acc;
    }, {});
});
