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
import { getCurrentExpression, getSignatureInfo, getFunctionParamsCount } from '../src/mistDocument';
import { Lexer } from '../src/lexer';
import { Parser, ExpressionContext } from '../src/parser';
import { Type, Property, UnionType, IntersectionType, Method } from '../src/type';


function XCTAssertExpression(exp, result) {
    let { expression: node, errorMessage: error } = Parser.parse(exp);
    assert.equal(error, null, error);
    assert.deepEqual(node.compute(new ExpressionContext()), result);
};

function XCTAssertSameExpression(exp) {
    XCTAssertExpression(exp, eval(exp));
}


suite("Extension Tests", () => {

    test("type", () => {
        const NumberType = new Type('number');
        const StringType = new Type('string');
        let a = new Type('TypeA');
        a.registerProperty('prop1', new Property(NumberType));
        a.registerProperty('prop2', new Property(StringType));
        a.registerMethod('fun1', new Method(NumberType));
        a.registerMethod('fun2', new Method(StringType));
        a.registerMethod('fun3', new Method(StringType, null, [{name: 'p1', type: StringType}]));
        a.registerMethod('fun4', new Method(StringType));
        let b = new Type('TypeB');
        b.registerProperty('prop1', new Property(NumberType));
        b.registerProperty('prop2', new Property(NumberType));
        b.registerProperty('prop3', new Property(NumberType));
        b.registerMethod('fun1', new Method(NumberType));
        b.registerMethod('fun2', new Method(NumberType));
        b.registerMethod('fun3', new Method(StringType, null, [{name: 'p', type: NumberType}]));
        b.registerMethod('fun5', new Method(NumberType));
        let c = new UnionType(a, b);
        let d = new IntersectionType(a, b);
        for (let t of [a, b, c, d]) {
            console.log(t.getName());
            let ps = t.getAllProperties();
            Object.keys(ps).forEach(n => {
                let p = ps[n];
                console.log(`${p.ownerType ? `${p.ownerType.getName()}.` : ''}${n}: ${p.type.getName()}`);
            });
            let ms = t.getAllMethods();
            Object.keys(ms).forEach(n => {
                let m = ms[n];
                m.forEach(p => console.log(`${p.ownerType ? `${p.ownerType.getName()}.` : ''}${n}(${p.params.map(p => `${p.name}: ${p.type.getName()}`)}): ${p.type.getName()}`));
            });
        }
    });

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

    test("get params count", () => {
        assert.equal(getFunctionParamsCount("()"), 0);
        assert.equal(getFunctionParamsCount("(  \n  )"), 0);
        assert.equal(getFunctionParamsCount("(1)"), 1);
        assert.equal(getFunctionParamsCount("(1, 2, 3)"), 3);
        assert.equal(getFunctionParamsCount("(1, max(2, 3, 4), [1, 2, 3])"), 3);
    });

    test("lexer", () => {
        let lex = source => {
            let lexer = new Lexer(source);
            var tokens = [];
            while (lexer.next()) {
                tokens.push(source.substr(lexer.token.offset, lexer.token.length));
            }
            return tokens;
        }
        
        assert.deepEqual(lex("a bb ccc dddd 1.2345   true   +  '123',a.b 0.123e+15 \"'\\n\\u0020\""), ["a", "bb", "ccc", "dddd", "1.2345", "true", "+", "'123'", ',', 'a', '.', 'b', '0.123e+15', '"\'\\n\\u0020"']);
    });

    test("parser - types", () => {
        // Number
        XCTAssertSameExpression('1');
        XCTAssertSameExpression('0');
        XCTAssertSameExpression('-1');
        XCTAssertSameExpression('0.0000001');
        XCTAssertSameExpression('1.23456789');
        XCTAssertSameExpression('1.2345e3');
        XCTAssertSameExpression('1.2345e-3');
        
        // String
        XCTAssertExpression("'abc'", "abc");
        XCTAssertExpression("\"abc\"", "abc");
        XCTAssertExpression("'\"'", "\"");
        XCTAssertExpression("\"'\"", "'");
        XCTAssertExpression("'\\r\\n\\t\\f\\b\\\"\\\'\\\\\\/'", "\r\n\t\f\b\"\'\\/");
        XCTAssertExpression("'\\uface'", "\uface");
        XCTAssertExpression("'a\\nb'", "a\nb");
        XCTAssertExpression("'abc\\tdef\\\\\\n'", "abc\tdef\\\n");
        XCTAssertExpression("'\\nabcd\\u1234'", "\nabcd\u1234");
        XCTAssertExpression("'\\u1234abcd\\u1234ab'", "\u1234abcd\u1234ab");
        
        // true / false / null
        XCTAssertExpression("true", true);
        XCTAssertExpression("false", false);
        XCTAssertExpression("null", null);
        XCTAssertExpression("nil", null);
        
        // Array
        XCTAssertExpression("['a', 1, true]", (["a", 1, true]));
        XCTAssertExpression("[]", []);
        XCTAssertExpression("[1, 2, [3, 4]]", ([1, 2, [3, 4]]));
        
        // Dictionary
        XCTAssertExpression("{'a': 1, 'b': 2}", ({"a": 1, "b": 2}));
        XCTAssertExpression("{}", {});
        XCTAssertExpression("{1: 2, 3: 4}", ({1: 2, 3: 4}));
        XCTAssertExpression("{'a': true, 'b': {'c': 'd'}}", ({"a": true, "b": {"c": "d"}}));
    });

    test("parser - comments", () => {
        XCTAssertExpression("'abc' // comment", "abc");
        XCTAssertExpression("'abc' /* comment */", "abc");
        XCTAssertExpression("'abc'\n /* comment\ncomment\n */", "abc");
        XCTAssertExpression("'abc' //", "abc");
        XCTAssertExpression("'abc' /**/", "abc");
        XCTAssertExpression("/* comment */'abc'", "abc");
        XCTAssertExpression("/* comment */\n'abc'", "abc");
        XCTAssertExpression("1/* comment */ + /* comment */1", 2);
    });

    test("parser - operators", () => {
        XCTAssertSameExpression('1 + 1');
        XCTAssertSameExpression('5 * 5');
        XCTAssertSameExpression('10 - 5');
        XCTAssertSameExpression('10 - 5 - 5');
        XCTAssertSameExpression('1.0 / 10');
        XCTAssertSameExpression('1.0 / 10 / 10');
        XCTAssertSameExpression('-1 - 10');
        XCTAssertSameExpression('-(1 - 10)');
        XCTAssertSameExpression('10 + 5 * 2');
        XCTAssertSameExpression('1+(2-3)*(4.0/5-6)+((7-8)-(9+10))');
        
        XCTAssertSameExpression('5 > 0');
        XCTAssertSameExpression('5 > 5');
        XCTAssertSameExpression('5 > 10');
        XCTAssertSameExpression('5 < 0');
        XCTAssertSameExpression('5 < 5');
        XCTAssertSameExpression('5 < 10');
        XCTAssertSameExpression('5 >= 0');
        XCTAssertSameExpression('5 >= 5');
        XCTAssertSameExpression('5 >= 10');
        XCTAssertSameExpression('5 <= 0');
        XCTAssertSameExpression('5 <= 5');
        XCTAssertSameExpression('5 <= 10');
        XCTAssertSameExpression('5 == 10');
        XCTAssertSameExpression('5 == 5');
        XCTAssertSameExpression('5 != 10');
        XCTAssertSameExpression('5 != 5');
        XCTAssertSameExpression('1 + 1 == 2');
        XCTAssertSameExpression('1 + 1 != 2');
        
        XCTAssertSameExpression('true');
        XCTAssertSameExpression('false');
        XCTAssertSameExpression('!true');
        XCTAssertSameExpression('!false');
        XCTAssertSameExpression('!!true');
        XCTAssertSameExpression('!!false');
        XCTAssertSameExpression('true && true');
        XCTAssertSameExpression('true && false');
        XCTAssertSameExpression('false && true');
        XCTAssertSameExpression('true || true');
        XCTAssertSameExpression('true || false');
        XCTAssertSameExpression('false || true');
        XCTAssertSameExpression('!true && true');
        XCTAssertSameExpression('!true && false');
        XCTAssertSameExpression('!false && true');
        XCTAssertSameExpression('!true || true');
        XCTAssertSameExpression('!true || false');
        XCTAssertSameExpression('!false || true');
        XCTAssertSameExpression('true && !true');
        XCTAssertSameExpression('true && !false');
        XCTAssertSameExpression('false && !true');
        XCTAssertSameExpression('true || !true');
        XCTAssertSameExpression('true || !false');
        XCTAssertSameExpression('false || !true');
        XCTAssertSameExpression('!(true && true)');
        XCTAssertSameExpression('!(true && false)');
        XCTAssertSameExpression('!(false && true)');
        XCTAssertSameExpression('!(true || true)');
        XCTAssertSameExpression('!(true || false)');
        XCTAssertSameExpression('!(false || true)');
        XCTAssertSameExpression('false || false || true');
        XCTAssertSameExpression('false || false && true');
        XCTAssertSameExpression('(false || false) && true');
        XCTAssertSameExpression('false || (false && true)');
        XCTAssertSameExpression('true && false || true || false');
        XCTAssertSameExpression('true || false || true && true || false || true && false');
        
        XCTAssertSameExpression('true ? 1 : 0');
        XCTAssertSameExpression('false ? 1 : 0');
        XCTAssertSameExpression('true ? true ? 1 : 0 : 0');
        XCTAssertSameExpression('false ? true ? 1 : 0 : 0');
        XCTAssertSameExpression('false ? false ? 1 : 0 : 0');
        XCTAssertSameExpression('false ? true ? 1 : 0 : 0');
        XCTAssertSameExpression('true ? 1 : true ? 1 : 0');
        XCTAssertSameExpression('false ? 1 : true ? 1 : 0');
        XCTAssertSameExpression('true ? 1 : false ? 1 : 0');
        XCTAssertSameExpression('false ? 1 : false ? 1 : 0');
        XCTAssertSameExpression('true ? 1 : true ? 1 : 0 + 5');
        XCTAssertSameExpression('false ? 1 : true ? 1 : 0 + 5');
        XCTAssertSameExpression('true ? 1 : false ? 1 : 0 + 5');
        XCTAssertSameExpression('false ? 1 : false ? 1 : 0 + 5');
        XCTAssertSameExpression('3 + 2 >= 5 ? 1 : 1 - 1 == 0 ? 1 : 0');
    });

    test("expression", () => {
        let data = {
            "name": "Sleen",
            "age": 23,
            "items": ["item1", 1234],
            "friend": [
                {
                    "name": "John",
                    "tall": "175cm"
                },
                {
                    "name": "XX",
                    "age": 26,
                    "tall": 174
                }
            ]
        };
        let source = 'items';
        let { expression: exp, errorMessage: err } = Parser.parse(source);
        assert.equal(err, null);
        let ctx = new ExpressionContext();
        ctx.pushDict(data);
        let result = exp.compute(ctx);
        console.log(result, Type.typeof(data).getName());
    });

});