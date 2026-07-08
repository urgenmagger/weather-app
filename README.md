# Weather App

Приложение «Погода в избранных городах». Пользователь выбирает города, видит актуальную погоду. Бэкенд кеширует данные с внешнего API, фронт работает только с собственным API.

Демо: http://weather.urgenmagger.ru

## Стек

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Express + TypeScript + Prisma + PostgreSQL
- **Scheduler**: node-cron (периодический опрос open-meteo)

## Запуск

```bash
# 1. PostgreSQL
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env   # или используй существующий .env
pnpm install
pnpm db:push
pnpm dev               # http://localhost:3000

# 3. Frontend
cd frontend
pnpm install
pnpm dev               # http://localhost:5174
```

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/cities` | Список городов + погода + `serviceAvailable` + `stale` |
| POST | `/api/cities` | Добавить город `{ name, latitude, longitude }` |
| DELETE | `/api/cities/:id` | Удалить город |
| GET | `/api/geo?q=...` | Поиск городов через open-meteo geocoding |
| POST | `/api/sync` | Принудительная синхронизация погоды |
| GET | `/api/health` | Проверка доступности |

### Stale-флаг

Если последняя синхронизация завершилась ошибкой и погода старше 30 минут — `currentWeather.stale: true`. Фронт показывает предупреждение.

## Debug

**Симуляция недоступности сервиса погоды:**

```bash
curl -X POST http://localhost:3000/api/debug/set-unavailable
```

Или двойной клик по зелёному индикатору в интерфейсе.

После этого `serviceAvailable` станет `false`, индикатор — серым. Если погода старше 30 минут — появится жёлтая плашка на карточках.
