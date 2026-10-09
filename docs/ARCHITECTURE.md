# Kiến trúc

Local: browser → Nginx/React → Express → MongoDB 4.0.28 + MinIO local.

Production: browser → Traefik HTTPS → client hoặc server → private storage network → MongoDB 4.0 + MinIO dùng chung. Compose app không sở hữu dịch vụ lưu trữ.

- client/src/pages/components: giao diện Affiliate, KOL và quản trị.
- client/src/features: API và React Query hooks; auth store giữ access JWT trong bộ nhớ.
- server/src/modules: route/validator/controller/service/repository/model của từng nghiệp vụ.
- server/src/config: env, database, MinIO, logger, Socket.IO.
- scripts/deploy.sh: release immutable, pending/verified state, rollback app.
- server/scripts: bootstrap role/admin và smoke test local/CI.

RBAC dùng User.role tham chiếu Role và permissions hiện tại từ database. JWT có kind và sessionVersion; thay đổi mật khẩu/role/trạng thái thu hồi phiên. Refresh token có jti và hash lưu theo user. Socket.IO xác thực User/role trước khi join room; roleId do client gửi không được phép mở room khác.

File registry hỗ trợ local/minio. Khi bật MinIO, multer lưu tạm trên đĩa, service chuyển object vào bucket riêng rồi ghi metadata; upload thành công/lỗi đều dọn tệp tạm, lỗi metadata xóa object vừa tạo. Media sản phẩm giữ public, đi qua API cùng origin; bucket không public. Tính năng private share/quota của template DND không thuộc model ứng dụng hiện tại.
