/// <reference path="../typings/globals/mocha/index.d.ts"/>
/// <reference path="../typings/globals/node/index.d.ts"/>
import * as assert from "assert";
import { snip } from "../src/snip";

describe("snip", () => {
    it("should snip a text block", () => {

        var contents = `ABC
DEF
GHI
--- snip ---
JKL
MNO
PQR
--- snip ---
STU
VWX`;

         var expected = `JKL
MNO
PQR`;

        var snipped = snip(contents);
        assert.equal(snipped[" "], expected);

    });

    it("should extract a named snippet", () => {

        var contents = `blah blah blah
more blah
--- snippet foo ---
Lorem ipsum
dolor sit amet
--- snip ---
don't --- snip this
and this line`
        var snipped = snip(contents, { joiner: " " });
        assert.equal(snipped["foo"], "Lorem ipsum dolor sit amet");
    });

    it("should extract a multipart snippet", () => {

        var contents = `blah blah blah
more blah
--- snippet: foo ---
Lorem ipsum
--- snip ---
junky junky junk
more junk
// ------- snip --------------
dolor sit amet
/* ---snip--- */
dont't snip this`
        var snipped = snip(contents, { joiner: " " });
        assert.equal(snipped["foo"], "Lorem ipsum dolor sit amet");
    });

    it("should extract multiple snippets", () => {

        var contents = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      --- snippet Paragraph 1 ----        
Quisque sagittis risus eu feugiat sollicitudin.
Donec ornare nunc et justo rhoncus, vitae tempor lorem iaculis.
Vestibulum pellentesque mauris lobortis urna cursus molestie.
--------- snip --------
Suspendisse eu quam a eros mattis posuere vel quis dolor.
---------- snip -----------
Morbi vitae neque finibus, luctus felis nec, laoreet nisi.
    /* ----snippet:Paragraph 2------- */
Curabitur eu enim pulvinar, varius magna et, condimentum tortor.
Praesent ac lectus sit amet elit molestie ullamcorper.
---snip--
Morbi nec nulla semper leo ullamcorper suscipit nec at ante.`
        var snipped = snip(contents);
        assert.equal(snipped["Paragraph 1"], `Quisque sagittis risus eu feugiat sollicitudin.
Donec ornare nunc et justo rhoncus, vitae tempor lorem iaculis.
Vestibulum pellentesque mauris lobortis urna cursus molestie.
Morbi vitae neque finibus, luctus felis nec, laoreet nisi.`);
        assert.equal(snipped["Paragraph 2"], `Curabitur eu enim pulvinar, varius magna et, condimentum tortor.
Praesent ac lectus sit amet elit molestie ullamcorper.`);

    });

    it("should preserve empty lines", () => {

        var contents = `ABC
--- snip ---        
DEF


GHI
--- snip ---
JKL`; 
        var snipped = snip(contents);
        assert.equal(snipped[" "], "DEF\n\n\nGHI");

    });

    it("should unindent text", () => {
         var contents = `ABC
--- snip ---        
  DEF
  GHI
    JKL
--- snip ---
MNO`; 
        var snipped = snip(contents, { unindent: true });
        assert.equal(snipped[" "], "DEF\nGHI\n  JKL");
    });

    it("should unindent text with empty lines", () => {
         var contents = `ABC
--- snip ---        
  DEF
  GHI


    JKL
--- snip ---
MNO`; 
        var snipped = snip(contents, { unindent: true });
        assert.equal(snipped[" "], "DEF\nGHI\n\n\n  JKL");
    });

     it("should not unindent text with non-indented lines", () => {
         var contents = `ABC
--- snip ---        
  DEF
GHI
    JKL
--- snip ---
MNO`; 
        var snipped = snip(contents, { unindent: true });
        assert.equal(snipped[" "], "  DEF\nGHI\n    JKL");
    });

    it("should unindent text with tabs", () => {
        var contents = "ABC\n--- snip ---\n\tDEF\n\t\tGHI\n\tJKL\n--- snip ---\nMNO"; 
        var snipped = snip(contents, { unindent: true });
        assert.equal(snipped[" "], "DEF\n    GHI\nJKL");
    });
});