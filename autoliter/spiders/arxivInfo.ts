
import parser from 'rss-parser';
import unidecode  from 'unidecode';
import { assert } from 'autoliter/utils';

class ArxivInfo {
    private base_url: string;
    private feedParser: parser;

    constructor() {
        this.base_url = "http://export.arxiv.org/api/query";
        this.feedParser = new parser();
    }

    async getInfoByArxivId(arxivId: string): Promise<object> {
        /*
        Get the meta information by the given paper arxiv_id. 
        Args:
            arxivId (str): The arxiv Id           
        Returns:
            An object containing the paper information. 
            {
                "title": xxx,
                "author": xxx,
                "pubDate": xxx,
                etc
            } 
        */
        const params = "?search_query=id:" + encodeURIComponent(unidecode(arxivId));
        try {
            const results = await this.feedParser.parseURL(this.base_url + params);
            assert(results.items.length === 1, "ArxivId should return only one result");
            // use rss-parser cannot get the doi info
            // TODO: get doi info
            const result = results.items[0];
            return result;            
        } catch (error) {
            throw new Error(`Error in getInfoByArxivId: ${error}`);
        }
    }
}

export default ArxivInfo;

