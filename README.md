# Auto Media backend express

# 環境變數

| Variable                    | Description                                                   | Example                      |
| --------------------------- | ------------------------------------------------------------- | ---------------------------- |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Message API channel access token                         | `AV+kYb...`                  |
| `LINE_CHANNEL_SECRET`       | LINE Message API channel secret                               | `c8567f...`                  |
| `JWT_SECRET`                | JWT secret                                                    | `c8567f...`                  |
| `IG_USERNAME`               | Instagram user name                                           | `ig_fake_username`           |
| `IG_PASSWORD`               | Instagram user password                                       | `ig_fake_password`           |
| `MONGODB_URL`               | Mongodb connect url                                           | `mongodb://localhost:27017/` |
| `MONGODB_NAME`              | Mongodb name                                                  | `am-db`                      |
| `TWITTER_API_KEY`           | Twitter API key                                               | `RgcSi3...`                  |
| `TWITTER_API_SECRET`        | Twitter API secret                                            | `PSkXrb...`                  |
| `ADMIN_LINE_ID`             | 管理者的 LINE Id(透過 LINE SDK 取得)，用來回報 exception 訊息 | `Ud786...`                   |

# Docker Deploy

## Build Docker Image

```shell
docker build -t auto-media-backend-express .
```

## Docker Run

```shell
docker run -p 3002:3000 \
--restart=always --name=am-backend -d \
--env-file=YOUR_ENV_PATH \
auto-media-backend-express:{tag}
```

## Run with Docker Compose

```shell
docker-compose up
```
