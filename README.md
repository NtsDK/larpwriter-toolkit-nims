# What is the project?

This repo contains sources of larpwriter toolkit NIMS project (frontend, core and server).

# Dev install

Installing monorepo manager Lerna:

`npm i -g lerna` 

Installing project dependencies:

`npm i` 

`npm run bootstrap` 


# Dev run

## Running development standalone version

1. `npm run watch:standalone`
2. Open http://localhost:8080/nims.html in browser.

## Running development server version

1. `npm run watch:server`

It will create dist folder in `packages/nims-app` with frontend build.

2. Open http://localhost:3001/ 

Default login/password: admin/zxpoYR65

3. Default base is empty. You need to load some base. You can download base example from standalone NIMS build or take it from nims-resources.

#  Package description

## nims-app

NIMS webclient interface - all pages and page control. Also DBMS tests are here too.

## nims-app-core

Common utilities for webclient interface. Common UI, l10n, utils and autosave in browser local storage.

## nims-dbms

NIMS data engine APIs. Includes all APIs both general and server specific.

## nims-dbms-core

NIMS data engine core. Generic part and utilities.

## nims-resources

Data resources - localization files and NIMS base examples.

## nims-server

NIMS express server.

## wiki

Old outdated package.

# Description (Outdated)

This repo contains sources of larpwriter toolkit NIMS project (frontend, core, BUT NOT server) and derivative projects:

1. Larpwriter toolkit NIMS - larpwriter software for writing rich backstory LARPs. [README RU](https://github.com/NtsDK/smtk-nims/blob/master/wiki/NIMS_RU.md), [README EN](https://github.com/NtsDK/smtk-nims/blob/master/wiki/NIMS_EN.md), [Geektimes post RU](https://geektimes.ru/post/292531/)
1. Vampire The Masquerade character sheet - interactive web page with charlist. [YouTube Demo RU](https://www.youtube.com/watch?v=1zHviDjOrn4)
1. Measurelook - scientific measures data storing and visualization. [README RU](https://github.com/NtsDK/smtk-nims/blob/master/wiki/MEASURELOOK_RU.md), [README EN](https://github.com/NtsDK/smtk-nims/blob/master/wiki/MEASURELOOK_EN.md), [habrahabr post RU](https://habrahabr.ru/post/344174/)
1. Deus Ex Shop - Shop system for Deus Ex Machina LARP with was in 2017 near Moscow. [YouTube Demo RU](https://www.youtube.com/watch?v=GlgfL7RAqgE), [YouTube Demo EN](https://www.youtube.com/watch?v=M3XN6NM1tTg)
1. Watches - information system for city game wathes in 2017 year. [YouTube Demo RU](https://www.youtube.com/watch?v=MQ5-ffq1Vco)

[How to build projects RU](https://github.com/NtsDK/smtk-nims/blob/master/wiki/CONTRIBUTING.md)

[Contributors EN](https://github.com/NtsDK/smtk-nims/blob/master/wiki/CONTRIBUTORS.md)
