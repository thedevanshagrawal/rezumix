import * as pdfjsLib from "pdfjs-dist";

// ✅ Local worker use karo — CDN pe v5 available nahi hai
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
).toString();

export async function extractTextFromPDF(file) {
    if (!file) {
        throw new Error("No file provided for PDF parsing");
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
            throw new Error("Uploaded PDF file is empty or corrupted");
        }

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                if (textContent && Array.isArray(textContent.items)) {
                    const pageText = textContent.items
                        .map((item) => (item && typeof item.str === "string" ? item.str : ""))
                        .join(" ");
                    fullText += pageText + "\n";
                }
            } catch (pageErr) {
                console.warn(`Warning: Failed to extract text from PDF page ${i}:`, pageErr);
            }
        }

        const trimmedText = fullText.trim();
        if (!trimmedText) {
            throw new Error("No readable text could be extracted from this PDF. Please check if the file is scanned or empty.");
        }

        return trimmedText;

    } catch (err) {
        console.error("PDF extraction error:", err);
        throw new Error(`Failed to parse PDF document: ${err.message}`);
    }
}