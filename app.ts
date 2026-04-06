import cors from "cors";
import express from "express";

import { gradingConfigRouter } from "./src/routes/grading-config.js";
import { submissionsRouter } from "./src/routes/submissions.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.type("html").send(`
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Case Study</title>
        <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  background: "#fff8f4",
                  surface: "#ffffff",
                  panel: "#fff4ec",
                  line: "#f5d6c4",
                  text: "#1f2937",
                  muted: "#7a6a61",
                  primary: "#ff5200",
                  primarySoft: "rgba(255,82,0,0.12)",
                  successBg: "#f0fdf4",
                  successText: "#15803d",
                  successLine: "#bbf7d0",
                  errorBg: "#fef2f2",
                  errorText: "#dc2626",
                  errorLine: "#fecaca"
                },
                fontFamily: {
                  sans: ["Be Vietnam Pro", "sans-serif"]
                },
                boxShadow: {
                  soft: "0 20px 50px rgba(158, 74, 25, 0.10)"
                }
              }
            }
          };
        </script>
        <style>
          body {
            font-family: "Be Vietnam Pro", sans-serif;
            background:
              radial-gradient(circle at top left, rgba(255, 82, 0, 0.14), transparent 22%),
              linear-gradient(180deg, #ffffff 0%, #fff8f4 100%);
          }

          .material-symbols-outlined {
            font-variation-settings: "FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24;
          }

          .score-ring {
            background: conic-gradient(var(--ring-color, #ff5200) 0deg, var(--ring-color, #ff5200) var(--progress, 0deg), #fde6da var(--progress, 0deg), #fde6da 360deg);
          }
        </style>
      </head>
      <body class="min-h-screen bg-background text-text">
        <header class="sticky top-0 z-40 border-b border-[#f4ddd1] bg-white/90 backdrop-blur-xl">
          <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
            <div class="flex items-center gap-4">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
                <span class="material-symbols-outlined">psychology</span>
              </div>
              <div>
                <p class="text-xl font-black tracking-tight">AI Case Study</p>
                <p class="text-sm text-muted">Chấm bài tự động theo đề bài và barem đã cấu hình</p>
              </div>
            </div>
            <div id="saved-config" class="hidden rounded-full border px-4 py-2 text-sm font-semibold"></div>
          </div>
        </header>

        <main class="mx-auto max-w-6xl px-5 py-8 lg:px-8">
          <section class="rounded-[32px] border border-[#ffe1d0] bg-gradient-to-br from-primarySoft via-white to-[#fff4ec] p-8 shadow-soft lg:p-10">
            <div class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
              <span class="material-symbols-outlined text-base">auto_awesome</span>
              AI Case Study
            </div>
            <h1 class="mt-5 text-4xl font-black tracking-tight lg:text-6xl lg:leading-[0.95]">AI Case Study</h1>
            <p class="mt-4 max-w-3xl text-base leading-8 text-muted lg:text-lg">
              Tải lên file Word hoặc dán link Google Docs của bài làm. Hệ thống sẽ tự dùng đề bài Excel và barem đã khóa để phân tích và chấm điểm.
            </p>
          </section>

          <section class="mt-8">
            <div class="rounded-[32px] border border-line bg-surface p-7 shadow-soft lg:p-8">
              <div class="grid grid-cols-1 gap-8 xl:grid-cols-12">
                <div class="xl:col-span-8">
                  <div class="mb-6">
                    <h2 class="text-2xl font-bold tracking-tight">Bắt đầu chấm bài</h2>
                    <p class="mt-2 max-w-2xl text-sm leading-7 text-muted">
                      AI sẽ đối chiếu bài làm với bộ đề và barem đang dùng, đọc đúng cấu trúc dữ liệu và trả về nhận xét chi tiết bằng tiếng Việt có dấu đầy đủ.
                    </p>
                  </div>

                  <form id="score-form" class="space-y-5">
                    <label class="block">
                      <span class="mb-2 block text-sm font-bold text-text">Tên ứng viên</span>
                      <input
                        type="text"
                        name="candidateName"
                        placeholder="Trần Văn Phước"
                        class="w-full rounded-[22px] border border-line bg-white px-5 py-4 text-base font-medium text-text shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </label>

                    <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">
                      <div class="lg:col-span-8">
                        <div class="flex h-full flex-col items-center justify-center rounded-[32px] border border-dashed border-primary/30 bg-gradient-to-br from-primarySoft via-white to-[#fff5ee] p-8 text-center">
                          <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-soft">
                            <span class="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                          </div>
                          <h3 class="text-xl font-bold tracking-tight">Tải file bài làm Word</h3>
                          <p class="mt-2 max-w-md text-sm leading-7 text-muted">
                            Hỗ trợ file <strong>.docx</strong>. Nếu bài làm nằm trên Google Docs, bạn có thể dùng ô link ở bên cạnh.
                          </p>
                          <label class="mt-6 inline-flex cursor-pointer items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:translate-y-[-1px]">
                            <span class="material-symbols-outlined text-[18px]">upload</span>
                            Chọn file từ máy tính
                            <input type="file" name="candidateFile" accept=".docx,.doc" class="hidden" />
                          </label>
                          <p id="file-name" class="mt-4 text-sm font-semibold text-muted">Chưa chọn file nào</p>
                        </div>
                      </div>

                      <div class="space-y-4 lg:col-span-4">
                        <div class="rounded-[28px] border border-line bg-panel p-5">
                          <p class="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-muted">Liên kết bài làm</p>
                          <label class="block">
                            <span class="mb-2 block text-sm font-bold text-text">Link Google Docs hoặc file .docx</span>
                            <input
                              type="text"
                              name="candidateUrl"
                              placeholder="Dán link xem hoặc link chỉnh sửa tại đây"
                              class="w-full rounded-[20px] border border-line bg-white px-4 py-4 text-sm font-medium text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                          </label>
                          <p class="mt-3 text-sm leading-7 text-muted">
                            Nếu dùng Google Docs, hệ thống sẽ tự chuyển link sang dạng export.
                          </p>
                        </div>

                        <div class="rounded-[28px] border border-[#ffd7c3] bg-[#fff4ec] p-5">
                          <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined mt-0.5 text-primary">info</span>
                            <p class="text-sm leading-7 text-[#7a5948]">
                              Đề bài Excel đã được cấu hình sẵn. Hệ thống đọc sheet <strong>“Đề bài”</strong> trước, sau đó mới đến các sheet dữ liệu còn lại.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-4">
                      <button
                        id="submit-button"
                        type="submit"
                        class="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 text-sm font-extrabold text-white shadow-soft transition hover:translate-y-[-1px]"
                      >
                        <span class="material-symbols-outlined text-[18px]">psychology</span>
                        Chấm điểm
                      </button>
                      <div id="status" class="hidden rounded-2xl border px-4 py-3 text-sm"></div>
                    </div>
                  </form>
                </div>

                <div class="xl:col-span-4">
                  <div class="rounded-[32px] border border-line bg-[#fffaf7] p-6 shadow-soft">
                    <p class="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-muted">Nhận xét nhanh</p>
                    <p id="summary-text" class="text-sm leading-8 text-muted">
                      AI sẽ tóm tắt chất lượng bài làm, nêu rõ điểm mạnh, điểm còn thiếu và khuyến nghị tổng thể.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="result" class="mt-8 hidden space-y-6">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div class="rounded-[32px] border border-line bg-surface p-8 shadow-soft">
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-muted">Khuyến nghị</p>
                <h3 class="mt-3 text-2xl font-black tracking-tight text-text">Đánh giá tổng thể</h3>
                <p id="recommendation" class="mt-4 text-sm leading-8 text-muted"></p>
              </div>

              <div class="rounded-[32px] border border-line bg-surface p-8 shadow-soft md:col-span-2">
                <div class="mb-6 flex items-center justify-between gap-4">
                  <h3 class="text-2xl font-black tracking-tight text-text">Phân tích chi tiết theo barem</h3>
                  <div id="score-summary-badge" class="rounded-full bg-[#fff1e8] px-4 py-2 text-sm font-bold text-primary">
                    So khớp đề bài + dữ liệu + barem
                  </div>
                </div>

                <div class="mb-6 rounded-[28px] border border-[#ffd7c3] bg-[#fff6f1] p-6">
                  <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p class="text-xs font-bold uppercase tracking-[0.18em] text-muted">Điểm tổng quan</p>
                      <p id="score-summary-label" class="mt-3 text-sm leading-7 text-muted">
                        Kết quả sẽ được làm nổi bật tại đây sau khi chấm xong.
                      </p>
                    </div>
                    <div class="flex items-center gap-5">
                      <div id="score-ring" class="score-ring flex h-40 w-40 items-center justify-center rounded-full" style="--progress: 0deg; --ring-color: #ff5200;">
                        <div class="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                          <span id="score" class="text-6xl font-black text-primary">--</span>
                          <span class="text-[11px] font-bold uppercase tracking-widest text-muted">trên thang</span>
                        </div>
                      </div>
                      <div>
                        <p class="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Tỷ lệ đạt</p>
                        <p id="score-percent" class="mt-1 text-5xl font-black text-primary">--%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="criteria" class="grid grid-cols-1 gap-4 sm:grid-cols-2"></div>
              </div>
            </div>
          </section>
        </main>

        <script>
          const form = document.getElementById("score-form");
          const submitButton = document.getElementById("submit-button");
          const savedConfigEl = document.getElementById("saved-config");
          const statusEl = document.getElementById("status");
          const resultEl = document.getElementById("result");
          const scoreEl = document.getElementById("score");
          const scoreSummaryLabelEl = document.getElementById("score-summary-label");
          const scorePercentEl = document.getElementById("score-percent");
          const scoreSummaryBadgeEl = document.getElementById("score-summary-badge");
          const scoreRingEl = document.getElementById("score-ring");
          const summaryTextEl = document.getElementById("summary-text");
          const recommendationEl = document.getElementById("recommendation");
          const criteriaEl = document.getElementById("criteria");
          const fileNameEl = document.getElementById("file-name");
          const candidateFileInput = form.querySelector('input[name="candidateFile"]');

          function setStatus(element, message, tone) {
            element.textContent = message;
            element.className = "rounded-2xl border px-4 py-3 text-sm";

            if (tone === "success") {
              element.classList.add("block", "border-successLine", "bg-successBg", "text-successText");
              return;
            }

            if (tone === "error") {
              element.classList.add("block", "border-errorLine", "bg-errorBg", "text-errorText");
              return;
            }

            element.classList.add("block", "border-[#ffd7c3]", "bg-[#fff4ec]", "text-[#a84a1e]");
          }

          function escapeHtml(value) {
            return String(value || "")
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")
              .replaceAll('"', "&quot;")
              .replaceAll("'", "&#39;");
          }

          async function loadSavedConfig() {
            try {
              const response = await fetch("/api/grading-config");
              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || "Không tải được cấu hình.");
              }

              if (!data.assignment || !data.rubric) {
                setStatus(savedConfigEl, "Chưa có cấu hình đề bài và barem.", "error");
                return;
              }

              setStatus(savedConfigEl, "Đã khóa bộ đề và barem để chấm tự động.", "success");
            } catch (error) {
              const message = error instanceof Error ? error.message : "Không tải được cấu hình.";
              setStatus(savedConfigEl, message, "error");
            }
          }

          function renderResult(payload) {
            const result = payload.result;
            const maxScore = Number(result.maxScore || 100);
            const totalScore = Number(result.totalScore || 0);
            const progress = maxScore > 0 ? Math.min((totalScore / maxScore) * 360, 360) : 0;
            const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
            const isPassing = percent >= 80;
            const scoreColor = isPassing ? "#16a34a" : "#dc2626";

            resultEl.classList.remove("hidden");
            scoreEl.textContent = totalScore;
            scoreEl.style.color = scoreColor;
            scoreSummaryLabelEl.textContent = "Tổng điểm " + totalScore + " / " + maxScore + " theo barem hiện hành.";
            scorePercentEl.textContent = percent + "%";
            scorePercentEl.style.color = scoreColor;
            scoreRingEl.style.setProperty("--progress", progress + "deg");
            scoreRingEl.style.setProperty("--ring-color", scoreColor);
            scoreSummaryBadgeEl.textContent = isPassing ? "Đạt ngưỡng mạnh" : "Cần xem lại kỹ";
            scoreSummaryBadgeEl.style.backgroundColor = isPassing ? "#f0fdf4" : "#fef2f2";
            scoreSummaryBadgeEl.style.color = scoreColor;
            summaryTextEl.textContent = result.summary || "";
            recommendationEl.textContent = result.finalRecommendation || "";

            criteriaEl.innerHTML = (result.criteria || []).map((item) => {
              const evidence = (item.evidence || []).map((entry) => "<li>" + escapeHtml(entry) + "</li>").join("");
              const suggestions = (item.improvementSuggestions || []).map((entry) => "<li>" + escapeHtml(entry) + "</li>").join("");

              return \`
                <article class="rounded-[28px] border border-[#ffd9c8] bg-[#fff9f5] p-5">
                  <div class="mb-3 flex items-start justify-between gap-3">
                    <h4 class="text-base font-extrabold leading-6 text-text">\${escapeHtml(item.criterion)}</h4>
                    <div class="rounded-full bg-white px-3 py-2 text-base font-black shadow-sm" style="color: \${scoreColor};">\${item.score} / \${item.maxScore}</div>
                  </div>
                  <p class="text-sm leading-7 text-muted"><strong class="text-text">Giải thích:</strong> \${escapeHtml(item.justification || "")}</p>
                  <div class="mt-4">
                    <p class="text-xs font-bold uppercase tracking-[0.14em] text-muted">Bằng chứng từ bài làm</p>
                    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">\${evidence || "<li>Không có</li>"}</ul>
                  </div>
                  <div class="mt-4">
                    <p class="text-xs font-bold uppercase tracking-[0.14em] text-muted">Gợi ý cải thiện</p>
                    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">\${suggestions || "<li>Không có</li>"}</ul>
                  </div>
                </article>
              \`;
            }).join("");
          }

          if (candidateFileInput) {
            candidateFileInput.addEventListener("change", () => {
              const file = candidateFileInput.files && candidateFileInput.files[0];
              fileNameEl.textContent = file ? file.name : "Chưa chọn file nào";
            });
          }

          form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const candidateFile = formData.get("candidateFile");
            const candidateUrl = String(formData.get("candidateUrl") || "").trim();

            if ((!(candidateFile instanceof File) || candidateFile.size === 0) && !candidateUrl) {
              setStatus(statusEl, "Bạn cần chọn file bài làm hoặc nhập link bài làm.", "error");
              return;
            }

            submitButton.disabled = true;
            setStatus(statusEl, "AI đang phân tích cấu trúc, đối chiếu dữ liệu và chấm theo barem...", "info");
            resultEl.classList.add("hidden");
            criteriaEl.innerHTML = "";

            try {
              const response = await fetch("/api/submissions/score", {
                method: "POST",
                body: formData
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || "Chấm điểm thất bại.");
              }

              renderResult(data);
              setStatus(statusEl, "Chấm điểm thành công.", "success");
            } catch (error) {
              const message = error instanceof Error ? error.message : "Chấm điểm thất bại.";
              setStatus(statusEl, message, "error");
            } finally {
              submitButton.disabled = false;
            }
          });

          setStatus(statusEl, "Sẵn sàng nhận bài làm ứng viên.", "info");
          loadSavedConfig();
        </script>
      </body>
    </html>
  `);
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "case-study-grading-system" });
});

app.use("/api/grading-config", gradingConfigRouter);
app.use("/api/submissions", submissionsRouter);
