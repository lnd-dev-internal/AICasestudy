import { Router } from "express";
import multer from "multer";

import { parseRemoteDocument, parseUploadedDocument } from "../services/document-parser.js";
import { getGradingConfig } from "../services/grading-config-service.js";
import { scoreSubmission } from "../services/scoring-service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export const submissionsRouter = Router();

submissionsRouter.post(
  "/score",
  upload.fields([{ name: "candidateFile", maxCount: 1 }]),
  async (req, res) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const candidateFile = files?.candidateFile?.[0];
      const candidateUrl = normalizeBodyText(req.body.candidateUrl);
      const config = await getGradingConfig();

      if (!config.assignment || !config.rubric) {
        return res.status(400).json({
          error: "He thong chua co de bai va barem. Vui long vao muc cau hinh va luu truoc."
        });
      }

      if (!candidateFile && !candidateUrl) {
        return res.status(400).json({ error: "Can cung cap candidateFile hoac candidateUrl." });
      }

      const candidate = candidateFile ? await parseUploadedDocument(candidateFile) : await parseRemoteDocument(candidateUrl);
      const result = await scoreSubmission({
        candidateName: normalizeBodyText(req.body.candidateName),
        roleTitle: normalizeBodyText(req.body.roleTitle) || config.roleTitle,
        candidateAnswer: candidate.content,
        assignment: config.assignment.content,
        rubric: config.rubric.content
      });

      return res.json({
        candidateFileName: candidate.filename,
        config: {
          roleTitle: config.roleTitle,
          assignmentFileName: config.assignment.filename,
          rubricFileName: config.rubric.filename
        },
        result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: message });
    }
  }
);

function normalizeBodyText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
