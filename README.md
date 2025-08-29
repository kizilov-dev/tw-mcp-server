# Timeweb MCP Server

MCP сервер для автоматизации деплоя приложений в Timeweb Cloud. Этот сервер предоставляет набор инструментов для управления ресурсами Timeweb через Model Context Protocol.

## Возможности

- Создание новых Apps в Timeweb Cloud

## Требования

- Node.js >= 20.0.0
- npm

## Установка

1. Клонируйте репозиторий:

```bash
git clone <your-repo-url>
cd mcp-server
```

2. Установите зависимости:

```bash
npm install
```

3. Настройте переменные окружения:

```bash
# export TIMEWEB_TOKEN="your-timeweb-token"
```

## Разработка

### Сборка проекта

```bash
npm run build
```

### Режим разработки с автоматической пересборкой

```bash
npm run dev
```

### Проверка типов

```bash
npm run type-check
```

### Линтинг

```bash
npm run lint
npm run lint:fix
```

### Форматирование кода

```bash
npm run format
```

## Использование

### Cursor

Добавьте следующую конфигурацию в `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "timeweb-mcp-server": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

### VS Code

Добавьте следующую конфигурацию в `.vscode/mcp.json`:

```json
{
  "servers": {
    "timeweb-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

## Доступные инструменты

### `create_timeweb_app`

Создает новое приложение в Timeweb Cloud с автоматическим деплоем.

**Параметры:**

- `repository_url` (обязательный) - URL репозитория
- `app_name` (обязательный) - название приложения
- `app_type` (обязательный) - тип приложения (frontend/backend)
- `framework` (обязательный) - фреймворк приложения
- `preset_id` (обязательный) - ID пресета приложения
- `branch` - ветка для деплоя (по умолчанию: master)
- `build_command` - команда для сборки
- `run_command` - команда для запуска
- `index_directory` - директория с index файлом
- `auto_deploy` - автоматический деплой (по умолчанию: false)
- `project_id` - ID проекта
- `comment` - комментарий к приложению
- `envs` - переменные окружения
- `system_dependencies` - системные зависимости

### `add_vcs_provider`

Добавляет новый VCS провайдер.

**Параметры:**

- `provider_type` (обязательный) - тип провайдера (git)
- `url` (обязательный) - URL репозитория
- `login` - логин для доступа
- `password` - пароль или токен

### `get_vcs_providers`

Получает список всех VCS провайдеров.

### `get_vcs_provider_repositories`

Получает список репозиториев провайдера.

## Примеры использования

### Создание Next.js приложения

```
Создай мое приложение в Timeweb Cloud.
```
