---
name: nims-story-master
description: >-
  Работа мастера-сюжетника с НИМС через MCP: персонажи, сюжеты, события, адаптации,
  отношения, группы, вводные, мета проекта, поиск, проверка целостности.
  Использовать при работе с НИМС, LARP, ролевыми играми, вводными, сюжетом,
  персонажами, событиями, базой НИМС, или когда подключён MCP-сервер nims/nims-readonly.
---

# Мастер-сюжетник в НИМС

НИМС — редактор вводных для ролевых игр. В server-режиме доступен MCP: читать и менять базу через tools/resources.

Документация подключения: `packages/wiki/MCP_RU.md`. Справочник параметров tools: [tools-reference.md](tools-reference.md).

## Перед началом

1. Убедиться, что MCP **nims** или **nims-readonly** подключён и отвечает.
2. Для разведки и обзора — **readonly** (`/mcp/readonly`). Для записи — **full** (`/mcp`).
3. Сначала прочитать контекст, потом писать:
   - `get_meta` — название игры, даты, описание
   - `list_characters` / `list_stories`
   - при необходимости resource `nims://meta`, `nims://characters`, `nims://stories`
4. Токен MCP = права того пользователя, под которым получен на `/mcp/auth`. Игрокам MCP недоступен.

## Модель данных (кратко)

| Сущность | Что это | Ключевые tools |
|----------|---------|----------------|
| **Мета** | Название игры, даты, описание | `get_meta`, `set_meta` |
| **Персонаж** | Роль игрока, поля профиля | `create_character`, `get_character`, `update_character_field` |
| **Сюжет** | Линия с мастер-текстом | `create_story`, `set_story_text`, `get_story` |
| **Событие** | Сцена внутри сюжета (общий текст + время) | `create_event`, `update_event` |
| **Адаптация** | Персональный текст/время/готовность в событии | `set_event_adaptation` |
| **Отношение** | Связь двух персонажей (текст с каждой стороны) | `create_relation`, `set_relation_text` |
| **Группа** | Набор персонажей с общим текстом | `create_group`, `get_group` |
| **Вводная** | Вводная игрока (профиль + сюжеты + отношения) | `export_briefings`, `get_briefing`, `import_briefings` |

**Иерархия участия:** персонаж → добавлен в сюжет → добавлен в событие → можно писать адаптацию.

## Обязательный порядок мутаций

Нарушение порядка даёт `errors-entity-is-not-exist` или пустые адаптации.

```
create_character
  → create_story
  → add_character_to_story
  → create_event
  → add_character_to_event      ← перед set_event_adaptation
  → set_event_adaptation
```

- Индексы событий **с нуля** (`eventIndex: 0` — первое событие).
- `set_story_text` — мастер-текст сюжета (что видит мастер); `set_event_adaptation type:text` — что видит игрок в сцене.
- Отметить готовность адаптации: `set_event_adaptation` с `type: ready`, `value: true`.

## Типовые сценарии

### Обзор проекта (без записи)

```
get_meta → list_characters → list_stories
→ get_statistics
→ get_consistency_check
```

При большом проекте — `search_text` по ключевым словам (`textTypes`: `writerStory`, `eventAdaptations`, `characterProfiles`, `relations`).

### Новый персонаж и сцена

1. `get_profile_structure` с `type: character` — узнать поля профиля.
2. `create_character` → `update_character_field` для полей (тип поля = `itemType` из структуры).
3. Сюжет и событие — по цепочке из раздела «Обязательный порядок».
4. `get_character_report` — проверить, как выглядит вводная.

### Отношения между персонажами

1. `create_relation` (`fromCharacter`, `toCharacter`).
2. `set_relation_text` **дважды** — от лица каждого (`character` = имя того, чей текст задаёте).
3. `get_character_relation` — проверить.

### Массовая правка вводных

1. `export_briefings` с `format: markdown` и `selCharacters` / `selStories` — выгрузить нужное.
2. Правки в markdown вне НИМС **или** точечно `set_event_adaptation` / `update_character_field`.
3. Обратная загрузка: `import_briefings` с JSON из `export_briefings` (меняются `text` / `displayTime` в `eventsInfo`).
4. `get_consistency_check` после крупных изменений.

### Резервная копия и перенос

- Бэкап: `export_database` → сохранить JSON в файл.
- Восстановление: `import_database` (**только admin**), по умолчанию `preserveManagementInfo: true`.
- Чистый старт: `load_database_preset` — `empty`, `demo`, `negriat` (**только admin**).

## Права доступа

| Роль | Чтение MCP | Запись | Admin-only |
|------|------------|--------|------------|
| **organizer** | да | свои сущности + создание новых | нет |
| **editor** (назначен в НИМС) | да | любые сюжеты/персонажи | нет |
| **admin** | да | admin-операции | `set_meta`, `import_database`, `load_database_preset` |
| **player** | нет | нет | — |

При назначенном **редакторе** обычный организатор не может править тексты сюжетов (`errors-forbidden-for-non-editor`) — только редактор или admin для admin-задач.

Редактировать поля **чужого** персонажа без роли редактора нельзя (`errors-organizer-is-not-an-owner`).

## Правила для ассистента

1. **Не выдумывать имена** — перед ссылкой на персонажа/сюжет вызвать `list_*` или `get_*`.
2. **Минимальные записи** — менять только то, о чём просят; не перезаписывать базу без явного запроса.
3. **Перед удалением** (`remove_character`, `remove_story`, `remove_event`) — предупредить: операция необратима.
4. **После пакета правок** — `get_consistency_check`; при ошибках сообщить список.
5. **Имена** — кириллица допустима; в resource URI кодировать: `nims://character/Имя%20Персонажа`.
6. **Большие ответы** — для обзора использовать `list_*`, `get_story_events`, `search_text`, а не `export_database` целиком.
7. **Вводные игроку** — отдавать markdown из `export_briefings`, не сырой JSON, если пользователь не просит иначе.

## Чеклист качества сюжета

Перед сдачей блока работы мастеру:

```
- [ ] У каждого игрового персонажа есть профиль и хотя бы один сюжет
- [ ] Персонажи добавлены в сюжет и в события, где им нужны адаптации
- [ ] Адаптации согласованы с мастер-текстом события (нет противоречий)
- [ ] Отношения созданы и тексты заполнены с обеих сторон (если нужны)
- [ ] get_consistency_check без ошибок
- [ ] export_briefings по персонажу читается как цельная вводная
```

## Шаблон ответа мастеру

После выполнения задачи кратко сообщить:

```markdown
## Сделано
- [список изменений с именами сущностей]

## Проверка
- consistency: [OK / N ошибок]
- затронуто: N персонажей, M сюжетов

## Замечания
- [противоречия, незаполненные адаптации, нужные следующие шаги]
```

## Ошибки MCP

| Сообщение | Действие |
|-----------|----------|
| `401 Unauthorized` | Новый токен на `/mcp/auth` |
| `errors-forbidden-for-role` | Токен игрока — нужен организатор |
| `errors-forbidden-for-non-admin` | Нужен admin или другой tool |
| `errors-forbidden-for-non-editor` | Нужен редактор или снять режим редактора |
| `errors-entity-is-not-exist` | Проверить имя; выполнить `add_character_to_story` / `add_character_to_event` |
| `errors-organizer-is-not-an-owner` | Нет прав на чужую сущность |

## Дополнительно

- Полный список tools и параметры: [tools-reference.md](tools-reference.md)
- Настройка клиента: `packages/wiki/MCP_RU.md`
- Тесты MCP: `npm run test:mcp` и `npm run test:mcp:permissions` в `packages/nims-server`
