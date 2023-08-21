import {TFile} from 'obsidian';
import PatternRecognizer from 'autoliter/PatternRecognizer';

function get_bib(file: TFile, paperRecognizer: PatternRecognizer) {
    let bib = file.basename;
    bib = bib.substring(0, bib.lastIndexOf('.'));
    return bib;
}

export {get_bib};