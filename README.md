# Timeweb MCP Server (Experimental)

MCP сервер для автоматизации деплоя приложений в Timeweb Cloud через Model Context Protocol.

> **`ВАЖНО`** Проект находится в экспериментальном режиме и может содержать нестабильный функционал. Возможны сбои и неполная реализация возможностей. Сервер спроектирован без опасных операций, однако рекомендуется контролировать выполняемые действия.

## Интеграция

### Cursor

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=timeweb-mcp-server&config=eyJjb21tYW5kIjoibnB4IEB0aW1ld2ViX2Nsb3VkL3RpbWV3ZWItbWNwLXNlcnZlciIsImVudiI6eyJUSU1FV0VCX1RPS0VOIjoieW91ci1hcGktdG9rZW4ifX0%3D)

Или добавьте в настройки Cursor `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "timeweb-mcp-server": {
      "command": "npx",
      "args": ["@timeweb_cloud/timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-api-token"
      }
    }
  }
}
```

### VS Code

[Добавить в VSCode](vscode:mcp/install?%7B%22timeweb-mcp-server%22%3A%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40timewb_cloud%2Ftimeweb-mcp-server%22%5D%2C%22env%22%3A%7B%22TIMEWEB_TOKEN%22%3A%22your-api-token%22%7D%7D%7D), либо добавьте в настройки `.vscode/mcp.json`:

```json
{
  "mcp.servers": {
    "timeweb-mcp-server": {
      "command": "npx",
      "args": ["@timewb_cloud/timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-api-token"
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
      "args": ["@timewb_cloud/timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-api-token"
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
