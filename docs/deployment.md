# Triển khai và rollback

Hướng dẫn đầy đủ: [DEPLOY_GUIDES](../DEPLOY_GUIDES.md). Production dùng [docker-compose.prod.yml](../docker-compose.prod.yml), chỉ quản lý ứng dụng; local/CI dùng [docker-compose.yml](../docker-compose.yml) với MongoDB 4.0.28/MinIO riêng. Không trộn hai manifest.

GitHub workflow sử dụng image tag full SHA và SSH kiểm chứng host key. Secret runtime được đọc từ shared/server.env trên VPS; frontend build dùng API cùng origin. Nginx local proxy cổng 5000; production Traefik route API, upload và Socket.IO trực tiếp tới backend.

[scripts/deploy.sh](../scripts/deploy.sh) là implementation chính. Các đường dẫn trong deployment/scripts/deploy.sh và rollback.sh là wrapper cho CLI mới; không hỗ trợ định dạng tag sha-7-ký-tự/state .deployment cũ.

Cleanup image: dùng deployment/scripts/cleanup-images.sh với DEPLOY_PATH, IMAGE_REPOSITORIES và DRY_RUN=true trước. Script bảo vệ refs trong state hiện tại, pending và **mọi release verified được giữ lại**; chỉ xóa image full SHA không được tham chiếu trong hai repository app được chỉ định. Không prune dịch vụ dùng chung. Muốn giảm lịch sử rollback, người vận hành cần kế hoạch retention release riêng.

Không coi rollback là backup. Backup MongoDB/MinIO và diễn tập restore riêng trước vận hành public.
