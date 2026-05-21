<p align="center">
  <img src="https://timeweb.cloud/favicon.svg" width="64" height="64" alt="Timeweb Cloud" />
</p>

<h1 align="center">Timeweb MCP Server</h1>

<p align="center">
  MCP-сервер для управления инфраструктурой Timeweb Cloud через AI-ассистенты
</p>

<p align="center">
  <a href="#быстрый-старт">Быстрый старт</a> &bull;
  <a href="#интеграции">Интеграции</a> &bull;
  <a href="#инструменты">Инструменты</a> &bull;
  <a href="#промпты">Промпты</a>
</p>

---

> **Experimental** — проект находится в активной разработке. Сервер не выполняет опасных операций (удаление, перезапись), но рекомендуется контролировать выполняемые действия.

## Возможности

- **Приложения** — создание и деплой frontend/backend приложений с автоопределением фреймворка
- **Базы данных** — создание MySQL, PostgreSQL, Redis, MongoDB, ClickHouse, Kafka, RabbitMQ и OpenSearch
- **Сеть** — управление VPC и Floating IP с DDoS-защитой
- **VCS** — подключение Git, GitHub, GitLab, Bitbucket репозиториев
- **Авто-конфигурация** — автоматический выбор пресетов, настроек деплоя и параметров сборки

## Быстрый старт

### Получение API-токена

1. Перейдите в [Панель управления Timeweb Cloud](https://timeweb.cloud/my/api-keys)
2. Создайте новый API-ключ
3. Скопируйте токен — он понадобится для настройки

### Установка

```bash
npx timeweb-mcp-server
```

Или глобально:

```bash
npm install -g timeweb-mcp-server
```

## Интеграции

### Claude Code

Добавьте сервер через CLI:

```bash
claude mcp add timeweb-mcp-server -- npx timeweb-mcp-server
```

Затем установите переменную окружения `TIMEWEB_TOKEN`. Добавьте в файл `~/.claude/.env`:

```
TIMEWEB_TOKEN=your-api-token
```

Или передайте токен напрямую при добавлении:

```bash
claude mcp add timeweb-mcp-server -e TIMEWEB_TOKEN=your-api-token -- npx timeweb-mcp-server
```

Проверьте, что сервер подключён:

```bash
claude mcp list
```

### Claude Desktop

Добавьте в конфигурационный файл `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "timeweb-mcp-server": {
      "command": "npx",
      "args": ["timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Cursor

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=timeweb-mcp-server&config=eyJjb21tYW5kIjoibnB4IHRpbWV3ZWItbWNwLXNlcnZlciIsImVudiI6eyJUSU1FV0VCX1RPS0VOIjoieW91ci1hcGktdG9rZW4ifX0%3D)

Или добавьте в `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "timeweb-mcp-server": {
      "command": "npx",
      "args": ["timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-api-token"
      }
    }
  }
}
```

### VS Code

[Установить в VS Code](vscode:mcp/install?%7B%22timeweb-mcp-server%22%3A%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22timeweb-mcp-server%22%5D%2C%22env%22%3A%7B%22TIMEWEB_TOKEN%22%3A%22your-api-token%22%7D%7D%7D)

Или добавьте в `.vscode/mcp.json`:

```json
{
  "mcp.servers": {
    "timeweb-mcp-server": {
      "command": "npx",
      "args": ["timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Windsurf

Добавьте в `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "timeweb-mcp-server": {
      "command": "npx",
      "args": ["timeweb-mcp-server"],
      "env": {
        "TIMEWEB_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Инструменты

### Приложения

| Инструмент | Описание |
|---|---|
| `create_timeweb_app` | Создание приложения с автоопределением типа, фреймворка и настроек деплоя |
| `get_allowed_presets` | Список доступных пресетов (CPU, RAM, диск, цена) |
| `get_deploy_settings` | Настройки сборки и запуска по умолчанию для каждого фреймворка |

### VCS-провайдеры

| Инструмент | Описание |
|---|---|
| `add_vcs_provider` | Подключение Git-репозитория (поддержка приватных через токен) |
| `get_vcs_providers` | Список подключённых VCS-провайдеров |
| `get_vcs_provider_repositories` | Список репозиториев провайдера |
| `get_vcs_provider_by_repository_url` | Поиск провайдера по URL репозитория |

### Базы данных

| Инструмент | Описание |
|---|---|
| `create_database` | Создание БД (MySQL, PostgreSQL, Redis, MongoDB, ClickHouse, Kafka, RabbitMQ, OpenSearch) |
| `get_database_presets` | Доступные конфигурации для каждого типа БД |

### Сеть

| Инструмент | Описание |
|---|---|
| `create_vpc` | Создание виртуальной приватной сети с CIDR-подсетью |
| `create_floating_ip` | Создание Floating IP с опциональной DDoS-защитой |
| `get_vpcs` | Список всех VPC пользователя |

## Промпты

| Промпт | Описание |
|---|---|
| `create_app_prompt` | Пошаговый сценарий создания приложения: анализ проекта, определение фреймворка, настройка VCS и деплой |
| `add_vcs_provider_prompt` | Сценарий подключения Git-репозитория с обработкой авторизации для приватных репозиториев |

## Использование

Просто скажите AI-ассистенту:

```
Задеплой мое приложение в Timeweb Cloud
```

Сервер автоматически:
1. Определит тип приложения и фреймворк по структуре проекта
2. Получит Git-информацию (репозиторий, ветка, коммит)
3. Подберёт оптимальный пресет и настройки деплоя
4. Подключит VCS-провайдер (или создаст новый)
5. Создаст приложение в Timeweb Cloud

> **Важно:** После создания приложения необходимо настроить переменные окружения в [панели управления Timeweb Cloud](https://timeweb.cloud), так как MCP-сервер не имеет доступа к файлу `.env` вашего проекта.

## Поддерживаемые фреймворки

**Frontend:** React, Vue, Angular, Svelte, Next.js, Nuxt, Gatsby, Vite, Static HTML

**Backend:** Express, Fastify, Nest.js, Django, Flask, FastAPI, Laravel, Spring Boot, Docker, docker-compose и другие

## Разработка

```bash
# Установка зависимостей
npm install

# Проверка типов
npm run type-check

# Сборка
npm run build

# Запуск
npm start

# Отладка через MCP Inspector
npm run inspect
```

## Лицензия

UNLICENSED
