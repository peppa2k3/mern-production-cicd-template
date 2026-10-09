# Áp dụng template vào ứng dụng hiện tại

Repo đã được ánh xạ backend → server, frontend/nginx → client. Giữ kiến trúc controller/service/repository, Joi và schema RBAC Role ObjectId của ứng dụng Affiliate. Không sao chép schema User.role dạng string hay tên miền DND từ template-source.

Mongoose được pin 7.8.12 để khớp MongoDB 4.0 theo [bảng tương thích chính thức](https://mongoosejs.com/docs/7.x/docs/compatibility.html). Volume local mới tên mongo40-data, không dùng lại volume từng chạy phiên bản cao hơn. Không có migration tự động dữ liệu production.

Local có bốn service; production chỉ có hai container app và external networks. Domain, tên project, Traefik network/storage network, entrypoint và resolver lấy từ private env. API giữ /api/v1, thêm readiness /api/health để tương thích mẫu. Các URL media hiện có trên đĩa cần kế hoạch migration riêng khi bật MinIO.

Các script npm ci giữ lockfile. Không seed demo khi khởi động container; bootstrap role/admin là CLI rõ ràng. Session JWT mới có kind/sessionVersion, refresh có jti; phiên từ bản cũ cần đăng nhập lại.

Nguồn template có tài liệu lịch sử, liên kết và tính năng không kèm code. Phạm vi đã thực hiện và giới hạn ở [template-integration](template-integration.md).
