# NIMS: MCP client setup

MCP (Model Context Protocol) connects an AI assistant to a running NIMS server: read and edit characters, stories, events, relations, export/import the database and player briefings. Any MCP client with **Streamable HTTP** support will work.

The server must run in **server mode** (`npm run watch:server` or Docker). MCP is embedded in `nims-server` — no separate process.

## Quick start

1. Start the NIMS server (default port **3001**).
2. Open `http://localhost:3001/mcp/auth` in a browser.
3. Log in as an organizer (default `admin` / `zxpoYR65`).
4. Copy the **Bearer token**.
5. Configure your MCP client (see below).
6. Restart the client or refresh the MCP server list.

Token TTL is **24 hours** by default (`mcp.tokenTtlMs` in `packages/nims-server/config/nims-frontend-global.json`). Get a new one at `/mcp/auth` when it expires.

## Token via API

```bash
curl -s -X POST http://localhost:3001/mcp/auth \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"zxpoYR65"}'
```

Response: `{"token":"<uuid>","user":{"name":"admin","role":"organizer"}}`.

## Two MCP endpoints

| Endpoint | Purpose |
|----------|---------|
| `http://localhost:3001/mcp` | Full access: read and write |
| `http://localhost:3001/mcp/readonly` | Read-only (safer for daily use) |

Both require `Authorization: Bearer <token>`.

Transport: **Streamable HTTP** (MCP 2025 spec).

## MCP client configuration

Connect over **HTTP** to one of the endpoints below. Required header:

```
Authorization: Bearer <your-token>
```

Store the token in an environment variable rather than committing it:

```bash
export NIMS_MCP_TOKEN="your-token-from-mcp-auth-page"
```

### Connection parameters

| Parameter | Value |
|-----------|-------|
| Transport | Streamable HTTP (MCP) |
| URL (full access) | `http://localhost:3001/mcp` |
| URL (read-only) | `http://localhost:3001/mcp/readonly` |
| Header | `Authorization: Bearer <token>` |
| Request Content-Type | `application/json` |
| Accept | `application/json, text/event-stream` |

Replace `localhost:3001` with your server URL when remote.

### Example JSON configuration

Many MCP clients accept an `mcpServers` object with `url` and `headers`. Substitute env vars using your client's syntax:

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

Use two entries (full + read-only) and enable write access only when needed. See your MCP client's docs for the config file location.

## Docker (local test)

```bash
docker compose -f docker-compose.test.yml up --build
```

Server: `http://localhost:3001`, MCP: `http://localhost:3001/mcp`.

## Permissions

- Most tools: any **organizer** account.
- **Database import** (`import_database`, `load_database_preset`): **admin** only (default `admin` user).
- MCP auth uses the same accounts as the web UI.

## Tools overview

### Database and briefings

| Tool | Mode | Description |
|------|------|-------------|
| `export_database` | read | Export full JSON (excludes `ManagementInfo` by default) |
| `import_database` | write, admin | Import database from JSON |
| `export_briefings` | read | Player briefings: JSON or `format: markdown` |
| `import_briefings` | write | Apply event adaptations from briefing JSON |
| `load_database_preset` | write, admin | Presets: `empty`, `demo`, `negriat` |
| `list_database_presets` | read | List presets |
| `get_consistency_check` | read | Schema consistency check |

### Characters, stories, events

Characters, stories, events, relations, and groups — see `packages/nims-server/mcp/tools/`.

### Meta and reports

`get_meta`, `set_meta`, `search_text`, `get_statistics`, `get_briefing`, `get_character_report`.

## Resources

| URI | Content |
|-----|---------|
| `nims://meta` | Project meta |
| `nims://characters` | Character list |
| `nims://stories` | Story list |
| `nims://character/{name}` | Character profile |
| `nims://story/{name}` | Full story |
| `nims://database` | Database export |
| `nims://briefings` | All briefings JSON |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `401 Unauthorized` | New token from `/mcp/auth` |
| No tools visible | Restart client; check URL, token, and server |
| `import_database` denied | Log in as **admin** |

## Security

- MCP exposes organizer-level access — do not expose publicly without TLS and access control.
- Treat tokens like passwords.

## See also

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [NIMS_EN.md](NIMS_EN.md)
- `packages/nims-server/mcp/`
