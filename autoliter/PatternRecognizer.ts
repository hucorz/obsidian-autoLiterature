class PatternRecognizer {
    private pattern: RegExp;

    constructor(pattern: RegExp) {
        this.pattern = pattern;
    }

    match(input: string): RegExpMatchArray | null {
        return input.match(this.pattern);
    }

    findAll(input: string): RegExpExecArray[] {
        const matches: RegExpExecArray[] = [];
        let match: RegExpExecArray | null;
      
        while ((match = this.pattern.exec(input)) !== null) {
          matches.push(match);
        }
        return matches;
    }

    multipleReplace(content: string, replaceDict: { [key: string]: string }): string {
        const replaceFn = (value: string): string => {
            const match = value;
            if (replaceDict.hasOwnProperty(match)) {
                return replaceDict[match];
            } else {
                throw new Error(`Not found ${match} in replaceDict`);
                // return match + " **Not Correct, Check it**";
            }
        };

        const replaceContent = content.replace(this.pattern, replaceFn);

        return replaceContent;
    }
}

export default PatternRecognizer;