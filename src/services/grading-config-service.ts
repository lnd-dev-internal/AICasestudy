import { promises as fs } from "node:fs";
import path from "node:path";

import type { GradingConfig, SavedDocumentConfig } from "../types/grading-config.js";

const dataDirectory = path.resolve(process.cwd(), "data");
const configFilePath = path.join(dataDirectory, "grading-config.json");

const emptyConfig: GradingConfig = {
  roleTitle: "Area Operations Manager",
  assignment: null,
  rubric: null
};

export async function getGradingConfig(): Promise<GradingConfig> {
  try {
    const raw = await fs.readFile(configFilePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<GradingConfig>;

    return {
      roleTitle: typeof parsed.roleTitle === "string" && parsed.roleTitle.trim() ? parsed.roleTitle.trim() : emptyConfig.roleTitle,
      assignment: normalizeSavedDocument(parsed.assignment),
      rubric: normalizeSavedDocument(parsed.rubric)
    };
  } catch (error) {
    if (isFileNotFound(error)) {
      return emptyConfig;
    }

    throw error;
  }
}

export async function saveGradingConfig(input: {
  roleTitle?: string;
  assignment?: SavedDocumentConfig | null;
  rubric?: SavedDocumentConfig | null;
}): Promise<GradingConfig> {
  const current = await getGradingConfig();
  const nextConfig: GradingConfig = {
    roleTitle: input.roleTitle?.trim() || current.roleTitle || emptyConfig.roleTitle,
    assignment: input.assignment ?? current.assignment,
    rubric: input.rubric ?? current.rubric
  };

  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.writeFile(configFilePath, JSON.stringify(nextConfig, null, 2), "utf-8");

  return nextConfig;
}

function normalizeSavedDocument(value: unknown): SavedDocumentConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<SavedDocumentConfig>;

  if (
    typeof candidate.filename !== "string" ||
    typeof candidate.content !== "string" ||
    typeof candidate.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    filename: candidate.filename,
    content: candidate.content,
    updatedAt: candidate.updatedAt
  };
}

function isFileNotFound(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
