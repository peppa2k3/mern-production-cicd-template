# MERN Production CI/CD Template

Ứng dụng Affiliate/KOL dùng React/Vite (`client/`), Express CommonJS (`server/`) và MongoDB. Các mẫu trong [template-source](template-source/) đã được tích hợp vào source hiện tại, ưu tiên quy trình triển khai và lưu trữ của mẫu.

## Chạy local

Yêu cầu Node.js 22 và Docker Engine + Compose v2.

```sh
npm run init:env
npm run local:up
docker compose --env-file server/.env exec server npm run seed:roles
```

Mở **http://localhost:8080**. Compose local gồm MongoDB **4.0.28**, MinIO, API cổng nội bộ **5000** và Nginx. MongoDB/MinIO dùng volume riêng; chỉ web và MinIO bind loopback. Muốn đổi cổng: đặt `WEB_PORT`, `MINIO_API_PORT`, `MINIO_CONSOLE_PORT` trong `server/.env`.

Script khởi tạo sinh secret ngẫu nhiên, không in secret và giữ nguyên các file `.env` đã có. Với repo đã có env, bổ sung key còn thiếu từ [server/.env.example](server/.env.example), nhất là `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` và `MINIO_BUCKET`. Không ghi đè secret hiện tại.

Đăng ký tài khoản trên giao diện, sau đó chủ động cấp quyền cho email đã tồn tại:

```sh
docker compose --env-file server/.env exec server npm run set-admin -- your-email@example.com super_admin
```

Đăng ký công khai vẫn tạo KOL chờ duyệt. Container không tự tạo admin hoặc seed dữ liệu demo. `seed:roles` chỉ thêm role chưa có, giữ quyền đã tùy chỉnh. Muốn dữ liệu demo **chỉ ở local**, đặt `SUPER_ADMIN_PASSWORD` riêng và chạy `npm run seed` trong server container.

Chạy trực tiếp Node/Vite: `npm ci` trong từng thư mục rồi `npm run dev`; cấu hình `MONGO_URI` thích hợp. `UPLOAD_STORAGE=local` giữ cơ chế tệp trên đĩa; Compose chọn `minio`. Vite proxy `/api`, `/uploads` và Socket.IO tới API; frontend build dùng `VITE_API_BASE_URL=/api/v1`, `VITE_SOCKET_URL=/`.

## Những phần đã tích hợp

- [docker-compose.yml](docker-compose.yml): bốn service local/CI, MongoDB 4.0 và MinIO.
- [docker-compose.prod.yml](docker-compose.prod.yml): **chỉ server/client**, nối Traefik và private storage network đã tồn tại trên VPS.
- [scripts/deploy.sh](scripts/deploy.sh): `apply → verify → rollback`, ref image full SHA, release/state riêng và chỉ promote sau kiểm tra HTTPS.
- [.github/workflows/ci.yml](.github/workflows/ci.yml): lint/build, kiểm thử deploy mô phỏng và smoke thật trên Compose local.
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml): push `main` hoặc manual → validate → build/push GHCR → SSH apply → verify; hỗ trợ chỉ build phần thay đổi. `develop`/PR chạy CI.
- [scripts/init-env.cjs](scripts/init-env.cjs), [server/scripts/set-admin.js](server/scripts/set-admin.js): secret ngẫu nhiên và bootstrap admin bằng thao tác vận hành có audit.
- Upload MinIO: metadata ở MongoDB, tệp ở bucket riêng; URL media cùng origin qua API, không cần public bucket. Tệp sản phẩm giữ hành vi public của ứng dụng Affiliate.
- JWT access giữ trong bộ nhớ frontend; refresh cookie httpOnly xoay vòng với ID riêng. Đổi mật khẩu, role hoặc trạng thái tài khoản thu hồi phiên cũ.
- [scripts/generate-pwa-icons.cjs](scripts/generate-pwa-icons.cjs), manifest và icon web app. Chạy `npm ci --prefix server` rồi `npm run icons` để dựng lại icon. Chưa có service worker/offline cache.

`template-source` là nguồn tham chiếu được giữ nguyên. Các tài liệu của mẫu mô tả một ứng dụng DND Drop Space khác và nhiều file không được cung cấp. Note/folder/tag, quota, collaboration, OTP/Google Login, theme và i18n của ứng dụng đó **chưa được triển khai** từ bộ mẫu này; không coi các trạng thái hoàn tất trong tài liệu nguồn là kết quả của repo hiện tại. Theo dõi phạm vi ở [docs/template-integration.md](docs/template-integration.md).

## Production

Đọc [DEPLOY_GUIDES.md](DEPLOY_GUIDES.md) và [docs/deployment.md](docs/deployment.md). Secret runtime nằm tại `<deploy-root>/shared/server.env` trên VPS, theo [.env.example](.env.example), quyền `600`; CI chỉ chuyển Compose/script và image. Domain, network, entrypoint và cert resolver đều cấu hình theo VPS thực.

API readiness `GET /api/health` và `GET /api/v1/health` ping MongoDB và kiểm tra bucket MinIO; `/health` là liveness. Frontend và API phải có HTTPS hoạt động trước khi verify release.

Rollback chỉ khôi phục image ứng dụng. Khi chuyển bản cũ, cần backup MongoDB và tệp, chuẩn bị network/state và migration tệp riêng; không dùng volume từng chạy MongoDB mới hơn với MongoDB 4.0. Thay đổi định dạng JWT khiến phiên cũ cần đăng nhập lại. Chưa có xác nhận deploy GitHub/VPS thực.

## Kiểm tra

```sh
npm ci --prefix server
npm ci --prefix client
npm run lint --prefix server
npm run lint --prefix client
npm run test:config --prefix server
npm run build --prefix client
bash scripts/test-deploy-flow.sh
docker compose --env-file server/.env exec server npm run seed:roles
docker compose --env-file server/.env exec -e SMOKE_BASE_URL=http://client server npm run test:smoke
docker compose --env-file server/.env exec server node scripts/test-readiness.js
git diff --check
```

Smoke test tạo/xóa tài khoản và tệp kiểm thử riêng, chỉ được dùng với local/CI. `npm run local:stop` dừng service và giữ dữ liệu.
