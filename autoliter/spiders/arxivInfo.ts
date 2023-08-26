
import parser from 'rss-parser';
import unidecode from 'unidecode';
import { assert } from 'autoliter/utils';
import type { Dict } from 'autoliter/types';

class ArxivInfo {
    private base_url: string;
    private feedParser: parser;

    constructor() {
        this.base_url = "http://export.arxiv.org/api/query";
        this.feedParser = new parser();
    }

    async getInfoByArxivId(arxivId: string): Promise<Dict> {
        // const params = "?search_query=id:" + encodeURIComponent(unidecode(arxivId));
        const params = `?search_query=id:${arxivId}`;
        try {
            const results = await this.feedParser.parseURL(this.base_url + params);
            assert(results.items.length === 1, "ArxivId should return only one result");
            // use rss-parser cannot get the doi info
            // TODO: get doi info
            return this.extractInfo(results.items[0]);
        } catch (error) {
            throw new Error(`Error in getInfoByArxivId: ${error.message}`);
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

