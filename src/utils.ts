import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export const getVersion = (): string => {
  try {
    const packageJsonPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "package.json"
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    return packageJson.version;
  } catch (error) {
    console.error("Failed to read package version:", error);
    return "unknown";
  }
};

// Для tools БЕЗ outputSchema - возвращает текстовый контент
export const createToolResponse = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

// Для tools С outputSchema - возвращает структурированные данные
export const createStructuredResponse = (data: any) => data;

export const createResourceResponse = (uri: string, text: string) => ({
  contents: [{ uri, text, mimeType: "application/json" }],
});
