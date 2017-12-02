# О проектах

Проект НИМС (набор инструментов мастера сюжетника) создавался как самостоятельный, но очень скоро оказалось, что на его основе можно делать другие полезные проекты. Пока он был небольшим было удобно сделать копию и внести соответствующие изменения. Однако проект магазин Deus Ex Machina сильно повлиял на развитие кодовой базы, поэтому исходный проект был преобразован с целью накопления и переиспользования наработок.

Проекты на постоянной поддержке (должны постоянно поддерживаться в рабочем состоянии):
1. НИМС набор инструментов мастера сюжетника (ветка nims будет) - разработка сюжетов для ролевых игр живого действия
2. Measurelook viewer (ветка measurelook) - просмотр экспериментов (в [репозитории](https://github.com/NtsDK/measurelook) публикуются билды, собранные в этом репозитории)
3. Vampire the Masquerade character sheet (ветка vtmcl) - интерактивный чарник для Vampire the Masquerade

Проекты на разовой поддержке (не поддерживаются на постоянке в рабочем состоянии, являются примерами исходного кода):
1. Deus Ex Shop (des) - система магазин для ролевой игры Deus Ex Machina
2. Watches (watches) - система для городской ролевой игры Дозоры

# Сборка оффлайн версии

0. Установите node.js
1. Скачивайте соответствующую ветку из этого репозитория (measurelook, vtmcl)
1. Скачивайте [репозиторий с текстовыми ресурсами](https://github.com/NtsDK/smtk-nims-translations) (там нет деления на ветки)
1. В репозитории smtk-nims вызовите "npm i"
1. Откройте client/config/<проект>-config.json и введите путь к репозиторию с переводами translationsPath.

Далее выполните команды.
Пример команд сборки в режиме разработки. В этом режиме разрабатываемый вами проект будет собираться в папке dist и обновляться по мере внесения изменений.

	set NODE_ENV=dev && set MODE=standalone && set LANG=ru && gulp dev --configFile "config\vtmcl-config.json"
	set NODE_ENV=dev && set MODE=standalone && set LANG=ru && gulp dev --configFile "config\measurelook-config.json"
    
Пример команды сборки конечного архива.

	set NODE_ENV=dev && set MODE=standalone && set LANG=ru && gulp dist:final --configFile "config\vtmcl-config.json"
    
Опции сборки Gulp:

1. NODE_ENV
	1. dev - сборка с sourcemaps и без минимизации (uglify)
	1. prod - сборка без sourcemaps и с минимизацией
1. MODE
	1. server - сборка версии для сервера (основное это лишняя копия директории common)
	1. standalone - сборка оффлайн версии
1. LANG - Ru+En проекты nims, vtmcl, des; Ru проекты measurelook, watches
	1. ru - сборка с русским языком, включенным по умолчанию
	2. en - сборка с английским языком, включенным по умолчанию
1. --configFile - файл с конфигурацией проекта (см. папку config)

# Contributing Guidelines

# Using editorconfig

This is a simple code checker. Right now it used in js folder only.

    eclint check app\core\js
    eclint fix app\core\js
    
    eclint check app\vtmcl\js
    eclint fix app\vtmcl\js
    eclint check app\vtmcl\js\capitalApp.js
    eclint check app\measurelook\js
    eclint fix app\measurelook\js


# Using eslint

    "node_modules/.bin/eslint" .eslintrc.js
    
    "node_modules/.bin/eslint" app\core\js
    "node_modules/.bin/eslint" app\core\js --fix
    
    "node_modules/.bin/eslint" app\vtmcl\js
    "node_modules/.bin/eslint" app\vtmcl\js --fix
    "node_modules/.bin/eslint" app\vtmcl\js\pageManager.js
    "node_modules/.bin/eslint" app\vtmcl\js\pageManager.js --fix
    
    "node_modules/.bin/eslint" app\measurelook\js
    "node_modules/.bin/eslint" app\measurelook\js --fix
    
    
    
### Building NIMS (old instruction in English) ###

NIMS consists of three parts: client, server and translations.

### Building offline version ###

1. Checkout this repo and run "npm i". Possibly you will need to globally install gulp 4.
1. Checkout server repo and run "npm i" (if necessary)
1. Checkout translations repo.
1. Open client/config/nims-config.json and set path to translations directory.
1. Open server/config/nims-config.json and set path to client directory.

Gulp client build options:

1. NODE_ENV
	1. dev - build with sourcemaps and without uglification
	1. prod - build without sourcemaps and with uglification
1. MODE
	1. server - build with common directory copy to be used by server
	1. standalone - build offline version
1. LANG
	1. ru - build with Ru lang enabled by default
	2. en - build with En lang enabled by default
1. --configFile - file with project configuration
	
Gulp targets:

1. dist - make distributive 
1. dev - make distributive and watch for changes to update distributive
1. dist:final - make distributive with extra materials: presentation, documentation, handout templates and zip it

Examples:

	set NODE_ENV=dev && set MODE=server && set LANG=ru && gulp dev --configFile "config\des-config.json"
	set NODE_ENV=dev && set MODE=server && set LANG=ru && gulp dev --configFile "config\nims-config.json"
	set NODE_ENV=dev && set MODE=server && set LANG=ru && gulp dev --configFile "config\watches-config.json"
	set NODE_ENV=dev && set MODE=standalone && set LANG=ru && gulp dev --configFile "config\vtmcl-config.json"
	set NODE_ENV=dev && set MODE=standalone && set LANG=ru && gulp dev --configFile "config\measurelook-config.json"

	set NODE_ENV=dev && set MODE=standalone && set LANG=ru && gulp dist:final --configFile "config\vtmcl-config.json"

	set NODE_ENV=dev && set MODE=server && gulp dev --configFile "config\nims-config.json"
	set NODE_ENV=dev && set MODE=server && npm run gulp dev
	set NODE_ENV=dev && set MODE=standalone && gulp dev
	set NODE_ENV=dev && set MODE=standalone && set LANG=en && gulp dev
	set NODE_ENV=dev && set MODE=server && gulp dist:final
	set NODE_ENV=dev && set MODE=standalone && gulp dist:final

	set NODE_ENV=prod && set MODE=standalone && gulp dist
	set NODE_ENV=prod && set MODE=standalone && gulp dist:final
	set NODE_ENV=prod && set MODE=standalone && set LANG=en && gulp dist:final
	set NODE_ENV=prod && set MODE=server && gulp dist:final

	set NODE_ENV=prod && set MODE=standalone && set LANG=ru && gulp dist:final
	set NODE_ENV=prod && set MODE=standalone && set LANG=en && gulp dist:final
	set NODE_ENV=prod && set MODE=server && set LANG=ru && gulp dist:final
	set NODE_ENV=prod && set MODE=server && set LANG=en && gulp dist:final
