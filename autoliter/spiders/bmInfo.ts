import CrossrefInfo from "./crossrefInfo";
import { Dict } from "autoliter/types";
import { requestUrl } from 'obsidian'


class BMInfo {
    private base_url: string;
    private server: string[];

    constructor() {
        this.base_url = "https://api.biorxiv.org/details/";
        this.server = ["medrxiv", "biorxiv"]
    }

    async getInfoByBMId(bmId: string): Promise<Dict> {
        const urls = this.server.map(server => `${this.base_url}${server}/${bmId}`);
        for (let url of urls) {
            try {
                // const response = await axios.get(url);
                const response = await requestUrl(url).json; // use obsidian's requestUrl to avoid cors
                if (response['collection'].length > 0) {
                    const data = response['collection'][0];
                    if (data['published'] !== "NA") {
                        return new CrossrefInfo().getInfoByDoi(data['published']);
                    }
                    return this.extractInfo(data);
                }
            } catch (error) {
                throw new Error(`Error in getInfoByBMxivId: ${error.message}(request url: ${url})`);
            }
        }
        throw new Error(`Error in getInfoByBMxivId: No posts found`);
    }

    extractInfo(data: any): Dict {
        const title: string = data['title'];
        const author: string = data['author_corresponding'] || "No author";
        const journal = "BMrxiv";
        const pubDate = data['date'];
        const url: string = `https://doi.org/${data['doi']}`;
        return { title, author, journal, pubDate, url }
    }
}

export default BMInfo;