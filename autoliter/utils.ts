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

export { getReplaceDict, assert };
