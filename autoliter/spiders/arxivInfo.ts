
import parser from 'rss-parser';
import { assert } from 'autoliter/utils';
import type { Dict } from 'autoliter/types';
import { requestUrl } from 'obsidian'

class ArxivInfo {
    private base_url: string;
    private feedParser: parser;

    constructor() {
        this.base_url = "http://export.arxiv.org/api/query";
        this.feedParser = new parser();
    }

    async getInfoByArxivId(arxivId: string): Promise<Dict> {
        // if arxivID's prefix is "arXiv:", remove it
        if (arxivId.startsWith("arXiv:")) {
            arxivId = arxivId.slice(6);
        }
        const params = `?id_list=${arxivId}`;
        try {
            // const results = await this.feedParser.parseURL(this.base_url + params);
            const respnse = await requestUrl(this.base_url + params);
            const data = await this.feedParser.parseString(respnse.text);  // response format is xml
            assert(data.items.length > 0, "ArxivId returns no result");
            assert(data.items.length === 1, "ArxivId should return only one result");
            // TODO: get doi info
            // It seems that arxiv api can not get the doi info
            return this.extractInfo(data.items[0]);
        } catch (error) {
            throw new Error(`Error in getInfoByArxivId: ${error.message}(request url: ${this.base_url + params})`);
        }
    }

    extractInfo(data: any): Dict {
        const title: string = data['title'];
        const author: string = data['author'] || "No author";
        const journal = "Arxiv";
        const date = new Date(data['pubDate']);
        const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
        const pubDate = `${year}-${month}-${day}`;
        const url: string = data['link'];
        return { title, author, journal, pubDate, url }
    }
}

export default ArxivInfo;

