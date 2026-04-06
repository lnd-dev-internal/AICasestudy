import { Router } from "express";
import multer from "multer";

import { parseUploadedDocument } from "../services/document-parser.js";
import { getGradingConfig, saveGradingConfig } from "../services/grading-config-service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export const gradingConfigRouter = Router();

gradingConfigRouter.get("/", async (_req, res) => {
  try {
    const config = await getGradingConfig();
    return res.json(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

gradingConfigRouter.post(
  "/",
  upload.fields([
    { name: "assignmentFile", maxCount: 1 },
    { name: "rubricFile", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const assignmentFile = files?.assignmentFile?.[0];
      const rubricFile = files?.rubricFile?.[0];
      const assignmentText = normalizeBodyText(req.body.assignmentText);
      const rubricText = normalizeBodyText(req.body.rubricText);
      const roleTitle = normalizeBodyText(req.body.roleTitle);

      const assignment = assignmentFile
        ? toSavedDocument(await parseUploadedDocument(assignmentFile))
        : assignmentText
          ? toSavedText("assignmentText", assignmentText)
          : undefined;
      const rubric = rubricFile
        ? toSavedDocument(await parseUploadedDocument(rubricFile))
        : rubricText
          ? toSavedText("rubricText", rubricText)
          : undefined;

      const saved = await saveGradingConfig({
        roleTitle,
        assignment,
        rubric
      });

      if (!saved.assignment || !saved.rubric) {
        return res.status(400).json({
          error: "Can luu day du assignment va rubric it nhat mot lan truoc khi cham bai."
        });
      }

      return res.json(saved);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: message });
    }
  }
);

function normalizeBodyText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toSavedDocument(input: { filename: string; content: string }) {
  return {
    filename: input.filename,
    content: input.content,
    updatedAt: new Date().toISOString()
  };
}

function toSavedText(filename: string, content: string) {
  return {
    filename,
    content,
    updatedAt: new Date().toISOString()
  };
}
