import * as fs from 'fs';
import * as path from 'path';

import { TFile, Notice } from 'obsidian';
import PatternRecognizer from 'autoliter/patternRecognizer';
import Spider from './spiders/spider';
import { title } from 'process';

async function getReplaceDcit(m: RegExpExecArray[], file: TFile): Promise<{ [key: string]: string }> {
    let replaceDict: { [key: string]: string } = {};
    const spider = new Spider();

    const completed = 0;
    const total = m.length;
    const progressNotice = new Notice(`Updating ${file.path}: ${completed}/${total}`);

    const tasks: Promise<any>[] = [];
    for (const literature of m) {
        const paperID = literature[0].split('{').pop()?.split('}')[0] || '';
        if (paperID !== '') {
            // parameter literature[0] is the original string in the md file who's format is like '- {2022.12345}'
            // and literature[0] will return the original value
            tasks.push(spider.getPaperInfo(paperID, literature[0]))
        }else {
            replaceDict[literature[0]] = `${literature[0]} **Not Correct, Check it**}`
        }
    }
    const results = await Promise.all(tasks);
    for (let i = 0; i < results.length; i++) {
        const { literature, result } = results[i];
        const { title, author, pubDate, id } = result;
        const date = new Date(pubDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        replaceDict[literature] = `- **${title}**. ${author} et.al. **${year}-${month}-${day}**. [link](${id})`
        progressNotice.setMessage(`Updating ${file.path}: ${i + 1}/${total}`);
    }

    // for (const literature of m) {
    //     const paperID = literature[0].split('{').pop()?.split('}')[0] || '';
    //     if (paperID !== '') {
    //         const paperInfo = await spider.getPaperInfo(paperID);
    //         const { title, author, pubDate, id } = paperInfo;
    //         const date = new Date(pubDate);
    //         const year = date.getFullYear();
    //         const month = date.getMonth() + 1;
    //         const day = date.getDate();
    //         replaceDict[literature[0]] = `- **${title}**. ${author} et.al. **${year}-${month}-${day}**. [link](${id})`
    //     } else {
    //         replaceDict[literature[0]] = `${literature[0]} **Not Correct, Check it**}`
    //     }
    // }
    return replaceDict;
}

function assert(condition: any, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

export { getReplaceDcit, assert };