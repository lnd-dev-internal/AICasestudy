import { z } from "zod";

import { buildCaseStudyPrompt } from "../prompts/case-study-prompt.js";
import type { ScoreSubmissionInput, ScoringResult } from "../types/scoring.js";
import { generateGeminiText } from "./gemini-client.js";

const scoringResultSchema = z.object({
  summary: z.string(),
  overallStrengths: z.array(z.string()),
  overallWeaknesses: z.array(z.string()),
  finalRecommendation: z.string(),
  totalScore: z.number(),
  maxScore: z.number(),
  criteria: z.array(
    z.object({
      criterion: z.string(),
      score: z.number(),
      maxScore: z.number(),
      justification: z.string(),
      evidence: z.array(z.string()),
      improvementSuggestions: z.array(z.string())
    })
  )
});

export async function scoreSubmission(input: ScoreSubmissionInput): Promise<ScoringResult> {
  const prompt = buildCaseStudyPrompt(input);
  const rawText = await generateGeminiText(prompt);
  const jsonText = extractJson(rawText);
  const parsed = scoringResultSchema.parse(JSON.parse(jsonText));
  const normalizedCriteria = parsed.criteria.map((item) => ({
    ...normalizeCriterionText(item),
    score: clampScore(item.score, item.maxScore)
  }));
  const calculatedTotal = normalizedCriteria.reduce((sum, item) => sum + item.score, 0);

  return {
    ...normalizeTopLevelText(parsed),
    criteria: normalizedCriteria,
    totalScore: calculatedTotal
  };
}

function extractJson(value: string): string {
  const trimmed = value.trim();

  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const fenceMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) ?? trimmed.match(/```\s*([\s\S]*?)```/i);

  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }

  throw new Error("Khong the trich xuat JSON tu phan hoi cua Gemini.");
}

function clampScore(score: number, maxScore: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore)) {
    return 0;
  }

  if (maxScore <= 0) {
    return 0;
  }

  return Math.min(Math.max(score, 0), maxScore);
}

function normalizeTopLevelText(result: ScoringResult): ScoringResult {
  return {
    ...result,
    summary: normalizeVietnameseLabel(result.summary),
    finalRecommendation: normalizeVietnameseLabel(result.finalRecommendation),
    overallStrengths: result.overallStrengths.map(normalizeVietnameseLabel),
    overallWeaknesses: result.overallWeaknesses.map(normalizeVietnameseLabel)
  };
}

function normalizeCriterionText(item: ScoringResult["criteria"][number]): ScoringResult["criteria"][number] {
  return {
    ...item,
    criterion: normalizeVietnameseLabel(item.criterion),
    justification: normalizeVietnameseLabel(item.justification),
    evidence: item.evidence.map(normalizeVietnameseLabel),
    improvementSuggestions: item.improvementSuggestions.map(normalizeVietnameseLabel)
  };
}

function normalizeVietnameseLabel(value: string): string {
  const normalized = value.trim();
  const replacements: Array<[RegExp, string]> = [
    [/Tinh toan va danh gia KPI/gi, "Tính toán và đánh giá KPI"],
    [/Xac dinh van de va nguyen nhan goc re/gi, "Xác định vấn đề và nguyên nhân gốc rễ"],
    [/Xac dinh buu cuc uu tien/gi, "Xác định bưu cục ưu tiên"],
    [/Chon van de uu tien/gi, "Chọn vấn đề ưu tiên"],
    [/De xuat 3 hanh dong cu the/gi, "Đề xuất 3 hành động cụ thể"],
    [/Muc tieu tung tuan/gi, "Mục tiêu từng tuần"],
    [/Cac hanh dong chinh/gi, "Các hành động chính"],
    [/Cach theo doi va danh gia/gi, "Cách theo dõi và đánh giá"],
    [/Phan tich hien trang/gi, "Phân tích hiện trạng"],
    [/Ra quyet dinh va xu ly van de/gi, "Ra quyết định và xử lý vấn đề"],
    [/Lap ke hoach cai thien/gi, "Lập kế hoạch cải thiện"],
    [/Khuyen nghi/gi, "Khuyến nghị"],
    [/Ung vien/gi, "Ứng viên"],
    [/Buu cuc/gi, "Bưu cục"],
    [/nhan su/gi, "nhân sự"],
    [/du lieu/gi, "dữ liệu"],
    [/danh gia/gi, "đánh giá"],
    [/giai thich/gi, "giải thích"]
  ];

  return replacements.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), normalized);
}
