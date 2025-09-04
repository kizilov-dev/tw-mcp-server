# Timeweb MCP Server

MCP сервер для автоматизации деплоя приложений в Timeweb Cloud через Model Context Protocol.

## Интеграция

### Cursor

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=timeweb-mcp-server&config=eyJjb21tYW5kIjoibnB4IEB5b3VyLW9yZy90aW1ld2ViLW1jcC1zZXJ2ZXIiLCJlbnYiOnsiVElNRVdFQl9UT0tFTiI6InlvdXItdG9rZW4ifX0%3D)

Или добавьте в настройки Cursor:

```json
{
  "mcpServers": {
    "timeweb-mcp-server": {
      "command": "npx",
      "args": ["@your-org/timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-token"
      }
    }
  }
}
```

### VS Code

[Добавить в VSCode](vscode:mcp/install?%7B%22mcpServers%22%3A%7B%22timeweb-mcp-server%22%3A%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40your-org%2Ftimeweb-mcp-server%22%5D%2C%22env%22%3A%7B%22TIMEWEB_TOKEN%22%3A%22your-token%22%7D%7D%7D%7D), либо добавьте в настройки:

```json
{
  "mcp.servers": {
    "timeweb-mcp-server": {
      "command": "npx",
      "args": ["@your-org/timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-token"
      }
    }
  }
}
```

### Claude Desktop

Добавьте в `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "timeweb-mcp-server": {
      "command": "npx",
      "args": ["@your-org/timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-token"
      }
    }
  }
}
```

## Инструменты

### `create_timeweb_app`

Создает приложение в Timeweb Cloud с автоматическим определением параметров проекта.

### `add_vcs_provider`

Добавляет VCS провайдер для подключения Git репозиториев.

### `get_vcs_providers`

Получает список всех VCS провайдеров.

### `get_vcs_provider_repositories`

Получает список репозиториев провайдера.

### `get_vcs_provider_by_repository_url`

Находит VCS провайдер по URL репозитория.

### `get_allowed_presets`

Получает список доступных пресетов для создания приложения.

### `get_deploy_settings`

Получает настройки деплоя по умолчанию для различных фреймворков.

## Промпты

### `create_app_prompt`

Помогает создать приложение в Timeweb Cloud с автоматическим определением параметров проекта.

### `add_vcs_provider_prompt`

Помогает добавить VCS провайдер для подключения репозитория.

## Использование

Запустите промпты, либо просто напишите: "Запусти мое приложение в таймвеб" - сервер автоматически определит тип приложения, фреймворк и создаст его в Timeweb Cloud.

## Важно

После создания приложения необходимо вручную настроить переменные окружения в панели управления Timeweb Cloud, так как у чатбота нет доступа к файлу `.env` вашего проекта.
