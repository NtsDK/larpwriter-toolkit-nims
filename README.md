# What is the project?

This repo contains sources of larpwriter toolkit NIMS project (frontend, core and server).

# Install and run

```
npm i
```

How to run development environment for standalone version?

1. `npm run nims-wp-start`
2. Open http://localhost:8080/nims.html in browser.

How to run development environment for server version?

1. In first cmd run `npm run nims-wp-watch-server`
It will create dist folder with frontend build.
2. Go to `server\config\nims-frontend-local.json` and set absolute path to dist folder in frontendPath
3. In second cmd run `npm run nims-nodemon`
4. Open http://localhost:3001/ admin/zxpoYR65
5. Default base is empty. You need to load some base. You can download base example from standalone NIMS build.

# Description (Outdated)

This repo contains sources of larpwriter toolkit NIMS project (frontend, core, BUT NOT server) and derivative projects:

1. Larpwriter toolkit NIMS - larpwriter software for writing rich backstory LARPs. [README RU](https://github.com/NtsDK/smtk-nims/blob/master/wiki/NIMS_RU.md), [README EN](https://github.com/NtsDK/smtk-nims/blob/master/wiki/NIMS_EN.md), [Geektimes post RU](https://geektimes.ru/post/292531/)
1. Vampire The Masquerade character sheet - interactive web page with charlist. [YouTube Demo RU](https://www.youtube.com/watch?v=1zHviDjOrn4)
1. Measurelook - scientific measures data storing and visualization. [README RU](https://github.com/NtsDK/smtk-nims/blob/master/wiki/MEASURELOOK_RU.md), [README EN](https://github.com/NtsDK/smtk-nims/blob/master/wiki/MEASURELOOK_EN.md), [habrahabr post RU](https://habrahabr.ru/post/344174/)
1. Deus Ex Shop - Shop system for Deus Ex Machina LARP with was in 2017 near Moscow. [YouTube Demo RU](https://www.youtube.com/watch?v=GlgfL7RAqgE), [YouTube Demo EN](https://www.youtube.com/watch?v=M3XN6NM1tTg)
1. Watches - information system for city game wathes in 2017 year. [YouTube Demo RU](https://www.youtube.com/watch?v=MQ5-ffq1Vco)

[How to build projects RU](https://github.com/NtsDK/smtk-nims/blob/master/wiki/CONTRIBUTING.md)

[Contributors EN](https://github.com/NtsDK/smtk-nims/blob/master/wiki/CONTRIBUTORS.md)
