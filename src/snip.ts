var snipRegEx = /^\W*-{3,}\s*snip/;
var snippetRegEx = /^\W*-{3,}\s*snippet:?\s*([^-]*)\s*/i;

function defaultMatcher(line: string): boolean|string {
    var snippetMatch = snippetRegEx.exec(line);
    if (snippetMatch)
        return typeof snippetMatch[1] === "string" ? snippetMatch[1].trim() : true;
    var snipMatch = snipRegEx.exec(line);
    if (snipMatch)
        return true;
    return false;
}

export interface SnipOptions {
    joiner?: string;
    matcher?: (line: string) => boolean|string;
    unindent?: boolean;
    tabSize?: number;
}

var spaceRegEx = /^\s+/;
var tabRegEx = /^\t+/;
var nonspaceRegEx = /\S/;

interface Snippet {
    indent?: number;
    lines: string[];
}

export function snip(contents: string, options?: SnipOptions): {[key: string]: string} {
    if (typeof contents !== "string")
        return {};
    options = options || {};
    options.joiner = options.joiner || "\n";
    options.matcher = options.matcher || defaultMatcher;
    options.tabSize = options.tabSize || 4;
    var tabStr = options.unindent ? "\t" : makeSpace(options.tabSize);
    var lines = contents.split(/\r?\n/);
    var snipping = false;
    var snippets: { [key: string]: Snippet } = {};
    var snippet: Snippet;
    lines.forEach(line => {
        var match = options.matcher(line);
        if (match) {
            if (typeof match === "string") {
                snippet = snippets[match] || (snippets[match] = { lines: [] });
                snipping = true;
            }
            else if (!snipping) {
                if (!snippet)
                    snippet = snippets[" "] = { lines: [] };
                snipping = true;    
            }
            else
                snipping = false;
        }
        else if (snipping && snippet) {
            if (options.unindent && nonspaceRegEx.test(line)) {
                var tabs = tabRegEx.exec(line);
                if (tabs)
                    line = makeSpace(tabs[0].length * options.tabSize) + line.substr(tabs[0].length);
                if (snippet.indent !== 0) {
                    var indent = spaceRegEx.exec(line);
                    if (indent) {
                        if (snippet.indent === undefined || indent[0].length < snippet.indent)
                            snippet.indent = indent[0].length; 
                    } else {
                        snippet.indent = 0;
                    }
                }
            }
            snippet.lines.push(line);
        }
    });
    if (options.unindent) {
        Object.getOwnPropertyNames(snippets).forEach(key => {
            var snippet = snippets[key];
            if (snippet.indent) {
                for (var i = 0; i < snippet.lines.length; i++)
                    snippet.lines[i] = snippet.lines[i].substr(snippet.indent);
            }
        });
    }
    var result: { [key: string] : string } = {};
    Object.keys(snippets).forEach(key => {
        result[key] = snippets[key].lines.join(options.joiner);
    });
    return result;
}

function makeSpace(n: number): string {
    var res = "";
    while (n) {
        res += " ";
        n--;
    }
    return res;
}