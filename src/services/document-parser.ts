import mammoth from "mammoth";
import * as XLSX from "xlsx";

const supportedTextExtensions = new Set([".txt", ".md", ".json"]);
const supportedSpreadsheetExtensions = new Set([".xlsx", ".xls"]);

export interface ParsedInput {
  filename: string;
  content: string;
}

export async function parseUploadedDocument(file: Express.Multer.File): Promise<ParsedInput> {
  return parseDocumentBuffer(file.originalname, file.buffer);
}

export async function parseRemoteDocument(url: string): Promise<ParsedInput> {
  const parsedUrl = normalizeRemoteDocumentUrl(new URL(url));
  const filename = getFilenameFromUrl(parsedUrl);
  const response = await fetch(parsedUrl);

  if (!response.ok) {
    throw new Error(`Khong tai duoc file tu link. HTTP ${response.status}.`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return parseDocumentBuffer(filename, Buffer.from(arrayBuffer));
}

async function parseDocumentBuffer(filename: string, buffer: Buffer): Promise<ParsedInput> {
  const extension = getExtension(filename);

  if (extension === ".docx") {
    const [htmlResult, textResult] = await Promise.all([
      mammoth.convertToHtml({ buffer }),
      mammoth.extractRawText({ buffer })
    ]);
    const content = buildStructuredDocxContent(htmlResult.value, textResult.value);

    return {
      filename,
      content
    };
  }

  if (extension === ".doc") {
    throw new Error("File .doc chua duoc ho tro. Vui long doi sang .docx hoac cung cap link .docx.");
  }

  if (supportedSpreadsheetExtensions.has(extension)) {
    return {
      filename,
      content: parseSpreadsheetBuffer(buffer)
    };
  }

  if (supportedTextExtensions.has(extension)) {
    return {
      filename,
      content: normalizeWhitespace(buffer.toString("utf-8"))
    };
  }

  throw new Error(`Dinh dang file khong duoc ho tro: ${filename}`);
}

function getExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return filename.slice(lastDotIndex).toLowerCase();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildStructuredDocxContent(html: string, rawText: string): string {
  const structuredFromHtml = normalizeHtmlForAi(html);
  const normalizedRawText = normalizeWhitespace(rawText);

  if (!structuredFromHtml) {
    return normalizedRawText;
  }

  if (!normalizedRawText) {
    return structuredFromHtml;
  }

  return normalizeWhitespace(`
[Noi dung giu cau truc]
${structuredFromHtml}

[Noi dung van ban thuần]
${normalizedRawText}
  `);
}

function normalizeHtmlForAi(html: string): string {
  return normalizeWhitespace(
    decodeHtmlEntities(
      html
        .replace(/<(h[1-6]|p|div|section|article|ul|ol)>/gi, "\n")
        .replace(/<li>/gi, "\n- ")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(h[1-6]|p|div|section|article|ul|ol|li)>/gi, "\n")
        .replace(/<table[^>]*>/gi, "\n[BANG]\n")
        .replace(/<\/table>/gi, "\n[/BANG]\n")
        .replace(/<tr[^>]*>/gi, "\n")
        .replace(/<\/tr>/gi, "\n")
        .replace(/<(td|th)[^>]*>/gi, " | ")
        .replace(/<\/(td|th)>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/[ \t]{2,}/g, " ")
    )
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseSpreadsheetBuffer(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const orderedSheetNames = orderSheetNames(workbook.SheetNames);
  const sections = orderedSheetNames
    .map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        return "";
      }

      const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
        header: 1,
        raw: false,
        defval: ""
      });

      const normalizedRows = rows
        .map((row) =>
          row
            .map((cell) => String(cell ?? "").trim())
            .filter((cell) => cell.length > 0)
        )
        .filter((row) => row.length > 0);

      if (normalizedRows.length === 0) {
        return `[SHEET: ${sheetName}]\n(Khong co du lieu)`;
      }

      const body = normalizedRows.map((row) => `| ${row.join(" | ")} |`).join("\n");

      return `[SHEET: ${sheetName}]\n${body}`;
    })
    .filter(Boolean);

  return normalizeWhitespace(sections.join("\n\n"));
}

function orderSheetNames(sheetNames: string[]): string[] {
  const primarySheets = sheetNames.filter((name) => normalizeSheetName(name) === "de bai");
  const remainingSheets = sheetNames.filter((name) => normalizeSheetName(name) !== "de bai");

  return [...primarySheets, ...remainingSheets];
}

function normalizeSheetName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getFilenameFromUrl(url: URL): string {
  const format = url.searchParams.get("format");

  if (format === "docx") {
    return "remote-document.docx";
  }

  if (format === "xlsx") {
    return "remote-document.xlsx";
  }

  const pathname = url.pathname || "";
  const lastSegment = pathname.split("/").filter(Boolean).at(-1);

  return lastSegment || "remote-document.docx";
}

function normalizeRemoteDocumentUrl(url: URL): URL {
  if (url.hostname !== "docs.google.com") {
    return url;
  }

  const match = url.pathname.match(/^\/document\/d\/([^/]+)/);

  if (!match?.[1]) {
    return url;
  }

  return new URL(`https://docs.google.com/document/d/${match[1]}/export?format=docx`);
}
