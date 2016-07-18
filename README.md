# Набор инструментов мастера сюжетника (НИМС) ([English](https://bitbucket.org/NtsDK/story-master-toolkit-smtk-nims#markdown-header-english-intro))

### НИМС - что это? ###

НИМС - это редактор для написания вводных для ролевых игр (РИ). Это его основная функция, и именно это он должен делать хорошо. Помимо этого, с его помощью решаются побочные задачи, но об этом позже.

НИМС реализован в виде интерактивной веб-страницы. Все, что вам нужно для работы с НИМС это веб-браузер. Проверялась работа программы в Firefox, Chrome и Internet Explorer. Для работы НИМСу не требуется соединение с интернетом, так же, как не требуется интернет для работы калькулятора.

### Порядок работы с НИМС ###

1. Открываете НИМС
1. Загружаете базу для редактирования
1. Вносите изменения
1. Сохраняете базу для последующего запуска

НИМС не может работать напрямую с файлом, поэтому сохранение не выполняется сразу в файл. Это необходимо делать отдельно. На закрытии вкладки с НИМС всегда показывается напоминалка о необходимости сохранения базы.

В процессе работы с НИМС все изменения сразу сохраняются в странице. Например, при изменении текста описания игры на первой странице, как только вы завершите ввод, текст будет сохранен.

Сохраненный файл базы является обычным текстовым файлом фиксированной структуры. Если любопытно, откройте его в любом текстовом редакторе, только помните, что при внесении изменений вручную база может не загрузиться в НИМС при следующем запуске.

### Технические подробности в двух словах ###

НИМС написан на языке JavaScript с использованием библиотек jQuery (календарь для ввода дат), Vis (таймлайн и социальные сети) и Chart.js (круговые диаграммы), Docxtemplater (выгрузка в docx), Mustache (текстовая выгрузка), Bootstrap 3 (элементы дизайна). База данных хранится в формате json.
	
Авторы используемых иконок с сайта www.flaticon.com: Anton Saputro, Pavel Kozlov, Budi Tanrim, Catalin Fertu, Picol и Freepik. Автор иконки сортировки FatCow.
	
Исходный код НИМСа по своей природе открыт. Используется открытая лицензия Apache 2.0. Последняя версия НИМСа и документация находятся в репозитории https://bitbucket.org/NtsDK/story-master-toolkit-smtk-nims/downloads. Так же скачать НИМС можно на сайте http://trechkalov.com/ и в группе http://vk.com/larp_nims.
		
### Ссылки ###

Мой сайт: http://trechkalov.com

Группа VK: http://vk.com/larp_nims

[YouTube канал (здесь есть скринкасты)](https://www.youtube.com/channel/UC8RDnWbZRcrIDVRYg-b0A1Q)

# English intro #

# Story master toolkit NIMS (SMTK NIMS) #

### SMTK NIMS - what is it? ###

SMTK NIMS is an LARP handout editor. This is it is main feature and it must do it well. Also it solves more LARP specific tasks.

SMTK NIMS is an interactive web page. You need only modern browser to work with SMTK NIMS. We check it in Firefox, Chrome and Internet Explorer. SMTK NIMS doesn't require internet connection. It can work in offline mode.

### SMTK NIMS work sequence ###

1. Open SMTK NIMS
1. Load your LARP game database for editing
1. Make changes
1. Save LARP game database to your computer

SMTK NIMS can't save LARP game database to file automatically. You need to do it manually. There is always show reminder on closing SMTK NIMS tab in browser.

SMTK NIMS saves changes automatically in web page. For example when make any text changes on very first page it will be saved in page (but not in file).

LARP game database file is just a usual text file in JSON format. If you are interested you can open it in any text editor but be careful. If you broke something then SMTK NIMS will not load it next time.

### Technical details ###

SMTK NIMS implemented in JavaScript with jQuery (datetime calendar), Vis.js (timeline and social networks), Chart.js (donut chart), Docxtemplater (docx export), Mustache (text export), Bootstrap 3 (design elements).
	
www.flaticon.com authors: Anton Saputro, Pavel Kozlov, Budi Tanrim, Catalin Fertu, Picol and Freepik. Sort icon author FatCow.
	
SMTK NIMS license is Apache 2.0. 		
### Links ###

My site: http://trechkalov.com

VK: http://vk.com/larp_nims

[YouTube channel (including SMTK NIMS screencasts)](https://www.youtube.com/channel/UC8RDnWbZRcrIDVRYg-b0A1Q)