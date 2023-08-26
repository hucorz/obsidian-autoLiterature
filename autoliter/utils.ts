import { TFile, Notice } from 'obsidian';
import Spider from './spiders/spider';
import type { Dict } from 'autoliter/types';


async function getReplaceDict(m: RegExpExecArray[], file: TFile): Promise<{ [key: string]: string }> {
    /*
    get replace dict in the form of {old: new} for the given md file
    */
    let replaceDict: { [key: string]: string } = {};

    const spider = new Spider();
    const completed = 0;
    const total = m.length;
    const progressNotice = new Notice(`Updating ${file.path}: ${completed}/${total}`);

    const paperIDs = m.map(literature => literature[0].split('{').pop()?.split('}')[0] || '');
    const results: Dict[] = await Promise.all(paperIDs.map(async paperID => {
        try {
            let paperInfo = await spider.getPaperInfo(paperID);
            paperInfo.id = paperID;
            return paperInfo;
        } catch (error) {
            return {id: paperID, error: `Error in getReplaceDict: ${error.message}`};
        }
    }));
    results.forEach((result: Dict) => {
        const {id} = result;
        const origin_string = `- {${id}}`;
        if (result.error) {
            const e = result.error;
            replaceDict[origin_string] = `${origin_string} **${e}**`;
        } else {
            const {title, author, journal, pubDate, url} = result;
            replaceDict[origin_string] = `- **${title}** ([link](${url}))\n\t- ${author} et.al.\n\t- **${journal}**\n\t- **${pubDate}**`
        }
    });
    progressNotice.setMessage(`Updating ${file.path}: ${total}/${total}`);
    return replaceDict;
}

function assert(condition: any, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

export { getReplaceDict, assert };