import { TFile, Notice } from 'obsidian';
import Spider from './spiders/spider';


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
    const results: any = await Promise.all(paperIDs.map(paperID => {
        try {
            return spider.getPaperInfo(paperID);
        } catch (error) {
            new Notice(`Error in getPaperInfo: ${error}`);
            return null;
        }
    }));
    results.forEach((result: any, index: number) => {
        if (result === null) {
            replaceDict[m[index][0]] = `${m[index][0]} **Not Correct, Check it**`;
        } else {
            const literature = m[index][0];
            const { title, author, pubDate, id } = result;
            const date = new Date(pubDate);
            const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
            replaceDict[literature] = `- **${title}**. ${author} et.al. **${year}-${month}-${day}**. [link](${id})`
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