# Solution Design

## 1. Muc tieu nghiep vu

Xay dung he thong cham bai case study cho vi tri quan ly khu vuc van hanh, trong do:

- Ung vien nop bai dang `.docx`.
- Nguoi van hanh he thong cung cap de bai va barem.
- AI Gemini cham diem theo tieu chi, co giai thich ro tung muc.
- Ket qua co the dung de tham khao, sau do manager xac nhan.

## 2. Kien truc MVP

### Thanh phan

- Upload API: nhan bai lam, de bai, barem.
- Document parser: trich text tu file Word.
- Prompt builder: dong goi de bai + barem + bai lam thanh prompt co cau truc.
- Gemini scoring service: goi API Gemini va nhan JSON ket qua.
- Result normalizer: validate schema, tinh tong diem va tra ket qua cho client.

### Luong du lieu

1. User upload bai lam.
2. Backend parse noi dung.
3. Backend ghep de bai + barem + bai lam vao prompt.
4. Gemini tra ve JSON diem chi tiet.
5. Backend validate schema va tra response.

## 3. Goi y du lieu dau vao

Nen chuan hoa barem theo 1 trong 2 cach:

- Cach 1: file text/Word mo ta tieu chi, trong so, cach tru diem.
- Cach 2: file JSON cau truc ro rang cho tung tieu chi.

Neu doi ban co the chuan hoa barem thanh JSON tu dau, ket qua cham se on dinh hon.

## 4. Goi y mo rong phase 2

- Luu bai nop va ket qua cham vao database.
- Them giao dien dashboard cho HR va hiring manager.
- Tao workflow `AI draft -> Manager review -> Final score`.
- Luu version cua de bai va barem de truy vet lich su.
- Log prompt, response, token, latency de kiem soat chi phi.
- Them OCR/PDF support.
- Ho tro `.doc` bang pipeline convert sang `.docx`.

## 5. Luu y van hanh

- Khong nen de AI la nguon quyet dinh duy nhat.
- Nen bat buoc co nguoi review o cac ung vien sat nguong.
- Can an danh thong tin nhay cam neu co yeu cau bao mat.
- Nen test prompt voi 10-20 bai mau da duoc cham thu cong de hieu chenh lech.
