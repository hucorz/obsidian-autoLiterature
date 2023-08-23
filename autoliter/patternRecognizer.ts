class patternRecognizer {
    private pattern: RegExp;

    constructor(pattern: RegExp) {
        this.pattern = pattern;
    }

    match(input: string): RegExpMatchArray | null {
        return input.match(this.pattern);
    }

    findAll(input: string): RegExpExecArray[] | null {
        const matches: RegExpExecArray[] = [];
        let match: RegExpExecArray | null;
      
        while ((match = this.pattern.exec(input)) !== null) {
          matches.push(match);
        }
        return matches;
    }
}

export default patternRecognizer;