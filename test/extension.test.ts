//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/mistMain';
import { getCurrentExpression, getSignatureInfo } from '../src/mistDocument';
import { Lexer } from '../src/lexer';

suite("Extension Tests", () => {

    test("get current expression", () => {
        assert.equal(getCurrentExpression("aaa.bbb.ccc"), "aaa.bbb.ccc");
        assert.equal(getCurrentExpression("aaa.bbb."), "aaa.bbb.");
        assert.equal(getCurrentExpression("aaa."), "aaa.");
        assert.equal(getCurrentExpression("aaa"), "aaa");
        assert.equal(getCurrentExpression("aaa "), "");
        assert.equal(getCurrentExpression("aaa bb"), "bb");
        assert.equal(getCurrentExpression(""), "");
        assert.equal(getCurrentExpression("''."), "''.");
        assert.equal(getCurrentExpression("a.b[c].d"), "a.b[c].d");
        assert.equal(getCurrentExpression("abc.def(ab, cd(1, 2), def[0]).cc[1]."), "abc.def(ab, cd(1, 2), def[0]).cc[1].");
        assert.equal(getCurrentExpression("abc.def(ab, cd(1, 2), def"), "def");
        assert.equal(getCurrentExpression("abc.def(ab, cd(1, 2), def."), "def.");
        assert.equal(getCurrentExpression("abc.def(ab, cd(1, 2).def"), "cd(1, 2).def");
        assert.equal(getCurrentExpression("abc.def(ab, cd(1, 2)."), "cd(1, 2).");
        assert.equal(getCurrentExpression("abc.def(ab, cd(1, 2).def"), "cd(1, 2).def");
        assert.equal(getCurrentExpression("abc.def(ab, cd(a."), "a.");
        assert.equal(getCurrentExpression("abc.def(ab, [1, 2].join"), "[1, 2].join");
        assert.equal(getCurrentExpression("abc.def(ab, (1 + 2)."), "(1 + 2).");
        assert.equal(getCurrentExpression("abc.def(ab, 'abc'.substring(0, 2).split(' ')."), "'abc'.substring(0, 2).split(' ').");
        assert.equal(getCurrentExpression("state.set_value(_data_.test."), "_data.test.")
    });

    test("get signature info", () => {
        assert.deepEqual(getSignatureInfo("max("), {prefix: null, function: 'max', paramIndex: 0});
        assert.deepEqual(getSignatureInfo("max(1, "), {prefix: null, function: 'max', paramIndex: 1});
        assert.deepEqual(getSignatureInfo("max(1, ab "), {prefix: null, function: 'max', paramIndex: 1});
        assert.deepEqual(getSignatureInfo("max(min(1, 2), "), {prefix: null, function: 'max', paramIndex: 1});
        assert.deepEqual(getSignatureInfo("max(min(1, 2), min(2, "), {prefix: null, function: 'min', paramIndex: 1});
        assert.deepEqual(getSignatureInfo("max(min(1, 2), c(1,2).a[1].min(a.b(a, b[2], c.d(a, b), d), "), {prefix: 'c(1,2).a[1]', function: 'min', paramIndex: 1});

        assert.deepEqual(getSignatureInfo("max()"), null);
    });

    test("lexer", () => {
        let lex = source => {
            let lexer = new Lexer(source);
            var tokens = [];
            while (lexer.next(), lexer.token) {
                tokens.push(source.substr(lexer.token.offset, lexer.token.length));
            }
            return tokens;
        }
        
        assert.deepEqual(lex("a bb ccc dddd 1.2345   true   +  '123',a.b 0.123e+15 \"'\\n\\u0020\""), ["a", "bb", "ccc", "dddd", "1.2345", "true", "+", "'123'", ',', 'a', '.', 'b', '0.123e+15', '"\'\\n\\u0020"']);
    });
});