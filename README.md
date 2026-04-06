# Case Study Grading System

MVP backend để chấm bài case study cho vị trí quản lý khu vực vận hành.

## Luồng xử lý

1. Admin upload đề bài và barem một lần tại màn hình cấu hình.
2. Hệ thống lưu đề bài và barem vào local config.
3. User tải lên bài làm ứng viên bằng file `.docx` hoặc cung cấp link public tới file `.docx`.
4. Backend parse nội dung từ file Word (`.docx`) bằng `mammoth`.
5. Với đề bài dạng Excel, backend đọc sheet `Đề bài` trước rồi tới các sheet còn lại.
6. Prompt chuẩn hóa được gửi sang Gemini để chấm theo từng tiêu chí.
7. API trả về JSON gồm tổng điểm, điểm chi tiết từng tiêu chí, nhận xét mạnh/yếu và khuyến nghị.

## Giới hạn của MVP

- Hỗ trợ tốt cho `.docx`, `.xlsx`, `.xls` và link public tới `.docx`.
- File `.doc` đời cũ chưa parse trực tiếp trong bản này.
- Dữ liệu đề bài và barem đang được lưu local trong `data/grading-config.json`.

## Cài đặt

```bash
npm install
cp .env.example .env
npm run dev
```

## Deploy trên Vercel

- App đã có entrypoint serverless cho Vercel tại `api/index.ts`.
- Cần khai báo tối thiểu 2 biến môi trường trên Vercel:
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL`
- Dữ liệu đề bài và barem hiện được đọc từ file commit sẵn trong `data/grading-config.json`.
- Khi deploy lên Vercel, không nên kỳ vọng ghi đè cấu hình bằng file runtime vì filesystem của serverless không bền vững.

## Endpoint chính

`POST /api/grading-config`

Gửi `multipart/form-data` để lưu đề bài và barem:

- `assignmentFile`: file đề bài, hỗ trợ `.docx`, `.xlsx`, `.xls`, tùy chọn nếu dùng `assignmentText`.
- `rubricFile`: file barem, tùy chọn nếu dùng `rubricText`.
- `assignmentText`: đề bài dạng text.
- `rubricText`: barem dạng text.
- `roleTitle`: tên vị trí, tùy chọn.

`POST /api/submissions/score`

Gửi `multipart/form-data` với các field:

- `candidateFile`: bài làm ứng viên dạng file Word, tùy chọn nếu dùng `candidateUrl`.
- `candidateUrl`: link public tới file `.docx`, tùy chọn nếu không gửi file.
- `candidateName`: tên ứng viên, tùy chọn.
- `roleTitle`: vị trí tuyển dụng, tùy chọn.

Ví dụ với `curl`:

```bash
curl -X POST http://localhost:3000/api/grading-config \
  -F "roleTitle=Area Operations Manager" \
  -F "assignmentFile=@./samples/assignment.txt" \
  -F "rubricFile=@./samples/rubric.txt"

curl -X POST http://localhost:3000/api/submissions/score \
  -F "candidateName=Nguyen Van A" \
  -F "roleTitle=Area Operations Manager" \
  -F "candidateFile=@./samples/candidate.txt"
```

## Rubric mẫu

Xem file [data/rubric.example.json](/Users/dollarxdustin/Documents/Case%20Study/data/rubric.example.json).

## Kiến trúc nhanh

- [src/app.ts](/Users/dollarxdustin/Documents/Case%20Study/src/app.ts): cấu hình Express app.
- [src/routes/submissions.ts](/Users/dollarxdustin/Documents/Case%20Study/src/routes/submissions.ts): endpoint upload/chấm bài.
- [src/services/document-parser.ts](/Users/dollarxdustin/Documents/Case%20Study/src/services/document-parser.ts): parse file Word/text.
- [src/services/gemini-client.ts](/Users/dollarxdustin/Documents/Case%20Study/src/services/gemini-client.ts): gọi Gemini REST API.
- [src/services/scoring-service.ts](/Users/dollarxdustin/Documents/Case%20Study/src/services/scoring-service.ts): dựng prompt và chuẩn hóa output JSON.

## Bước tiếp theo nên làm

1. Thêm giao diện web cho HR hoặc line manager upload bài.
2. Lưu lịch sử chấm điểm vào database.
3. Thêm bước human review để manager duyệt trước khi chốt điểm.
4. Nếu cần hỗ trợ `.doc`, bổ sung pipeline convert bằng LibreOffice.
