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
  "{{#eventsInfo}}\n" +
  "{{{time}}} {{storyName}}: {{name}}\n" +
  "{{text}}\n" +
  "{{/eventsInfo}}\n" +
  "\n" +
  "{{#storiesInfo}}\n" +
  "{{name}}\n" +
  "{{#eventsInfo}}\n" +
  "\n" +
  "{{{time}}} {{name}}\n" +
  "{{text}}\n" +
  "{{#splittedText}}\n" +
  "{{string}}\n" +
  "{{/splittedText}}\n" +
  "{{/eventsInfo}}\n" +
  "{{/storiesInfo}}\n" +
  "{{/briefings}}\n";