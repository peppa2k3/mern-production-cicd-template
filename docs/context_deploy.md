# Context triển khai — 2026-10-08

Code đã kết hợp workflow production của template-source với ứng dụng server/client. Chưa xác nhận một lần deploy GitHub/VPS.

```text
<root>/shared/server.env            # private, chmod 600
<root>/shared/current-images.env    # verified SHA + SERVER_IMAGE/CLIENT_IMAGE
<root>/shared/pending-release.env   # candidate + previous image refs
<root>/shared/deploy.lock           # flock cho deploy/cleanup
<root>/releases/<sha>/              # Compose + scripts/deploy.sh + verified images.env
<root>/current -> releases/<sha>    # chỉ đổi sau verify
```

CI local chạy MongoDB 4.0.28 + MinIO riêng. Push main/manual: changes → validate CI → build/push SHA GHCR → SSH apply → verify HTTPS → promote state; rollback nếu lỗi. Workflow được serialize toàn pipeline; pending record ngăn release khác can thiệp giữa apply/verify. Tag mutable production/Docker Hub không được tích hợp; VPS luôn chạy full SHA.

Production chỉ server/client. Health check ping MongoDB và kiểm tra bucket MinIO. Traefik route API/upload/Socket.IO cùng origin trực tiếp tới server; Nginx proxy dùng local/CI. Env/frontend build đã thống nhất cổng 5000 và VITE_API_BASE_URL.

Cần nghiệm thu bên ngoài: SSH/host key, domain/router, external networks, DNS storage, credential/bucket, registry pull, HTTPS health và rollback thật. Các thông tin IP/domain/trạng thái hoàn tất của dự án DND trong tài liệu nguồn không được dùng làm trạng thái của repo này.
