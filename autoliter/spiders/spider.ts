import ArxivInfo from './arxivInfo';
import CrossrefInfo from './crossrefInfo';
import type { Dict } from 'autoliter/types';

class Spider {
    arxivInfo: ArxivInfo;
    crossrefInfo: CrossrefInfo;

    constructor() {
        this.arxivInfo = new ArxivInfo();
        this.crossrefInfo = new CrossrefInfo();
    }
    classify(identifier: string): string {
        /*    
        Classify the type of paper_id:
            arxivId - arxivId
            doi - digital object identifier
            medbiorxivId - medrxiv or biorxiv id
        */
        if (identifier.match(/10\.(?!1101)[0-9]{4}\/.*/)) {
            return 'doi';
        } else if (identifier.match(/10\.1101\/.*/)) {
            return "medbiorxivId";
        } else if (identifier.match(/[0-9]{2}[0-1][0-9]\.[0-9]{3,}.*|.*\/[0-9]{2}[0-1][0-9]{4}/)) {
            return 'arxivId';
        }else {
            return "unrecognized";
        }
    }

    async getPaperInfo(paperID: string): Promise<Dict>{
        /*
        paperID: the paper id like 2022.12345
        */
        const id_type = this.classify(paperID);
        console.log(paperID);
        console.log(id_type);
        try {
            switch (id_type) {
                case 'arxivId':
                    return await this.arxivInfo.getInfoByArxivId(paperID);
                case 'doi':
                    return await this.crossrefInfo.getInfoByDoi(paperID);
                case 'medbiorxivId':
                    console.log("medbiorxivId");
                    // TODO: medbiorxivId
                    return {null: "null"};
                default:
                    throw new Error(`Unrecognized paperID: "${paperID}"`);
            }
        } catch (error) {
            throw new Error(`Error in getPaperInfo: ${error}`);
        }
    }
}

export default Spider;

