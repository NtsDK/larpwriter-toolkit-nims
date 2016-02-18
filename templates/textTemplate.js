var TEXT_TEMPLATE = "{{name}}\n" +
  "\n" +
  "Инвентарь: {{inventory}}\n" +
  "\n" +
  "{{#profileInfoArray}}\n" +
  "{{name}}:{{value}}\n" +
  "{{/profileInfoArray}}\n" +
  "\n" +
  "{{#eventsInfo}}\n" +
  "{{text}}\n" +
  "{{{time}}}\n" +
  "{{/eventsInfo}}\n" +
  "\n" +
  "{{#storiesInfo}}\n" +
  "{{name}}\n" +
  "{{#eventsInfo}}\n" +
  "\n" +
  "{{{time}}}\n" +
  "{{text}}\n" +
  "{{/eventsInfo}}\n" +
  "{{/storiesInfo}}\n";