# Справочник MCP-tools НИМС

Read-only tools доступны на `/mcp/readonly`. Write — только на `/mcp`.

## Мета и отчёты

| Tool | Параметры | Примечание |
|------|-----------|------------|
| `get_meta` | — | JSON: name, description, date, preGameDate |
| `set_meta` | `name`: name \| description \| date \| preGameDate; `value` | admin для name/description |
| `search_text` | `searchStr`, `textTypes[]`, `caseSensitive?` | textTypes: writerStory, eventOrigins, eventAdaptations, characterProfiles, playerProfiles, relations, groups |
| `get_statistics` | — | Счётчики и метрики проекта |
| `get_consistency_check` | — | errors[] — список проблем схемы и ссылок |

## Персонажи

| Tool | Параметры |
|------|-----------|
| `list_characters` | — |
| `get_character` | `name` |
| `get_profile_structure` | `type`: character \| player |
| `create_character` | `characterName` |
| `update_character_field` | `characterName`, `fieldName`, `itemType`, `value` |
| `rename_character` | `fromName`, `toName` |
| `remove_character` | `characterName` |

`itemType`: text, string, enum, multiEnum, number, checkbox — как в `get_profile_structure`.

## Сюжеты

| Tool | Параметры |
|------|-----------|
| `list_stories` | — |
| `get_story` | `storyName` |
| `get_story_events` | `storyName` |
| `get_story_characters` | `storyName` |
| `create_story` | `storyName` |
| `set_story_text` | `storyName`, `value` |
| `rename_story` | `fromName`, `toName` |
| `remove_story` | `storyName` |
| `add_character_to_story` | `storyName`, `characterName` |
| `remove_character_from_story` | `storyName`, `characterName` |

## События и адаптации

| Tool | Параметры |
|------|-----------|
| `create_event` | `storyName`, `eventName`, `selectedIndex` |
| `update_event` | `storyName`, `index`, `property`: name \| text \| time, `value` |
| `remove_event` | `storyName`, `index` |
| `add_character_to_event` | `storyName`, `eventIndex`, `characterName` |
| `remove_character_from_event` | `storyName`, `eventIndex`, `characterName` |
| `set_event_adaptation` | `storyName`, `eventIndex`, `characterName`, `type`: text \| time \| ready, `value` |

`selectedIndex` — позиция вставки (0 = начало). `eventIndex` / `index` — 0-based.

## Отношения

| Tool | Параметры |
|------|-----------|
| `get_relations` | — |
| `get_character_relation` | `fromCharacter`, `toCharacter` |
| `create_relation` | `fromCharacter`, `toCharacter` |
| `set_relation_text` | `fromCharacter`, `toCharacter`, `character`, `text` |
| `remove_relation` | `fromCharacter`, `toCharacter` |

## Группы

| Tool | Параметры |
|------|-----------|
| `list_groups` | — |
| `get_group` | `groupName` |
| `create_group` | `groupName` |

## Вводные и база

| Tool | Параметры | Права |
|------|-----------|-------|
| `get_briefing` | `selCharacters?`, `selStories?`, `exportOnlyFinishedStories?` | read |
| `get_character_report` | `characterName` | read |
| `export_briefings` | `selCharacters?`, `selStories?`, `exportOnlyFinishedStories?`, `format?`: json \| markdown | read |
| `import_briefings` | `data`: briefings[] или `{ briefings, gameName? }` | write |
| `export_database` | `includeManagementInfo?` | read |
| `import_database` | `database`, `preserveManagementInfo?` | admin |
| `load_database_preset` | `preset`: empty \| demo \| negriat, `preserveManagementInfo?` | admin |
| `list_database_presets` | — | read |

## Resources (URI)

| URI | Содержимое |
|-----|------------|
| `nims://meta` | Мета проекта |
| `nims://characters` | Краткие профили всех персонажей |
| `nims://stories` | Список сюжетов с превью |
| `nims://character/{name}` | Полный профиль |
| `nims://story/{name}` | Полный сюжет с событиями |
| `nims://database` | База без ManagementInfo |
| `nims://briefings` | Все вводные JSON |

## Пример: одна сцена для персонажа

```text
create_character { characterName: "Алиса" }
create_story { storyName: "Тайна особняка" }
add_character_to_story { storyName: "Тайна особняка", characterName: "Алиса" }
create_event { storyName: "Тайна особняка", eventName: "Встреча в холле", selectedIndex: 0 }
add_character_to_event { storyName: "Тайна особняка", eventIndex: 0, characterName: "Алиса" }
update_event { storyName: "Тайна особняка", index: 0, property: "text", value: "В холле собрались все гости." }
set_event_adaptation { storyName: "Тайна особняка", eventIndex: 0, characterName: "Алиса", type: "text", value: "Вы замечаете странный портрет..." }
set_event_adaptation { storyName: "Тайна особняка", eventIndex: 0, characterName: "Алиса", type: "ready", value: true }
```
