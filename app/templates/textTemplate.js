var TEXT_TEMPLATE = "{{gameName}}\n" +  
  "{{#briefings}}\n" + 
  "{{gameName}}\n" +  
  "{{name}}\n" +
  "\n" +
  "Инвентарь: {{inventory}}\n" +
  "\n" +
  "{0}" +
  "\n" +
  "{{#profileInfoArray}}\n" +
  "{{name}}:{{value}}\n" +
  "{{/profileInfoArray}}\n" +
  "\n" +
  "{{#groupTexts}}\n"  +
  "{{groupName}}\n"    +
  "{{text}}\n"         +
  "{{/groupTexts}}\n"  +
  "\n" +
  "{{#relations}}\n"     +
  "{{toCharacter}}\n"    +
  "{{text}}\n"           +
  "{{stories}}\n"        +
  "\n" +
  "{{/relations}}\n"     +
  "\n" +
  "{{#eventsInfo}}\n" +
  "{{{time}}} {{{displayTime}}} {{storyName}}: {{name}}\n" +
  "{{text}}\n" +
  "{{/eventsInfo}}\n" +
  "\n" +
  "{{#storiesInfo}}\n" +
  "{{name}}\n" +
  "{{#eventsInfo}}\n" +
  "\n" +
  "{{{time}}} {{{displayTime}}} {{name}}\n" +
  "{{text}}\n" +
  "{{#splittedText}}\n" +
  "{{string}}\n" +
  "{{/splittedText}}\n" +
  "{{/eventsInfo}}\n" +
  "{{/storiesInfo}}\n" +
  "{{/briefings}}\n";