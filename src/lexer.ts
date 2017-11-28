import { fail } from "assert";


export enum TokenType {
    String,
    Number,
    Boolean,
    Null,
    Id,
    And,
    Or,
    Equal,
    NotEqual,
    GreaterOrEqaul,
    LessOrEqaul,
    Arrow,
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
}

export function errorMessage(errorCode: LexerErrorCode): string {
    const errors = [
        "no error",
        "unclosed string literal",
        "'*/' expected",
        "invalid number format",
        "invalid escaped character in string",
        "invalid unicode sequence in string",
        "invalid characters in string. control characters must be escaped"
    ]
    return errors[errorCode];
}

export class Token {
    type: TokenType | string;
    offset: number;
    length: number;
    value: any;
}

let isalpha = c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
let isdigit = c => (c >= '0' && c <= '9');
let isalnum = c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
let iscntrl = c => c.charCodeAt(0) < 32;

let isNewLine = c => c == '\r' || c == '\n';
let isQuote = c => c == '\'' || c == '"';

export class Lexer {
    public source: string;
    private length: number;
    private pointer: number;
    private c: string;
    private line: number;
    public error: LexerErrorCode;
    public token: Token;

    public constructor(source: string) {
        this.source = source;
        this.length = source.length;
        this.line = 0;
        this.error = null;
        this.pointer = -1;
        this.token = null;
        this._nextChar();
    }

    public next() {
        this.token = new Token();
        this.token.type = this._next();
        this.token.length = this.pointer - this.token.offset;
        if (this.token.type === null || this.error) {
            this.token = null;
        }
        return this.token;
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
        this.c = this.pointer >= this.length ? null : this.source[this.pointer];
    }

    private _newline() {
        let old = this.c;
        this._nextChar();
        if (isNewLine(this.c) && this.c != old) {
            this._nextChar();
        }
        this.line++;
    }

    private _next() {
        for(;;) {
            this.token.offset = this.pointer;
            
            let c = this.c;
            switch (c) {
                case null:
                    return null;
                case ' ':
                case '\t':
                    this._nextChar();
                    continue;
                case '\n':
                case '\r':
                    continue;
                case '&':
                    this._nextChar();
                    if (this.c == '&') {
                        this._nextChar();
                        return TokenType.And;
                    }
                    else {
                        TokenType.Unknown
                    }
                case '|':
                    this._nextChar();
                    if (this.c == '|') {
                        this._nextChar();
                        return TokenType.Or;
                    }
                    else {
                        TokenType.Unknown
                    }
                case '=':
                    this._nextChar();
                    if (this.c == '=') {
                        this._nextChar();
                        return TokenType.Equal;
                    }
                    else {
                        TokenType.Unknown
                    }
                case '!':
                    this._nextChar();
                    if (this.c == '=') {
                        this._nextChar();
                        return TokenType.NotEqual;
                    }
                    else {
                        return '!';
                    }
                case '>':
                    this._nextChar();
                    if (this.c == '=') {
                        this._nextChar();
                        return TokenType.GreaterOrEqaul;
                    }
                    else {
                        return '>';
                    }
                case '<':
                    this._nextChar();
                    if (this.c == '=') {
                        this._nextChar();
                        return TokenType.LessOrEqaul;
                    }
                    else {
                        return '<';
                    }
                case '/':
                    this._nextChar();
                    if (this.c == '/') { // single line comment
                        do {
                            this._nextChar();
                        } while (!isNewLine(this.c) && this.c != null);
                        continue;
                    } else if (this.c == '*') { // multi line comment
                        var closed = false;
                        do {
                            this._nextChar();
                            if (isNewLine(this.c)) {
                                this._newline();
                            }
                            else if (this.c == '*') {
                                this._nextChar();
                                this.c = this.c;
                                if (this.c == '/') {
                                    closed = true;
                                    this._nextChar();
                                    break;
                                }
                                else {
                                    continue;
                                }
                            }
                        } while (this.c != null);
                        if (!closed) {
                            this.error = LexerErrorCode.UnclosedComment;
                        }
                        continue;
                    } else {
                        return '/';
                    }
                case '-':
                    this._nextChar();
                    if (this.c == '>') {
                        this._nextChar();
                        return TokenType.Arrow;
                    }
                    else {
                        return '-';
                    }
                case '+':
                case '*':
                case '%':
                case '(':
                case ')':
                case '[':
                case ']':
                case '{':
                case '}':
                case '.':
                case '?':
                case ':':
                case ',':
                {
                    let type = this.c;
                    this._nextChar();
                    return type;
                }
                default:
                    if (this.c == '_' || isalpha(this.c)) {
                        let start = this.pointer;
                        do {
                            this._nextChar();
                            if (!(this.c == '_' || isalnum(this.c))) {
                                break;
                            }
                        } while (this.c);
                        let len = this.pointer - start;
                        let str = this.source.substr(start, len);
                        if (str === 'null' || str === 'nil') {
                            return TokenType.Null;
                        }
                        else if (str === 'true') {
                            this.token.value = true;
                            return TokenType.Boolean;
                        }
                        else if (str === 'false') {
                            this.token.value = false;
                            return TokenType.Boolean;
                        }
                        else {
                            this.token.value = str;
                            return TokenType.Id;
                        }
                    } else if (isdigit(this.c)) {
                        this._readNumber();
                        return TokenType.Number;
                    } else if (isQuote(this.c)) {
                        this._readString();
                        return TokenType.String;
                    } else {
                        TokenType.Unknown;
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
        
        while (state != NumberState.Success && state != NumberState.Error) {
            switch (state) {
                case NumberState.Start:
                    if (this.c == '0') {
                        state = NumberState.Dot;
                        this._nextChar();
                    }
                    else if (this.c >= '1' && this.c <= '9') {
                        state = NumberState.Nonzero;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.Error;
                    }
                    break;
                case NumberState.Nonzero:
                    if (this.c >= '0' && this.c <= '9') {
                        this._nextChar();
                    }
                    else {
                        state = NumberState.Dot;
                    }
                    break;
                case NumberState.Dot:
                    if (this.c == '.') {
                        state = NumberState.FractionalStart;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.ExponentMark;
                    }
                    break;
                case NumberState.FractionalStart:
                    if (this.c >= '0' && this.c <= '9') {
                        state = NumberState.Fractional;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.Error;
                    }
                    break;
                case NumberState.Fractional:
                    if (this.c >= '0' && this.c <= '9') {
                        this._nextChar();
                    }
                    else {
                        state = NumberState.ExponentMark;
                    }
                    break;
                case NumberState.ExponentMark:
                    if (this.c == 'E' || this.c == 'e') {
                        state = NumberState.ExponentSign;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.Success;
                    }
                    break;
                case NumberState.ExponentSign:
                    if (this.c == '+' || this.c == '-') {
                        state = NumberState.ExponentValue;
                        this._nextChar();
                    }
                    else {
                        state = NumberState.ExponentValue;
                    }
                    break;
                case NumberState.ExponentValue:
                    if (this.c >= '0' && this.c <= '9') {
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
        
        if (state == NumberState.Success) {
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
        var segment_start = start;
        var segment_len = 0;

        var ret = '';
        let pushCurrentSegment = () => {
            if (segment_len > 0) {
                ret += this.source.substr(segment_start, segment_len);
                segment_len = 0;
            }
            segment_start = this.pointer + 1;
        };
        
        while (this.c != quote) {
            let c = this.c;
            switch (c) {
                case null:
                    this.error = LexerErrorCode.UnclosedString;
                    return;
                case '\n':
                case '\r':
                    this._newline();
                    this.error = LexerErrorCode.UnclosedString;
                    return;
                case '\\':
                {
                    this._nextChar();
                    var esc = null;
                    switch (this.c) {
                        case '"':
                            esc = '"';
                            break;
                        case '\'':
                            esc = '\'';
                            break;
                        case '\\':
                            esc = '\\';
                            break;
                        case '/':
                            esc = '/';
                            break;
                        case 'b':
                            esc = '\b';
                            break;
                        case 'f':
                            esc = '\f';
                            break;
                        case 'n':
                            esc = '\n';
                            break;
                        case 'r':
                            esc = '\r';
                            break;
                        case 't':
                            esc = '\t';
                            break;
                        case 'u':
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
                            if (this.c == '\n' || this.c == null) {
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
                    segment_len++;
                    this._nextChar();
                    break;
            }
        }
        // assert(this.c == quote);
        this._nextChar();
        if (ret.length > 0) {
            pushCurrentSegment();
            this.token.value = ret;
        }
        else {
            this.token.value = this.source.substr(start, segment_len);
        }
    }
}
