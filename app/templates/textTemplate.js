var TEXT_TEMPLATE = "{{gameName}}\n" +  
  "{{#briefings}}\n" + 
  "{{gameName}}\n" +  
  "{{charName}}\n" +
  "\n" +
  "Инвентарь: {{inventory}}\n" +
  "\n" +
  "{0}" +
  "\n" +
  "{{#profileInfoArray}}\n" +
  "{{itemName}}:{{value}}\n" +
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
  "{{{time}}} {{{displayTime}}} {{storyName}}: {{eventName}}\n" +
  "{{text}}\n" +
  "{{/eventsInfo}}\n" +
  "\n" +
  "{{#storiesInfo}}\n" +
  "{{storyName}}\n" +
  "{{#eventsInfo}}\n" +
  "\n" +
  "{{{time}}} {{{displayTime}}} {{eventName}}\n" +
  "{{text}}\n" +
  "{{#splittedText}}\n" +
  "{{string}}\n" +
  "{{/splittedText}}\n" +
  "{{/eventsInfo}}\n" +
  "{{/storiesInfo}}\n" +
  "{{/briefings}}\n";