# Triển khai qua Traefik hiện có

Adapted from `template-source/DEPLOY_GUIDES.md`; đường dẫn và schema khớp ứng dụng Affiliate.

1. Xác nhận DNS cho `APP_DOMAIN` và `API_DOMAIN`; Traefik, HTTPS entrypoint/cert resolver và external network đã hoạt động. Không để router/project khác chiếm domain hoặc `APP_NAME`.
2. Xác nhận MongoDB **4.0** và MinIO có sẵn trên private network, dùng DNS nội bộ trong `MONGO_URI`/`MINIO_ENDPOINT`. Chỉ cấp database/bucket riêng cho ứng dụng. Backend cần quyền tạo bucket ứng dụng nếu bucket chưa tồn tại.
3. Tạo thư mục `<deploy-root>/shared` và `<deploy-root>/releases` do user `deploy` sở hữu, quyền `700`. VPS cần Docker Compose hỗ trợ `--wait`, Bash, curl, flock và GNU coreutils.
4. Sao chép [.env.example](.env.example) thành `<deploy-root>/shared/server.env`, điền toàn bộ giá trị, `chmod 600`. Sinh ba secret JWT/cookie khác nhau, mỗi secret ít nhất 32 ký tự. `CLIENT_URL=https://<APP_DOMAIN>`. Không gửi env qua CI.
5. Đăng nhập GHCR trên VPS dưới user deploy với credential chỉ cần pull package. Workflow publish `ghcr.io/<owner>/<repo>-server:<40-char-sha>` và `...-client:<40-char-sha>`.
6. Tạo GitHub Environment `production`, chỉ cho `main` deploy. Secrets: `VPS_HOST`, `VPS_PORT` (mặc định 22), `VPS_USER` (mặc định deploy), `VPS_DEPLOY_PATH`, `VPS_SSH_PRIVATE_KEY`, **`VPS_SSH_KNOWN_HOSTS`**. Đối chiếu host key qua console VPS trước khi lưu; cổng khác 22 dùng dòng `[host]:port`.
7. Lần đầu chạy workflow manual trên `main` để build cả hai image. Các lần sau push code build phần bị ảnh hưởng; thay đổi hạ tầng build cả hai. Thay đổi tài liệu không tự deploy.

Production Compose chỉ có server/client, không publish host port, không tạo volume MongoDB/MinIO. Backend nối mạng Traefik và private storage. Traefik route site `/api/`, `/uploads/`, `/socket.io/` trực tiếp tới API; API domain cũng tới API. Frontend dùng API cùng origin; một proxy hop tới API. MinIO bucket private, media sản phẩm public qua API; không cần public MinIO endpoint.

Sau deploy, khởi tạo role một lần rồi cấp admin cho email đã đăng ký:

```sh
docker exec <app-name>-server-1 npm run seed:roles
docker exec <app-name>-server-1 npm run set-admin -- your-email@example.com super_admin
```

Apply pull image và ghi pending trước khi chạy hai service; verify kiểm tra container healthy cùng HTTPS site, site `/api/health` và API domain `/api/health`. Thành công mới đổi state/symlink. Lỗi apply hoặc verify tự phục hồi bản verified trước; lần đầu lỗi chỉ xóa container ứng dụng candidate. Workflow vẫn báo lỗi khi rollback thành công.

Rollback thủ công:

```sh
bash /srv/apps/myapp/current/scripts/deploy.sh manual-rollback /srv/apps/myapp <verified-full-sha>
```

Script từ chối manifest chứa service lưu trữ hoặc project đã có container mà thiếu state. Bản cũ cần kế hoạch chuyển traffic/state riêng; không dựng state giả từ tag chưa kiểm chứng. Rollback image không đảo schema/tệp, cần backup/restore MongoDB và MinIO nhất quán. Tệp upload trên đĩa của bản cũ cần di chuyển có kiểm chứng hoặc tiếp tục cung cấp URL cũ từ hạ tầng riêng trước khi chuyển sang MinIO; không tự xóa hay import dữ liệu thật.

Xem [state triển khai](docs/context_deploy.md), [adoption](docs/adopting-this-template.md) và [kết quả tích hợp](docs/template-integration.md). Chưa nghiệm thu trên GitHub/VPS.
