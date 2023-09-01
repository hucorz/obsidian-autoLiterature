import type { Dict } from 'autoliter/types';
import { requestUrl } from 'obsidian'

// const HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:27.0) Gecko/20100101 Firefox/43.0'};

class CrossrefInfo {
    private base_url: string;

    constructor() {
        this.base_url = "https://api.crossref.org/";
    }

    async getInfoByDoi(doi: string): Promise<Dict> {
        const url = `${this.base_url}works/${doi}`;
        try {
            // const response = await axios.get(url);
            const response = await requestUrl(url).json; // user obsidian's requestUrl to avoid cors
            return this.extractInfo(response['message']);
        } catch (error) {
            throw new Error(`Error in getInfoByDoi: ${error.message}`);
        }
    }

    extractInfo(data: any): Dict {
        const title: string = data['title'][0];
        const author: string = data['author'] && data['author'].length > 0 ? data['author'][0]['given'] : "No author";
        const journal = data['short-container-title']?.[0] || data['container-title']?.[0] || "No journal";
        const pubDate = data['published']["date-parts"][0].map((i: number) => String(i)).join('-');
        const url: string = data['URL'];
        return { title, author, journal, pubDate, url }
    }
}

export default CrossrefInfo;