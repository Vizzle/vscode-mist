
export enum TokenType {
    None,
    String,
    Number,
    Boolean,
    Null,
    Id,
    Arrow,

    // operators
    Add, Sub, Mul, Div, Mod,
    And, Or,
    Equal, NotEqual, EqualTriple, NotEqualTriple,
    GreaterThan, LessThan, GreaterOrEqual, LessOrEqual,
    Not,

    // punctuations
    OpenParen,
    OpenBracket,
    OpenBrace,
    CloseParen,
    CloseBracket,
    CloseBrace,
    Dot,
    Question,
    Colon,
    Comma,

    Unknown,
}

export enum LexerErrorCode {
    None,
    UnclosedString,
    UnclosedComment,
    InvalidNumber,
    InvalidEscape,
    InvalidUnicode,
    InvalidCharacter,
    UnknownToken,
}

const errors = [
    "no error",
    "unclosed string literal",
    "'*/' expected",
    "invalid number format",
    "invalid escaped character in string",
    "invalid unicode sequence in string",
    "invalid characters in string. control characters must be escaped",
    "unknown token",
];

export class Token {
    type: TokenType = TokenType.None;
    offset: number = 0;
    length: number = 0;
    value: any;
}

enum CharCode {
    Null = 0x0,
    Tab = 0x9,
    LineFeed = 0xA,
    CarriageReturn = 0xD,
    Space = 0x20,
    Exclamation = 0x21,
    DoubleQuote = 0x22,
    $ = 0x24,
    Percent = 0x25,
    Ampersand = 0x26,
    SingleQuote = 0x27,
    OpenParen = 0x28,
    CloseParen = 0x29,
    Asterisk = 0x2A,
    Plus = 0x2B,
    Comma = 0x2C,
    Minus = 0x2D,
    Dot = 0x2E,
    Slash = 0x2F,
    _0 = 0x30,
    _1 = 0x31,
    _9 = 0x39,
    Colon = 0x3A,
    LessThan = 0x3C,
    Equals = 0x3D,
    GreaterThan = 0x3E,
    Question = 0x3F,
    A = 0x41,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    S,
    T,
    U,
    V,
    W,
    X,
    Y,
    Z,
    OpenBracket = 0x5B,
    Backslash = 0x5C,
    CloseBracket = 0x5D,
    _ = 0x5F,
    a = 0x61,
    b,
    c,
    d,
    e,
    f,
    g,
    h,
    i,
    j,
    k,
    l,
    m,
    n,
    o,
    p,
    q,
    r,
    s,
    t,
    u,
    v,
    w,
    x,
    y,
    z,
    OpenBrace = 0x7B,
    Bar = 0x7C,
    CloseBrace = 0x7D,
}

let isalpha = (c: number) => (c >= CharCode.a && c <= CharCode.z) || (c >= CharCode.A && c <= CharCode.Z);
let isdigit = (c: number) => (c >= CharCode._0 && c <= CharCode._9);
let isalnum = (c: number) => (c >= CharCode.a && c <= CharCode.z) || (c >= CharCode.A && c <= CharCode.Z) || (c >= CharCode._0 && c <= CharCode._9);
let iscntrl = (c: number) => c < 32;

let isNewLine = (c: number) => c === CharCode.LineFeed || c === CharCode.CarriageReturn;
let isQuote = (c: number) => c === CharCode.SingleQuote || c === CharCode.DoubleQuote;

export class Lexer {
    public source: string;
    private length: number;
    private pointer: number;
    private c: number = 0;
    public line: number;
    public error: LexerErrorCode;
    public token: Token;
    public lookAheadToken: Token;

    public constructor(source: string) {
        this.source = source;
        this.length = source.length;
        this.line = 0;
        this.error = LexerErrorCode.None;
        this.pointer = -1;
        this.token = new Token()
        this.lookAheadToken = new Token()
        this._nextChar();
    }

    public static errorMessage(errorCode: LexerErrorCode): string {
        return errors[errorCode];
    }

    public next() {
        if (this.lookAheadToken.type !== TokenType.None) {
            this.token = this.lookAheadToken
            this.lookAheadToken = new Token()
        }
        else {
            this.token = new Token();
            this.token.type = this._next();
            this.token.length = this.pointer - this.token.offset;
            if (this.error) {
                this.token.type = TokenType.None;
            }
        }
        return this.token.type !== TokenType.None;
    }

    public lookAhead() {
        this.lookAheadToken = new Token()
        this.lookAheadToken.type = this._next(this.lookAheadToken);
        this.lookAheadToken.length = this.pointer - this.lookAheadToken.offset;
        if (this.error) {
            this.lookAheadToken.type = TokenType.None;
        }
    }

    public static allTokens(source: string, tokens: any[]) {
        let lexer = new Lexer(source);
        while (lexer.next()) {
            tokens.push(lexer.token);
        }
        return lexer.error;
    }

    private _nextChar() {
        this.pointer++;
        let c = this.source.charCodeAt(this.pointer);
        if (isNaN(c)) c = 0;
        this.c = c;
        return c;
    }

    private _newline() {
        let old = this.c;
        this._nextChar();
        if (isNewLine(this.c) && this.c !== old) {
            this._nextChar();
        }
        this.line++;
    }

    private _next(token: Token = this.token): TokenType {
        for (;;) {
            token.offset = this.pointer;
            
            let c = this.c;
            switch (c) {
                case CharCode.Null:
                    return TokenType.None;
                case CharCode.Space:
                case CharCode.Tab:
                    this._nextChar();
                    continue;
                case CharCode.LineFeed:
                case CharCode.CarriageReturn:
                    this._newline();
                    continue;
                case CharCode.Ampersand:
                    this._nextChar();
                    if (this.c === CharCode.Ampersand) {
                        this._nextChar();
                        return TokenType.And;
                    }
                    else {
                        return TokenType.Unknown
                    }
                case CharCode.Bar:
                    this._nextChar();
                    if (this.c === CharCode.Bar) {
                        this._nextChar();
                        return TokenType.Or;
                    }
                    else {
                        return TokenType.Unknown
                    }
                case CharCode.Equals:
                    this._nextChar();
                    if (this.c === CharCode.Equals) {
                        this._nextChar();
                        if (this.c === CharCode.Equals) {
                            this._nextChar();
                            return TokenType.EqualTriple;
                        }
                        return TokenType.Equal;
                    }
                    else {
                        return TokenType.Unknown
                    }
                case CharCode.Exclamation:
                    this._nextChar();
                    if (this.c === CharCode.Equals) {
                        this._nextChar();
                        if (this.c === CharCode.Equals) {
                            this._nextChar();
                            return TokenType.NotEqualTriple;
                        }
                        return TokenType.NotEqual;
                    }
                    else {
                        return TokenType.Not;
                    }
                case CharCode.GreaterThan:
                    this._nextChar();
                    if (this.c === CharCode.Equals) {
                        this._nextChar();
                        return TokenType.GreaterOrEqual;
                    }
                    else {
                        return TokenType.GreaterThan;
                    }
                case CharCode.LessThan:
                    this._nextChar();
                    if (this.c === CharCode.Equals) {
                        this._nextChar();
                        return TokenType.LessOrEqual;
                    }
                    else {
                        return TokenType.LessThan;
                    }
                case CharCode.Slash:
                    this._nextChar();
                    if (this.c === CharCode.Slash) { // single line comment
                        let c: CharCode;
                        do {
                            c = this._nextChar();
                        } while (!isNewLine(c) && c !== CharCode.Null);
                        continue;
                    } else if (this.c === CharCode.Asterisk) { // multi line comment
                        var closed = false;
                        do {
                            this._nextChar();
                            if (isNewLine(this.c)) {
                                this._newline();
                            }
                            else if (this.c === CharCode.Asterisk) {
                                this._nextChar();
                                this.c = this.c;
                                if (this.c === CharCode.Slash) {
                                    closed = true;
                                    this._nextChar();
                                    break;
                                }
                                else {
                                    continue;
                                }
                            }
                        } while (this.c !== CharCode.Null);
                        if (!closed) {
                            this.error = LexerErrorCode.UnclosedComment;
                        }
                        continue;
                    } else {
                        return TokenType.Div;
                    }
                case CharCode.Minus:
                    this._nextChar();
                    if (this.c === CharCode.GreaterThan) {
                        this._nextChar();
                        return TokenType.Arrow;
                    }
                    else {
                        return TokenType.Sub;
                    }
                case CharCode.Plus:
                    this._nextChar();
                    return TokenType.Add;
                case CharCode.Asterisk:
                    this._nextChar();
                    return TokenType.Mul;
                case CharCode.Percent:
                    this._nextChar();
                    return TokenType.Mod;
                case CharCode.OpenParen:
                    this._nextChar();
                    return TokenType.OpenParen;
                case CharCode.CloseParen:
                    this._nextChar();
                    return TokenType.CloseParen;
                case CharCode.OpenBracket:
                    this._nextChar();
                    return TokenType.OpenBracket;
                case CharCode.CloseBracket:
                    this._nextChar();
                    return TokenType.CloseBracket;
                case CharCode.OpenBrace:
                    this._nextChar();
                    return TokenType.OpenBrace;
                case CharCode.CloseBrace:
                    this._nextChar();
                    return TokenType.CloseBrace;
                case CharCode.Dot:
                    this._nextChar();
                    return TokenType.Dot;
                case CharCode.Question:
                    this._nextChar();
                    return TokenType.Question;
                case CharCode.Colon:
                    this._nextChar();
                    return TokenType.Colon;
                case CharCode.Comma:
                    this._nextChar();
                    return TokenType.Comma;
                default:
                    if (this.c === CharCode._ || this.c === CharCode.$ || isalpha(this.c)) {
                        let start = this.pointer;
                        do {
                            this._nextChar();
                            if (!(this.c === CharCode._ || isalnum(this.c))) {
                                break;
                            }
                        } while (this.c);
                        let len = this.pointer - start;
                        let str = this.source.substr(start, len);
                        if (str === 'null' || str === 'nil') {
                            token.value = null;
                            return TokenType.Null;
                        }
                        else if (str === 'true') {
                            token.value = true;
                            return TokenType.Boolean;
                        }
                        else if (str === 'false') {
                            token.value = false;
                            return TokenType.Boolean;
                        }
                        else {
                            token.value = str;
                            return TokenType.Id;
                        }
                    } else if (isdigit(this.c)) {
                        this._readNumber();
                        return TokenType.Number;
                    } else if (isQuote(this.c)) {
                        this._readString();
                        return TokenType.String;
                    } else {
                        this.error = LexerErrorCode.UnknownToken;
                        return TokenType.Unknown;
                    }
            }
        }
    }

    private _readNumber() {
        enum NumberState {
            Start,
            Nonzero,
            Dot,
            FractionalStart,
            Fractional,
            ExponentMark,
            ExponentSign,
            ExponentValue,
            Success,
            Error,
        }
        
        var state = NumberState.Start;
        let start = this.pointer;
        
        while (state !== NumberState.Success && state !== NumberState.Error) {
            switch (state) {
                case NumberState.Start:
                    if (this.c === CharCode._0) {
                        state = NumberState.Dot;
                        this._nextChar();
                    }
                    else if (this.c >= CharCode._1 && this.c <= CharCode._9) {
                        state = NumberState.Nonzero;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.Error;
                    }
                    break;
                case NumberState.Nonzero:
                    if (this.c >= CharCode._0 && this.c <= CharCode._9) {
                        this._nextChar();
                    }
                    else {
                        state = NumberState.Dot;
                    }
                    break;
                case NumberState.Dot:
                    if (this.c === CharCode.Dot) {
                        state = NumberState.FractionalStart;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.ExponentMark;
                    }
                    break;
                case NumberState.FractionalStart:
                    if (this.c >= CharCode._0 && this.c <= CharCode._9) {
                        state = NumberState.Fractional;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.Error;
                    }
                    break;
                case NumberState.Fractional:
                    if (this.c >= CharCode._0 && this.c <= CharCode._9) {
                        this._nextChar();
                    }
                    else {
                        state = NumberState.ExponentMark;
                    }
                    break;
                case NumberState.ExponentMark:
                    if (this.c === CharCode.E || this.c === CharCode.e) {
                        state = NumberState.ExponentSign;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.Success;
                    }
                    break;
                case NumberState.ExponentSign:
                    if (this.c === CharCode.Plus || this.c === CharCode.Minus) {
                        state = NumberState.ExponentValue;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.ExponentValue;
                    }
                    break;
                case NumberState.ExponentValue:
                    if (this.c >= CharCode._0 && this.c <= CharCode._9) {
                        this._nextChar();
                    }
                    else {
                        state = NumberState.Success;
                    }
                    break;
                default:
                    state = NumberState.Error;
                    break;
            }
        }
        
        if (state === NumberState.Success) {
            this.token.value = parseFloat(this.source.substring(start, this.pointer));
            return;
        }
        
        this.error = LexerErrorCode.InvalidNumber;
    }

    private static unicodeRE = /^[a-fA-F0-9]{4}/;

    private _readString() {
        let quote = this.c;
        
        this._nextChar();
        let start = this.pointer;
        var segmentStart = start;
        var segmentLen = 0;

        var ret = '';
        let pushCurrentSegment = () => {
            if (segmentLen > 0) {
                ret += this.source.substr(segmentStart, segmentLen);
                segmentLen = 0;
            }
            segmentStart = this.pointer + 1;
        };
        
        while (this.c !== quote) {
            let c = this.c;
            switch (c) {
                case CharCode.Null:
                    this.error = LexerErrorCode.UnclosedString;
                    return;
                case CharCode.LineFeed:
                case CharCode.CarriageReturn:
                    this._newline();
                    this.error = LexerErrorCode.UnclosedString;
                    return;
                case CharCode.Backslash:
                {
                    this._nextChar();
                    var esc = null;
                    switch (this.c) {
                        case CharCode.DoubleQuote:
                            esc = '"';
                            break;
                        case CharCode.SingleQuote:
                            esc = '\'';
                            break;
                        case CharCode.Backslash:
                            esc = '\\';
                            break;
                        case CharCode.Slash:
                            esc = '/';
                            break;
                        case CharCode.b:
                            esc = '\b';
                            break;
                        case CharCode.f:
                            esc = '\f';
                            break;
                        case CharCode.n:
                            esc = '\n';
                            break;
                        case CharCode.r:
                            esc = '\r';
                            break;
                        case CharCode.t:
                            esc = '\t';
                            break;
                        case CharCode.u:
                        {
                            if (this.pointer + 4 < this.length) {
                                Lexer.unicodeRE.lastIndex = 0;
                                let str = this.source.substr(this.pointer + 1, 4);
                                if (Lexer.unicodeRE.test(str)) {
                                   esc = String.fromCharCode(parseInt(str, 16));
                                   this.pointer += 4;
                                }
                                else {
                                    this.error = LexerErrorCode.InvalidUnicode;
                                }
                            }
                            break;
                        }
                        default:
                            if (this.c === CharCode.LineFeed || this.c === CharCode.Null) {
                                this.error = LexerErrorCode.UnclosedString;
                            }
                            else {
                                this.error = LexerErrorCode.InvalidEscape;
                            }
                            continue;
                    }
                    
                    pushCurrentSegment();
                    this._nextChar();
                    ret += esc;
                    break;
                }
                default:
                    if (iscntrl(this.c)) {
                        this.error = LexerErrorCode.InvalidCharacter;
                    }
                    segmentLen++;
                    this._nextChar();
                    break;
            }
        }
        // assert(this.c === quote);
        this._nextChar();
        if (ret.length > 0) {
            pushCurrentSegment();
            this.token.value = ret;
        }
        else {
            this.token.value = this.source.substr(start, segmentLen);
        }
    }
}
