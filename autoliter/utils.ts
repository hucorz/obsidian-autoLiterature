import { TFile, Notice, ListItemCache } from "obsidian";
import Spider from "./spiders/spider";
import type { Dict } from "autoliter/types";

async function getReplaceDict(
	m: RegExpExecArray[],
	outputFormat: string
): Promise<[Dict, string[], Dict[]]> {
	/*
    get replace dict in the form of {old: new} for the given md file
    */
	let replaceDict: Dict = {};
	let pdfUrls: string[] = [];
	let paperInfo: Dict[] = [];

	const spider = new Spider();

	const paperIDs = m.map(
		(literature) => literature[0].split("{").pop()?.split("}")[0] || ""
	);
	const results: Dict[] = await Promise.all(
		paperIDs.map(async (paperID) => {
			try {
				let paperInfo = await spider.getPaperInfo(paperID);
				paperInfo.id = paperID;
				return paperInfo;
			} catch (error) {
				return {
					id: paperID,
					error: `Error in getReplaceDict: ${error.message}`,
				};
			}
		})
	);
	results.forEach((result: Dict, index) => {
		const origin_string = m[index][0];
		if (result.error) {
			// const e = result.error;
			// if error, do nothing, Notice will show the error message
			replaceDict[origin_string] = `${origin_string}`;
			pdfUrls.push("");
			paperInfo.push({});
		} else {
			const { title, author, journal, pubDate, url } = result;
			// replaceDict[origin_string] = `- **${title}** ([link](${url}))\n\t- *${author} et.al.*\n\t- ${journal}\n\t- ${pubDate}`
			replaceDict[origin_string] = outputFormat
				.replace("${title}", title as string)
				.replace("${author}", author as string)
				.replace("${journal}", journal as string)
				.replace("${pubDate}", pubDate as string)
				.replace("${url}", url as string);

			pdfUrls.push((result.pdfUrl as string) || "");
			paperInfo.push(result);
		}
	});
	return [replaceDict, pdfUrls, paperInfo];
}

function assert(condition: any, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

function sanitizeFileName(fileName: string, pdfUrl: string, paperInfo: any, nameFormat: "title" | "id" | "custom", customFormat: string): string {
	// 根据设置选择文件名格式
	let name = '';
	
	switch (nameFormat) {
		case 'id':
			// 如果是 arXiv 链接，使用 arXiv ID
			const arxivMatch = pdfUrl.match(/arxiv\.org\/pdf\/([\d\.]+)\.pdf/i);
			if (arxivMatch) {
				name = arxivMatch[1];
			} else {
				// 如果不是 arXiv，尝试使用 DOI 或其他标识符
				name = paperInfo.id || paperInfo.title;
			}
			break;
			
		case 'custom':
			// 使用自定义格式
			name = customFormat;
			// 替换所有变量
			Object.entries(paperInfo).forEach(([key, value]) => {
				name = name.replace(`\${${key}}`, value as string);
			});
			break;
			
		case 'title':
		default:
			name = paperInfo.title;
			break;
	}
	
	// 移除文件扩展名（如果有的话）
	name = name.replace(/\.pdf$/i, '');
	
	// 替换非法字符
	name = name.replace(/[/\\?%*:|"<>]/g, "-");
	
	// 限制文件名长度（Windows 建议单个文件名不超过 255 字符）
	const maxLength = 100; // 留一些余地给路径
	if (name.length > maxLength) {
		name = name.slice(0, maxLength - 4); // -4 是为了给 .pdf 留空间
	}
	
	return name + '.pdf';
}

export { getReplaceDict, assert, sanitizeFileName };
