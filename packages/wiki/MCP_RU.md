# НИМС: настройка MCP на клиенте

MCP (Model Context Protocol) позволяет подключить AI-ассистент к запущенному серверу НИМС: читать и редактировать персонажей, сюжеты, события, отношения, выгружать и загружать базу и квенты (вводные). Подойдёт любой MCP-клиент с поддержкой **Streamable HTTP** (IDE, десктопное приложение, CLI).

Сервер должен работать в **server-режиме** (`npm run watch:server` или Docker). MCP встроен в `nims-server` и не требует отдельного процесса.

## Быстрый старт

1. Запустите сервер НИМС (по умолчанию порт **3001**).
2. Откройте в браузере: `http://localhost:3001/mcp/auth`
3. Войдите учётной записью организатора (по умолчанию `admin` / `zxpoYR65`).
4. Скопируйте выданный **Bearer-токен**.
5. Укажите параметры подключения в конфигурации вашего MCP-клиента (см. ниже).
6. Перезапустите клиент или обновите список MCP-серверов.

Токен живёт **24 часа** (настраивается в `packages/nims-server/config/nims-frontend-global.json`, ключ `mcp.tokenTtlMs`). По истечении срока получите новый на `/mcp/auth`.

## Получение токена через API

```bash
curl -s -X POST http://localhost:3001/mcp/auth \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"zxpoYR65"}'
```

Ответ: `{"token":"<uuid>","user":{"name":"admin","role":"organizer"}}`.

## Два режима MCP

| Endpoint | Назначение |
|----------|------------|
| `http://localhost:3001/mcp` | Полный доступ: чтение и запись |
| `http://localhost:3001/mcp/readonly` | Только чтение (безопаснее для повседневной работы) |

Оба требуют заголовок `Authorization: Bearer <token>`.

Транспорт: **Streamable HTTP** (спецификация MCP 2025).

## Настройка MCP-клиента

Клиент должен подключаться по **HTTP** к одному из endpoint'ов ниже. Обязательный заголовок:

```
Authorization: Bearer <ваш-токен>
```

Рекомендуется хранить токен в переменной окружения, а не в файле конфигурации в репозитории:

```bash
export NIMS_MCP_TOKEN="ваш-токен-с-страницы-mcp-auth"
```

### Параметры подключения

| Параметр | Значение |
|----------|----------|
| Транспорт | Streamable HTTP (MCP) |
| URL (полный доступ) | `http://localhost:3001/mcp` |
| URL (только чтение) | `http://localhost:3001/mcp/readonly` |
| Заголовок | `Authorization: Bearer <token>` |
| Content-Type запросов | `application/json` |
| Accept | `application/json, text/event-stream` |

Если сервер на другой машине, замените `localhost:3001` на URL инстанса (через nginx — тот же хост, что и веб-интерфейс НИМС).

### Пример JSON-конфигурации

Многие MCP-клиенты принимают объект `mcpServers` с полями `url` и `headers`. Подставьте свой способ подстановки переменных окружения (синтаксис зависит от клиента):

```json
{
  "mcpServers": {
    "nims": {
      "url": "http://localhost:3001/mcp",
      "headers": {
        "Authorization": "Bearer <NIMS_MCP_TOKEN>"
      }
    },
    "nims-readonly": {
      "url": "http://localhost:3001/mcp/readonly",
      "headers": {
        "Authorization": "Bearer <NIMS_MCP_TOKEN>"
      }
    }
  }
}
```

Имеет смысл завести **два** подключения: полное и read-only — и включать запись только когда она нужна.

Точное имя файла конфигурации и путь к нему смотрите в документации вашего MCP-клиента.

## Docker (локальный тест)

```bash
docker compose -f docker-compose.test.yml up --build
```

Сервер: `http://localhost:3001`, MCP: `http://localhost:3001/mcp`.

## Права доступа

- Большинство операций доступны любому **организатору** (роль после `/login`).
- **Импорт базы** (`import_database`, `load_database_preset`) — только **admin** (пользователь `admin` по умолчанию).
- MCP-авторизация использует те же учётные записи, что и веб-интерфейс.

## Инструменты (tools)

### База и квенты

| Tool | Режим | Описание |
|------|-------|----------|
| `export_database` | read | Выгрузить базу JSON (без `ManagementInfo` по умолчанию) |
| `import_database` | write, admin | Загрузить базу из JSON |
| `export_quents` | read | Квенты (вводные): JSON или `format: markdown` |
| `import_quents` | write | Обновить адаптации событий из JSON квентов |
| `load_database_preset` | write, admin | Пресеты: `empty`, `demo`, `negriat` |
| `list_database_presets` | read | Список пресетов |
| `get_consistency_check` | read | Проверка целостности базы |

### Персонажи, сюжеты, события

| Tool | Режим | Описание |
|------|-------|----------|
| `list_characters`, `get_character`, `create_character`, … | read / write | Профили персонажей |
| `list_stories`, `get_story`, `create_story`, … | read / write | Сюжеты и мастер-тексты |
| `create_event`, `set_event_adaptation`, … | write | События и адаптации |
| `get_relation`, `create_relation`, … | read / write | Отношения между персонажами |
| `list_groups`, `get_group`, `create_group` | read / write | Группы |

### Мета и отчёты

| Tool | Режим | Описание |
|------|-------|----------|
| `get_meta`, `set_meta` | read / write | Название игры, даты, описание |
| `search_text` | read | Полнотекстовый поиск |
| `get_statistics` | read | Статистика проекта |
| `get_briefing` | read | Квенты (JSON, как `export_quents`) |
| `get_character_report` | read | Отчёт по персонажу |

Полный список — в исходниках `packages/nims-server/mcp/tools/`.

## Ресурсы (resources)

| URI | Содержимое |
|-----|------------|
| `nims://meta` | Мета проекта |
| `nims://characters` | Список персонажей |
| `nims://stories` | Список сюжетов |
| `nims://character/{name}` | Профиль персонажа |
| `nims://story/{name}` | Полный сюжет |
| `nims://database` | Выгрузка базы (без ManagementInfo) |
| `nims://quents` | Все квенты JSON |

## Типичные сценарии

**Просмотр проекта без риска записи** — подключите только `nims-readonly`.

**Массовое наполнение сюжета** — `nims` (full): создание персонажей, сюжетов, `set_event_adaptation`.

**Резервная копия** — `export_database`, сохранить JSON в файл.

**Восстановление / перенос** — `import_database` (admin), с `preserveManagementInfo: true` по умолчанию — пользователи сервера не затрутся.

**Редактирование вводных вне НИМС** — `export_quents` с `format: markdown` → правки → `import_quents`.

## Устранение неполадок

| Симптом | Решение |
|---------|---------|
| `401 Unauthorized` | Новый токен на `/mcp/auth`, проверьте заголовок `Authorization` |
| MCP не видит tools | Перезапустите клиент; проверьте URL, токен и что сервер запущен |
| `import_database` отклонён | Войдите как **admin** |
| Огромный ответ `export_database` | Нормально для больших игр; используйте resource `nims://database` или выборочные tools |

## Безопасность

- MCP даёт доступ к данным игры на уровне организатора — не публикуйте endpoint в интернет без защиты (VPN, nginx + TLS, firewall).
- Токены одноразово по смыслу сессии — храните как пароль.
- Для продакшена смените пароль `admin` в интерфейсе НИМС.

## См. также

- [CONTRIBUTING.md](CONTRIBUTING.md) — сборка и разработка
- [NIMS_RU.md](NIMS_RU.md) — общее описание НИМС
- `packages/nims-server/mcp/` — исходный код MCP-сервера
