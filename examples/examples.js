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