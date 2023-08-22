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
        }else {
            return "unrecognized";
        }
    }

    async getPaperInfo(paperID: string): Promise<any>{
        /*
        paperID: the paper id like 2022.12345
        */
        const id_type = this.classify(paperID);
        switch (id_type) {
            case 'arxivId':
                return this.arxivInfo.getInfoByArxivId(paperID);
            case 'doi':
                console.log("doi");
                // TODO: doi
                return null;
            case 'medbiorxivId':
                console.log("medbiorxivId");
                // TODO: medbiorxivId
                return null;
            default:
                return null;
        }
    }
}

export default Spider;

