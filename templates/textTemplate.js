var TEXT_TEMPLATE = "{{name}}\n" +
  "\n" +
  "Инвентарь: {{inventory}}\n" +
  "\n" +
  "{{#profileInfoArray}}\n" +
  "{{name}}:{{value}}\n" +
  "{{/profileInfoArray}}\n" +
  "\n" +
  "{{#eventsInfo}}\n" +
  "{{{time}}} {{name}}\n" +
  "{{text}}\n" +
  "{{/eventsInfo}}\n" +
  "\n" +
  "{{#storiesInfo}}\n" +
  "{{name}}\n" +
  "{{#eventsInfo}}\n" +
  "\n" +
  "{{{time}}} {{name}}\n" +
  "{{text}}\n" +
  "{{/eventsInfo}}\n" +
  "{{/storiesInfo}}\n";