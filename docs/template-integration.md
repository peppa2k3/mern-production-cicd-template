# Kết hợp template-source — 2026-10-08

Ưu tiên logic mẫu, giữ cấu trúc và nghiệp vụ Affiliate hiện tại. Nguồn tham chiếu được giữ nguyên trong template-source; trạng thái lịch sử của dự án DND không được chuyển sang repo này.

| Mẫu | Kết quả trong source hiện tại |
| --- | --- |
| docker-compose.yml | Local bốn service server/client/MongoDB 4.0.28/MinIO, health và volume riêng |
| docker-compose.prod.yml | Hai service ứng dụng, external Traefik/private storage networks, domain/router configurable, thêm route upload/Socket.IO theo app |
| scripts/deploy.sh | scripts/deploy.sh; apply/verify/rollback/manual-rollback, full SHA, state/pending, flock, guard app-only, HTTPS trước promote |
| scripts/test-deploy-flow.sh | Kiểm thử được ánh xạ server/client; thêm failed verify/up, partial image reuse và pending SHA isolation |
| scripts/init-env.cjs | Khởi tạo server/client env, secret ngẫu nhiên, giữ file đã tồn tại |
| scripts/generate-pwa-icons.cjs | Icon dựa trên vector của Affiliate, Sharp dev dependency, client manifest; chưa có offline service worker |
| backend/scripts/set-admin.js | server/scripts/set-admin.js; Role ObjectId, isActive, thu hồi phiên, audit; chỉ email đã tồn tại |
| docs và DEPLOY_GUIDES | Tài liệu mới phản ánh repo thực; bỏ domain/IP, lịch sử test và liên kết tính năng chưa được cung cấp |
| prompts/TEMPLATE.md, README.md | Luồng backlog/progress/completed, prompt tích hợp riêng; không nhập lịch sử giả |

MinIO đã có implementation upload và đọc/stream byte range. Metadata vẫn ở MongoDB; object private trong MinIO, media sản phẩm public qua API cùng origin theo hành vi hiện có. Bản local trên đĩa vẫn được hỗ trợ khi UPLOAD_STORAGE=local.

Sửa sai khác hạ tầng cũ: API cổng 5000 thống nhất với Docker/Nginx, tên biến build Vite khớp client, Traefik router priority theo APP_NAME, trust proxy một hop, logs không in URI Mongo có credential và bỏ query khỏi access log. Không seed dữ liệu/demo admin trong startup; seed:roles chỉ thêm role thiếu.

JWT access/refresh có kind/sessionVersion; refresh có jti riêng để rotation trong cùng một giây không tái dùng token. Đổi mật khẩu/role/trạng thái và bootstrap admin thu hồi phiên. Socket.IO kiểm tra tài khoản/role từ DB, không join role room tùy ý từ client. Frontend RolesPage mở dialog và cập nhật form tại handler để qua lint mới.

## Phạm vi chưa có nguồn implementation

Note/folder/tag, quota/trash, collaboration/share, email OTP/Google Login, theme và i18n chỉ được mô tả trong tài liệu nguồn; không có các models/routes/UI/dependencies tương ứng trong template-source. Không triển khai lại sản phẩm DND dựa vào mô tả trạng thái hoàn tất. Cấu trúc controller/service/Joi hiện tại được giữ, thay vì đổi sang Zod chỉ vì tài liệu dự án khác dùng Zod.

## Dữ liệu và cách quay lại

- Không chỉnh env thật, không nâng quyền email thật hoặc thao tác dịch vụ hiện có. Kiểm thử Docker dùng project riêng mern-template-check và env kiểm thử riêng.
- MongoDB local dùng volume mới mongo40-data. Không gắn dữ liệu từng dùng server mới hơn vào 4.0. Mongoose pin 7.8.12 theo yêu cầu tương thích của mẫu.
- Thêm trường User.sessionVersion và File.objectKey có tính bổ sung; JWT cũ cần đăng nhập lại.
- Chuyển tệp local sang MinIO cần backup/migration riêng; URL local cũ cần tiếp tục được phục vụ từ storage hiện có. Không tự di chuyển hoặc xóa tệp thật.
- Rollback production về ref image verified; không đảo database/tệp. Quay lại code cũ sau khi phát sinh record MinIO cần tiếp tục hỗ trợ đọc MinIO hoặc migration riêng.

## Kiểm tra

Kết quả chi tiết nằm trong [prompt tích hợp](../prompts/completed/001-integrate-template-source.md). Đã qua lint/build, test config production, actionlint, Shellcheck, deploy regression, build hai Dockerfile và Compose/smoke với MongoDB 4.0 + MinIO. Lỗi health thiếu bucket/timeout được mô phỏng trong tiến trình kiểm thử riêng; readiness trả 503 trong khoảng 3 giây và liveness vẫn trả 200.

Smoke source cuối dùng hai image vừa build, mount src/scripts/package.json hiện tại read-only để bao gồm các sửa JS sau thời điểm bắt đầu build. Chưa rebuild image lần nữa sau các sửa JS cuối. Project kiểm thử và env tạm được dọn; volume kiểm thử được giữ để tránh thao tác xóa storage. Image MinIO mặc định local đã đổi sang release chính thức cùng ngày, giữ tùy chọn MINIO_IMAGE; image của mẫu đã vượt thời gian health chờ trên máy này.

GitHub/VPS thật và giao diện tương tác chưa được nghiệm thu. npm audit vẫn báo advisory ở dependency hiện có; chưa thực hiện nâng cấp dependency toàn bộ trong phạm vi tích hợp.
