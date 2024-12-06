import { App, Notice, requestUrl } from "obsidian";
import { sanitizeFileName } from "./utils";

export async function downloadPdf(
	app: App,
	pdfUrl: string,
	paperInfo: any,
	pdfNameFormat: "title" | "id" | "custom",
	customPdfNameFormat: string,
	pdfDownloadPathBase: string,
	pdfDownloadPath: string
): Promise<void> {
	try {
		// 获取文件名
		const fileName = sanitizeFileName(
			paperInfo.title,
			pdfUrl,
			paperInfo,
			pdfNameFormat,
			customPdfNameFormat
		);

		// 获取保存路径
		const folderPath = await getPdfFolderPath(
			app,
			pdfDownloadPathBase,
			pdfDownloadPath
		);
		if (!folderPath) {
			return;
		}

		// 下载 PDF
		const response = await requestUrl({
			url: pdfUrl,
			method: "GET",
			contentType: "application/pdf",
		});
		const uint8Array = new Uint8Array(response.arrayBuffer);

		// 保存文件到 vault 中
		const filePath = joinPaths(folderPath, fileName);
		await app.vault.createBinary(filePath, uint8Array);
		new Notice(`Downloaded PDF: ${fileName}`);
	} catch (error) {
		throw new Notice(`Error downloading PDF: ${error.message}`);
	}
}

export async function getPdfFolderPath(
	app: App,
	pdfDownloadPathBase: string,
	pdfDownloadPath: string
): Promise<string | null> {
	let folderPath = null;
	try {
		if (pdfDownloadPathBase === "mdFile") {
			const activeFile = app.workspace.getActiveFile();
			// activeFile 的文件夹
			if (activeFile) {
				const activeFileFolder = activeFile.path
					.split("/")
					.slice(0, -1)
					.join("/");
				folderPath = joinPaths(activeFileFolder, pdfDownloadPath);
				await app.vault.createFolder(folderPath);
			}
		} else {
			folderPath = pdfDownloadPath;
			await app.vault.createFolder(pdfDownloadPath);
		}
	} catch (error) {
		// Ignore if folder already exists
	}
	return folderPath;
}

export function joinPaths(basePath: string, relativePath: string): string {
	if (relativePath.startsWith("./")) {
		return basePath + relativePath.slice(1);
	} else {
		return basePath + "/" + relativePath;
	}
}
