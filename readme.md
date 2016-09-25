# snip-text

Snip and extract parts from text content. Useful for automatically testing and updating code snippets in your documentation.
I created this simple tool to make sure my code examples are actually working. The package exports a simple function (`snip`)
that finds specific 'snip marks' in text content and extracts named snippets to a javascript object. 

Suppose you have a .js file that contains code examples for your documentation, embedded into unit tests:

examples.js

```js
describe("Code examples", () => {
    describe("Feature 1", () => {
        it("example", () => {
            sinon.spy(console, "log");
            try {
                // --- snippet: snippet 1 ---
                var obj = myAwesomeFeature();
                console.log(obj.result);
                // Output:
                // expected output
                // --- snip ---
            } finally {
                console.log.restore();
            }
            assert(console.log.calledWith("expected output"));
        });    
    });        

    describe("Feature 2", () => {
        it("example", () => {

            // --- snippet: snippet 2 ---
            var obj = myOtherFeature("foo");
            // obj now contains property bar with value 'baz'
            // --- snip ---
            assert(obj.bar == 'baz');
        });    
    });     
});
```

When you pass the contents of this file (as a string) to `snip`, it will produce the following object:

```js
{
	"snippet 1": "var obj = myAwesomeFeature();\nconsole.log(obj.result);\n// Output:\n// expected output",
	"snippet 2": "var obj = myOtherFeature(\"foo\");\n// obj now contains property bar with value 'baz'"
}
```

Now you can use a tool like `gulp-template` to insert the extracted code snippets into your documentation.

A snippet can consist of multiple parts. Snip marks in the content toggle snipping on/off for the last named snippet:

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
--- snippet: Lipsum ---
Maecenas suscipit risus tincidunt lectus pretium, vitae pellentesque eros malesuada.
Praesent eget libero sed massa blandit mattis ac et dolor.
--- snip ---
Phasellus eget velit non dui pharetra laoreet.
Etiam sodales velit vitae risus commodo, in sagittis velit gravida.
--- snip ---
Maecenas gravida orci id purus suscipit faucibus.
``` 

Passing this text to `snip` will produce an object with the `Lipsum` property containing the following text:

```
Maecenas suscipit risus tincidunt lectus pretium, vitae pellentesque eros malesuada.
Praesent eget libero sed massa blandit mattis ac et dolor.
Maecenas gravida orci id purus suscipit faucibus.
``` 

The function that recognises snip marks can be overriden. By default, `snip` looks for a line that 
starts with non-word characters, followed by at least 3 dashes, then followed by either the text 'snip' 
or the text 'snippet' or 'snippet:' followed by any string without dashes (the snippet name) 

The following lines are all recognised as snip markers:

```
--- snip ---
-------snip
    // --- snip 
    /* ------- snippet: foo -------------*/
``` 

The following lines are not snip markers:

```
-- snip (at least 3 dashes required)
// don't --- snip this (alphanumeric characters before the dashes)
// snippet: foo ---- (no leading dashes)
```

If the first snip marker in the text content does not have a name specified, `snip` will use a single space (`" "`) as the snippet name.

Snip markers with a name always turn snipping on for the specified snippet, ie. snipping this text:

```
--- snippet: Lipsum
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Maecenas suscipit risus tincidunt lectus pretium, vitae pellentesque eros malesuada.
--- snippet: Lipsum
Praesent eget libero sed massa blandit mattis ac et dolor.
Phasellus eget velit non dui pharetra laoreet.
--- snip ---
Etiam sodales velit vitae risus commodo, in sagittis velit gravida.
Maecenas gravida orci id purus suscipit faucibus.
```

will produce a snippet called "Lipsum" with the following content:

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Maecenas suscipit risus tincidunt lectus pretium, vitae pellentesque eros malesuada.
Praesent eget libero sed massa blandit mattis ac et dolor.
Phasellus eget velit non dui pharetra laoreet.
```

## Using the `snip` function

Pass the text contents as a string to `snip`: 

```js
var snippets = snip(text, options);
```

The optional `options` parameter is used to control some features of `snip`:   

### unindent

Type: `boolean`

Default: `false`

Removes leading white space from the snippets (used to produce the first example in this document).

### tabSize

Type: `number`

Default: 4

Used with the `unindent` option, specifies the number of spaces that `tab` characters are translated to.

### joiner

Type: string

Default: `"\n"`

Specifies the string with which the lines of the snippet will be joined.

### matcher 

Type: `(line: string) => boolean | string`

Replaces the default function for recognising snip markers. The function should return a thruthful value if the line is a snip marker.
If the returned value is a string, it will be used as the snippet name.
