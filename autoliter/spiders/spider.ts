
import * as fs from 'fs';
import * as path from 'path';
import ArxivInfo from './arxivInfo';

class Spider {
    arxivInfo: ArxivInfo;

    constructor() {
        this.arxivInfo = new ArxivInfo();
    }
    classify(identifier: string): string {
        /*    
        Classify the type of paper_id:
            arxivId - arxivId
            doi - digital object identifier
            medbiorxivId - medrxiv or biorxiv id
            title - title
        */
        if (identifier.match(/10\.(?!1101)[0-9]{4}\/.*/)) {
            return 'doi';
        } else if (identifier.match(/10\.1101\/.*/)) {
            return "medbiorxivId";
        } else if (identifier.match(/[0-9]{2}[0-1][0-9]\.[0-9]{3,}.*|.*\/[0-9]{2}[0-1][0-9]{4}/)) {
            return 'arxivId';
        } else if (identifier.match(/[a-zA-Z\d\.-/\s]*/)) {
            return 'title';
        } else {
            return "unrecognized";
        }
    }

    async getPaperInfo(paperID: string, literature: string): Promise<any>{
        /*
        paperID: the paper id
        literature: the original string in the md file who's format is like '- {2022.12345}'
        */
        const id_type = this.classify(paperID);
        let result = {};
        switch (id_type) {
            case 'arxivId':
                result = await this.arxivInfo.getInfoByArxivId(paperID);
                break;
            case 'doi':
                console.log("doi");
                break;
            case 'medbiorxivId':
                console.log("medbiorxivId");
                break;
            case 'title':
                console.log("title");
                break;
            default:
                throw new Error(`Unrecognized: ${literature}`);
        }
        return {
            literature,
            result
        }

    }
}

export default Spider;

