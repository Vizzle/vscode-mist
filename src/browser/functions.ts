import { Parser } from './parser';

function _for(start, end, step) {
  if (step === 0) step = 1;
  step = Math.abs(step);

  let array = [];
  let count = Math.ceil((end - start) / step);
  for (var i = 0; i < count; i++) {
    array.push(start + step * i);
  }
  return array;
}

function _randomInt(min, max) {
  min = Math.floor(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function _flatten(_this: any[], recursive: boolean = false) {
  let array = [];
  for (var value of _this) {
    if (value instanceof Array) {
      array.push(...(recursive ? _flatten(value, true) : value));
    }
    else {
      array.push(value);
    }
  }
  return array;
}

export let functions = {
  "global": {
    "$": [
      {
        "params": [
          {
            "type": "number",
            "name": "tag"
          }
        ],
        "return": "View",
        "comment": "通过 tag 获取 View，同 template controller 上的 `viewWithTag:`"
      }
    ],
    "transform": [
      {
        "params": [
          {
            "type": "CGFloat", 
            "name": "m11"
          }, 
          {
            "type": "CGFloat", 
            "name": "m12"
          }, 
          {
            "type": "CGFloat", 
            "name": "m13"
          }, 
          {
            "type": "CGFloat", 
            "name": "m14"
          }, 
          {
            "type": "CGFloat", 
            "name": "m21"
          }, 
          {
            "type": "CGFloat", 
            "name": "m22"
          }, 
          {
            "type": "CGFloat", 
            "name": "m23"
          }, 
          {
            "type": "CGFloat", 
            "name": "m24"
          }, 
          {
            "type": "CGFloat", 
            "name": "m31"
          }, 
          {
            "type": "CGFloat", 
            "name": "m32"
          }, 
          {
            "type": "CGFloat", 
            "name": "m33"
          }, 
          {
            "type": "CGFloat", 
            "name": "m34"
          }, 
          {
            "type": "CGFloat", 
            "name": "m41"
          }, 
          {
            "type": "CGFloat", 
            "name": "m42"
          }, 
          {
            "type": "CGFloat", 
            "name": "m43"
          }, 
          {
            "type": "CGFloat", 
            "name": "m44"
          }
        ], 
        "return": "CATransform3D"
      }, 
      {
        "params": [
          {
            "type": "CGFloat", 
            "name": "a"
          }, 
          {
            "type": "CGFloat", 
            "name": "b"
          }, 
          {
            "type": "CGFloat", 
            "name": "c"
          }, 
          {
            "type": "CGFloat", 
            "name": "d"
          }, 
          {
            "type": "CGFloat", 
            "name": "tx"
          }, 
          {
            "type": "CGFloat", 
            "name": "ty"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "point": [
      {
        "params": [
          {
            "type": "double", 
            "name": "x"
          }, 
          {
            "type": "double", 
            "name": "y"
          }
        ], 
        "return": "CGPoint"
      }
    ], 
    "concat": [
      {
        "params": [
          {
            "type": "CATransform3D", 
            "name": "a"
          }, 
          {
            "type": "CATransform3D", 
            "name": "b"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "pow": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }, 
          {
            "type": "double", 
            "name": "b"
          }
        ], 
        "return": "double",
        "js": Math.pow
      }
    ], 
    "random": [
      {
        "comment": "返回 [0, 1) 的随机数", 
        "return": "double",
        "js": Math.random
      }, 
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }, 
          {
            "type": "double", 
            "name": "b"
          }
        ], 
        "return": "double",
        "js": (a, b) => a + Math.random() * (b - a)
      }
    ], 
    "sign": [
      {
        "comment": " 1: a > 0\n-1: a < 0\n 0: a == 0", 
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": a => Math.sign(a)
      }
    ], 
    "makeScale": [
      {
        "params": [
          {
            "type": "CGFloat", 
            "name": "sx"
          }, 
          {
            "type": "CGFloat", 
            "name": "sy"
          }, 
          {
            "type": "CGFloat", 
            "name": "sz"
          }
        ], 
        "return": "CATransform3D"
      }, 
      {
        "params": [
          {
            "type": "CGFloat", 
            "name": "sx"
          }, 
          {
            "type": "CGFloat", 
            "name": "sy"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "E": [
      {
        "return": "double",
        "js": () => Math.E
      }
    ], 
    "tan": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.tan
      }
    ], 
    "size": [
      {
        "params": [
          {
            "type": "double", 
            "name": "width"
          }, 
          {
            "type": "double", 
            "name": "height"
          }
        ], 
        "return": "CGSize"
      }
    ], 
    "scale": [
      {
        "params": [
          {
            "type": "CATransform3D", 
            "name": "t"
          }, 
          {
            "type": "CGFloat", 
            "name": "sx"
          }, 
          {
            "type": "CGFloat", 
            "name": "sy"
          }, 
          {
            "type": "CGFloat", 
            "name": "sz"
          }
        ], 
        "return": "CATransform3D"
      }, 
      {
        "params": [
          {
            "type": "CATransform3D", 
            "name": "t"
          }, 
          {
            "type": "CGFloat", 
            "name": "sx"
          }, 
          {
            "type": "CGFloat", 
            "name": "sy"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "log": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.log
      }, 
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }, 
          {
            "type": "double", 
            "name": "b"
          }
        ], 
        "return": "double",
        "js": (a, b) => Math.log(b) / Math.log(a)
      }
    ], 
    "for": [
      {
        "comment": " 返回 `start` 到 `count`（不含） 的数字组成的数组，步长为 `step`\n\n `for(5, 8, 0.5)`       =>      `[5, 5.5, 6, 6.5, 7, 7.5]`", 
        "params": [
          {
            "type": "double", 
            "name": "start"
          }, 
          {
            "type": "double", 
            "name": "end"
          }, 
          {
            "type": "double", 
            "name": "step"
          }
        ], 
        "return": "NSArray*",
        "js": _for
      }, 
      {
        "comment": " 返回 `start` 到 `count - 1` 的数字组成的数组\n\n `for(5, 8)`       =>      `[5, 6, 7]`", 
        "params": [
          {
            "type": "double", 
            "name": "start"
          }, 
          {
            "type": "double", 
            "name": "end"
          }
        ], 
        "return": "NSArray*",
        "js": (start, end) => _for(start, end, 1)
      }, 
      {
        "comment": " 返回 `0` 到 `count - 1` 的数字组成的数组\n\n `for(5)`       =>      `[0, 1, 2, 3, 4]`", 
        "params": [
          {
            "type": "double", 
            "name": "count"
          }
        ], 
        "return": "NSArray*",
        "js": (count) => _for(0, count, 1)
      }
    ], 
    "floor": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.floor
      }
    ], 
    "makeTranslation": [
      {
        "params": [
          {
            "type": "CGFloat", 
            "name": "tx"
          }, 
          {
            "type": "CGFloat", 
            "name": "ty"
          }, 
          {
            "type": "CGFloat", 
            "name": "tz"
          }
        ], 
        "return": "CATransform3D"
      }, 
      {
        "params": [
          {
            "type": "CGFloat", 
            "name": "tx"
          }, 
          {
            "type": "CGFloat", 
            "name": "ty"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "invert": [
      {
        "params": [
          {
            "type": "CATransform3D", 
            "name": "t"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "m34": [
      {
        "comment": "单位矩阵设置 m34 的值，一般用于创建 3D 旋转", 
        "params": [
          {
            "type": "CGFloat", 
            "name": "m34"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "inset": [
      {
        "params": [
          {
            "type": "double", 
            "name": "top"
          }, 
          {
            "type": "double", 
            "name": "left"
          }, 
          {
            "type": "double", 
            "name": "bottom"
          }, 
          {
            "type": "double", 
            "name": "right"
          }
        ], 
        "return": "UIEdgeInsets"
      }
    ], 
    "sqrt": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.sqrt
      }
    ], 
    "transformSet": [
      {
        "comment": "设置指定行列的值，并返回新的矩阵", 
        "params": [
          {
            "type": "CATransform3D", 
            "name": "transform"
          }, 
          {
            "type": "NSUInteger", 
            "name": "row"
          }, 
          {
            "type": "NSUInteger", 
            "name": "column"
          }, 
          {
            "type": "CGFloat", 
            "name": "value"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "color": [
      {
        "params": [
          {
            "type": "NSString*", 
            "name": "str"
          }
        ], 
        "return": "UIColor*"
      }
    ], 
    "rgb": [
      {
        "params": [
          {
            "type": "double", 
            "name": "r"
          }, 
          {
            "type": "double", 
            "name": "g"
          }, 
          {
            "type": "double", 
            "name": "b"
          }
        ], 
        "return": "UIColor*"
      }
    ], 
    "abs": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.abs
      }
    ], 
    "identity": [
      {
        "comment": "单位矩阵", 
        "return": "CATransform3D"
      }
    ], 
    "rgba": [
      {
        "params": [
          {
            "type": "double", 
            "name": "r"
          }, 
          {
            "type": "double", 
            "name": "g"
          }, 
          {
            "type": "double", 
            "name": "b"
          }, 
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "UIColor*"
      }
    ], 
    "print": [
      {
        "params": [
          {
            "type": "id", 
            "name": "obj"
          }
        ], 
        "return": "id",
        "js": obj => {
          console.log(obj);
          return obj;
        }
      }
    ], 
    "PI": [
      {
        "return": "double",
        "js": () => Math.PI
      }
    ], 
    "log10": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.log10
      }
    ], 
    "sin": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.sin
      }
    ], 
    "log2": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.log2
      }
    ], 
    "cgcolor": [
      {
        "params": [
          {
            "type": "NSString*", 
            "name": "str"
          }
        ], 
        "return": "CGColorRef"
      }
    ], 
    "max": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }, 
          {
            "type": "double", 
            "name": "b"
          }
        ], 
        "return": "double",
        "js": Math.max
      }
    ], 
    "ceil": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.ceil
      }
    ], 
    "randomInt": [
      {
        "comment": "返回一个不小于 0 的随机整数", 
        "return": "uint",
        "js": () => _randomInt(0, 0x100000000)
      }, 
      {
        "comment": "返回 [a, b) 的随机整数", 
        "params": [
          {
            "type": "int", 
            "name": "a"
          }, 
          {
            "type": "int", 
            "name": "b"
          }
        ], 
        "return": "int",
        "js": _randomInt
      }
    ], 
    "rotate": [
      {
        "params": [
          {
            "type": "CATransform3D", 
            "name": "t"
          }, 
          {
            "type": "CGFloat", 
            "name": "angle"
          }, 
          {
            "type": "CGFloat", 
            "name": "x"
          }, 
          {
            "type": "CGFloat", 
            "name": "y"
          }, 
          {
            "type": "CGFloat", 
            "name": "z"
          }
        ], 
        "return": "CATransform3D"
      }, 
      {
        "params": [
          {
            "type": "CATransform3D", 
            "name": "t"
          }, 
          {
            "type": "CGFloat", 
            "name": "angle"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "alert": [
      {
        "params": [
          {
            "type": "id", 
            "name": "obj"
          }
        ], 
        "return": "id",
        "js": obj => {
          alert(JSON.stringify(obj, null, '\t'));
          return obj;
        }
      }
    ], 
    "rect": [
      {
        "params": [
          {
            "type": "CGPoint", 
            "name": "origin"
          }, 
          {
            "type": "CGSize", 
            "name": "size"
          }
        ], 
        "return": "CGRect"
      }, 
      {
        "params": [
          {
            "type": "double", 
            "name": "x"
          }, 
          {
            "type": "double", 
            "name": "y"
          }, 
          {
            "type": "double", 
            "name": "width"
          }, 
          {
            "type": "double", 
            "name": "height"
          }
        ], 
        "return": "CGRect"
      }
    ], 
    "trunc": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.trunc
      }
    ], 
    "cos": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.cos
      }
    ], 
    "translate": [
      {
        "params": [
          {
            "type": "CATransform3D", 
            "name": "t"
          }, 
          {
            "type": "CGFloat", 
            "name": "tx"
          }, 
          {
            "type": "CGFloat", 
            "name": "ty"
          }, 
          {
            "type": "CGFloat", 
            "name": "tz"
          }
        ], 
        "return": "CATransform3D"
      }, 
      {
        "params": [
          {
            "type": "CATransform3D", 
            "name": "t"
          }, 
          {
            "type": "CGFloat", 
            "name": "tx"
          }, 
          {
            "type": "CGFloat", 
            "name": "ty"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "HUGENUM": [
      {
        "return": "double",
        "js": () => 1e50
      }
    ], 
    "min": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }, 
          {
            "type": "double", 
            "name": "b"
          }
        ], 
        "return": "double",
        "js": Math.min
      }
    ], 
    "range": [
      {
        "params": [
          {
            "type": "double", 
            "name": "loc"
          }, 
          {
            "type": "double", 
            "name": "len"
          }
        ], 
        "return": "NSRange"
      }
    ], 
    "makeRotation": [
      {
        "params": [
          {
            "type": "CGFloat", 
            "name": "angle"
          }, 
          {
            "type": "CGFloat", 
            "name": "x"
          }, 
          {
            "type": "CGFloat", 
            "name": "y"
          }, 
          {
            "type": "CGFloat", 
            "name": "z"
          }
        ], 
        "return": "CATransform3D"
      }, 
      {
        "params": [
          {
            "type": "CGFloat", 
            "name": "angle"
          }
        ], 
        "return": "CATransform3D"
      }
    ], 
    "fmod": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }, 
          {
            "type": "double", 
            "name": "b"
          }
        ], 
        "return": "double",
        "js": (a, b) => a % b
      }
    ], 
    "round": [
      {
        "params": [
          {
            "type": "double", 
            "name": "a"
          }
        ], 
        "return": "double",
        "js": Math.round
      }
    ], 
    "eval": [
      {
        "params": [
          {
            "type": "string", 
            "name": "expression"
          }
        ], 
        "return": "any",
        "js": (exp, context) => {
          var { expression: expression } = Parser.parse(exp);
          if (expression) {
            return expression.computeValue(context);
          }
          return null;
        }
      }
    ]
  }, 
  "View": {
    "animation": [
      {
        "comment": "播放动画", 
        "params": [
          {
            "type": "(view: View) => void", 
            "name": "animationBlock"
          }
        ], 
        "return": "View"
      },
      {
        "comment": "播放动画，完成后回调", 
        "params": [
          {
            "type": "(view: View) => void", 
            "name": "animationBlock"
          },
          {
            "type": "(view: View) => void", 
            "name": "completionBlock"
          }
        ], 
        "return": "View"
      }
    ]
  },
  "NSDictionary": {
    "set_value": [
      {
        "comment": " 字典设置一个值并返回新的字典\n\n `{'a': 1}.set_value('b', 2)`      =>      `{'a': 1, 'b': 2}`", 
        "params": [
          {
            "type": "NSString*", 
            "name": "key"
          }, 
          {
            "type": "id", 
            "name": "value"
          }
        ], 
        "return": "NSDictionary*",
        "js": (_this, key, value) => {
          _this[key] = value;
          return _this;
        }
      }
    ]
  }, 
  "NSString": {
    "trim": [
      {
        "comment": "移除首尾空白字符", 
        "return": "NSString*",
        "js": (_this: string) => _this.trim()
      }
    ], 
    "sub_string": [
      {
        "comment": "返回给定范围内的子串", 
        "params": [
          {
            "type": "NSInteger", 
            "name": "start"
          }, 
          {
            "type": "NSUInteger", 
            "name": "length"
          }
        ], 
        "return": "NSString*", 
        "deprecated": "使用 `substring` 代替",
        "js": (_this: string, start, length) => _this.substr(start, length)
      }
    ], 
    "replace": [
      {
        "comment": "替换所有", 
        "params": [
          {
            "type": "NSString*", 
            "name": "target"
          }, 
          {
            "type": "NSString*", 
            "name": "replacement"
          }
        ], 
        "return": "NSString*",
        "js": (_this: string, target, replacement) => _this.replace(new RegExp(target, "mg"), replacement)
      }
    ], 
    "substring": [
      {
        "comment": "返回从给定位置开始的子串，如果 start 为负数，则表示从后往前数", 
        "params": [
          {
            "type": "NSInteger", 
            "name": "start"
          }
        ], 
        "return": "NSString*",
        "js": (_this: string, start) => _this.substr(start)
      }, 
      {
        "comment": "返回给定范围内的子串，如果 start 为负数，则表示从后往前数", 
        "params": [
          {
            "type": "NSInteger", 
            "name": "start"
          }, 
          {
            "type": "NSUInteger", 
            "name": "length"
          }
        ], 
        "return": "NSString*",
        "js": (_this: string, start, length) => _this.substr(start, length)
      }
    ], 
    "split": [
      {
        "comment": "使用指定分割符分割字符串，返回数组", 
        "params": [
          {
            "type": "NSString*", 
            "name": "separator"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: string, separator) => _this.split(separator)
      }
    ], 
    "replace_with": [
      {
        "comment": "替换所有", 
        "params": [
          {
            "type": "NSString*", 
            "name": "target"
          }, 
          {
            "type": "NSString*", 
            "name": "replacement"
          }
        ], 
        "return": "NSString*", 
        "deprecated": "使用 `replace` 代替",
        "js": (_this: string, target, replacement) => _this.replace(new RegExp(target, "mg"), replacement)
      }
    ], 
    "find": [
      {
        "comment": "返回给定子串在字符串中的开始位置", 
        "params": [
          {
            "type": "NSString*", 
            "name": "str"
          }
        ], 
        "return": "NSInteger",
        "js": (_this: string, str) => _this.indexOf(str)
      }
    ]
  }, 
  "NSDate": {
    "format": [
      {
        "params": [
          {
            "type": "NSString*", 
            "name": "format"
          }
        ], 
        "return": "NSString*"
      }
    ]
  }, 
  "NSArray": {
    "all": [
      {
        "comment": " 是否所有元素都满足条件\n\n `[11, 12, 13, 14].all(n -> n % 2 == 0)`      =>      `false`", 
        "params": [
          {
            "type": "(element: any) => any", 
            "name": "block"
          }
        ], 
        "return": "BOOL",
        "js": (_this: any[], cb: (obj: any) => boolean) => _this.every(cb)
      }
    ], 
    "repeat": [
      {
        "comment": " 重复所有元素指定的次数\n\n `[1, 2, 3].repeat(2)`      =>      `[1, 2, 3, 1, 2, 3]`", 
        "params": [
          {
            "type": "NSUInteger", 
            "name": "count"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: any[], count: number) => {
          let array = [];
          while (count-- > 0) {
            array.push(..._this);
          }
          return array;
        }
      }
    ], 
    "last": [
      {
        "comment": " 最后一个元素，没有元素时返回 `nil`\n\n `['a', 'b', 'c'].last()`      =>      `'c'`", 
        "return": "id",
        "js": (_this: any[]) => _this.length > 0 ? _this[_this.length - 1] : null
      }, 
      {
        "comment": " 最后一个满足条件的元素，没有满足条件的元素时返回 `nil`\n\n `[11, 12, 13, 14].last(n -> n % 2 == 0)`       =>      `14`", 
        "params": [
          {
            "type": "(element: any) => any", 
            "name": "block"
          }
        ], 
        "return": "id",
        "js": (_this: any[], cb: (obj: any) => boolean) => {
          for (var i = _this.length - 1; i >= 0; i--) {
            let obj = _this[i];
            if (cb(obj)) {
              return obj;
            }
          }
          return null;
        }
      }
    ], 
    "reverse": [
      {
        "comment": " 反转数组\n\n `[1, 2, 3].reverse()`      =>      `[3, 2, 1]`", 
        "return": "NSArray*",
        "js": (_this: any[]) => [..._this].reverse()
      }
    ], 
    "indexOf": [
      {
        "comment": " 元素在数组中的索引，找不到返回 `-1`\n\n `['a', 'b', 'c', 'a', 'b'].indexOf('a')`       =>      `0`", 
        "params": [
          {
            "type": "id", 
            "name": "obj"
          }
        ], 
        "return": "NSInteger",
        "js": (_this: any[], obj: any) => _this.indexOf(obj)
      }
    ], 
    "join": [
      {
        "comment": " 使用给定的分隔符把数组元素拼成一个字符串\n\n `['a', 'b', 'c'].join(',')`      =>      `'a,b,c'`", 
        "params": [
          {
            "type": "NSString*", 
            "name": "str"
          }
        ], 
        "return": "NSString*",
        "js": (_this: any[], str) => _this.join(str)
      }
    ], 
    "lastIndex": [
      {
        "comment": " 最后一个满足条件的元素的索引，没有满足条件的元素时返回 `-1`\n\n `[11, 12, 13, 14].lastIndex(n -> n % 2 == 0)`       =>      `3`", 
        "params": [
          {
            "type": "(element: any) => any", 
            "name": "block"
          }
        ], 
        "return": "NSInteger",
        "js": (_this: any[], cb: (obj: any) => boolean) => {
          for (var i = _this.length - 1; i >= 0; i--) {
            let obj = _this[i];
            if (cb(obj)) {
              return i;
            }
          }
          return -1;
        }
      }
    ], 
    "join_property": [
      {
        "comment": " 使用给定的分隔符把数组元素的指定属性拼成一个字符串\n\n `[1, 2, 3].join_property(',', 'description')`      =>      `'1,2,3'`", 
        "params": [
          {
            "type": "NSString*", 
            "name": "str"
          }, 
          {
            "type": "NSString*", 
            "name": "property"
          }
        ], 
        "return": "NSString*", 
        "deprecated": "使用 `select` 和 `join` 代替",
        "js": (_this: any[], str, property) => _this.map(o => o[property]).join(str)
      }
    ], 
    "filter": [
      {
        "comment": " 筛选出符合条件的元素\n\n `[11, 12, 13, 14].filter(n -> n % 2 == 0)`      =>      `[12, 14]`", 
        "params": [
          {
            "type": "(element: any) => any", 
            "name": "block"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: any[], cb: (obj: any) => boolean) => _this.filter(cb)
      }
    ], 
    "distinct": [
      {
        "comment": " 返回去重后的数组\n\n `['a', 'b', 'a', 'c'].distinct()`      =>      `['a', 'b', 'c']`", 
        "return": "NSArray*",
        "js": (_this: any[]) => [...new Set(_this)]
      }
    ], 
    "concat": [
      {
        "comment": " 合并数组\n\n `[1, 2].concat([3])`      =>      `[1, 2, 3]`", 
        "params": [
          {
            "type": "NSArray*", 
            "name": "array"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: any[], array) => _this.concat(array)
      }
    ], 
    "slice": [
      {
        "comment": " 把数组分割成若干个指定元素个数的小数组\n\n `[1, 2, 3, 4, 5, 6, 7, 8].slice(3)`    =>      `[[1, 2, 3], [4, 5, 6], [7, 8]]`", 
        "params": [
          {
            "type": "NSUInteger", 
            "name": "count"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: any[], count) => {
          let arrays = [];
          for (var i = 0; i < _this.length; i += count) {
            arrays.push(_this.slice(i, Math.min(i + count, _this.length)))
          }
          return arrays;
        }
      }
    ], 
    "sub_array": [
      {
        "comment": " 返回给定范围内的子数组\n\n `[1, 2, 3, 4, 5].sub_array(0, 3)`      =>      `[1, 2, 3]`", 
        "params": [
          {
            "type": "NSUInteger", 
            "name": "start"
          }, 
          {
            "type": "NSUInteger", 
            "name": "length"
          }
        ], 
        "return": "NSArray*", 
        "deprecated": "使用 `subarray` 代替",
        "js": (_this: any[], start, length) => _this.slice(start, start + length)
      }
    ], 
    "splice": [
      {
        "comment": " 删除/增加/替换元素\n\n `[1, 2, 3].splice(1, 0, 5)`      =>      `[1, 5, 2, 3]`\n `[1, 2, 3].splice(1, 1, 5)`      =>      `[1, 5, 3]`", 
        "params": [
          {
            "type": "NSInteger", 
            "name": "start"
          }, 
          {
            "type": "NSUInteger", 
            "name": "deleteCount"
          }, 
          {
            "type": "id", 
            "name": "insertValue"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: any[], start, deleteCount, insertValue) => {
          _this.splice(start, deleteCount, insertValue);
          return _this;
        }
      }, 
      {
        "comment": " 删除元素\n\n `[1, 2, 3].splice(1, 1)`      =>      `[1, 3]`", 
        "params": [
          {
            "type": "NSInteger", 
            "name": "start"
          }, 
          {
            "type": "NSUInteger", 
            "name": "deleteCount"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: any[], start, deleteCount) => {
          _this.splice(start, deleteCount);
          return _this;
        }
      }, 
      {
        "comment": " 删除给定索引后的所有元素，如果 `start` 为负数，则表示从后往前数\n\n `[1, 2, 3].splice(1)`      =>      `[1]`\n `[1, 2, 3].splice(-2)`      =>      `[1]`", 
        "params": [
          {
            "type": "NSInteger", 
            "name": "start"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: any[], start) => {
          _this.splice(start);
          return _this;
        }
      }
    ], 
    "subarray": [
      {
        "comment": " 返回给定范围内的子数组\n\n `[1, 2, 3, 4, 5].subarray(0, 3)`      =>      `[1, 2, 3]`", 
        "params": [
          {
            "type": "NSUInteger", 
            "name": "start"
          }, 
          {
            "type": "NSUInteger", 
            "name": "length"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: any[], start, length) => _this.slice(start, start + length)
      }
    ], 
    "lastIndexOf": [
      {
        "comment": " 元素在数组中的索引，反向查找，找不到返回 `-1`\n\n `['a', 'b', 'c', 'a', 'b'].lastIndexOf('a')`       =>      `3`", 
        "params": [
          {
            "type": "id", 
            "name": "obj"
          }
        ], 
        "return": "NSInteger",
        "js": (_this: any[], obj) => _this.lastIndexOf(obj)
      }
    ], 
    "flatten": [
      {
        "comment": " 展开数组，`recursive` 为 `false` 表示不继续展开元素中的数组\n\n `[1, [2, [3, 4]], 5].flatten(false)`      =>      `[1, 2, [3, 4], 5]`", 
        "params": [
          {
            "type": "BOOL", 
            "name": "recursive"
          }
        ], 
        "return": "NSArray*",
        "js": _flatten
      }, 
      {
        "comment": " 展开数组\n\n `[1, [2, [3, 4]], 5].flatten()`      =>      `[1, 2, 3, 4, 5]`", 
        "return": "NSArray*",
        "js": _flatten
      }
    ], 
    "firstIndex": [
      {
        "comment": " 第一个满足条件的元素的索引，没有满足条件的元素时返回 `-1`\n\n `[11, 12, 13, 14].firstIndex(n -> n % 2 == 0)`       =>      `1`", 
        "params": [
          {
            "type": "(element: any) => any", 
            "name": "block"
          }
        ], 
        "return": "NSInteger",
        "js": (_this: any[], cb: (obj: any) => boolean) => _this.findIndex(cb)
      }
    ], 
    "any": [
      {
        "comment": " 是否有至少一个元素满足条件\n\n `[11, 12, 13, 14].any(n -> n % 2 == 0)`      =>      `true`", 
        "params": [
          {
            "type": "(element: any) => any", 
            "name": "block"
          }
        ], 
        "return": "BOOL",
        "js": (_this: any[], cb: (obj: any) => boolean) => _this.some(cb)
      }
    ], 
    "select": [
      {
        "comment": " 对数组每个元素做转换\n\n `[1, 2, 3].select(n -> n * 2)`      =>      `[2, 4, 6]`", 
        "params": [
          {
            "type": "(element: any) => any", 
            "name": "block"
          }
        ], 
        "return": "NSArray*",
        "js": (_this: any[], cb: (obj: any) => any) => _this.map(cb)
      }
    ], 
    "first": [
      {
        "comment": " 第一个元素，没有元素时返回 `nil`\n\n `['a', 'b', 'c'].first()`      =>      `'a'`", 
        "return": "id",
        "js": (_this: any[]) => _this.length > 0 ? _this[0] : null
      }, 
      {
        "comment": " 第一个满足条件的元素，没有满足条件的元素时返回 `nil`\n\n `[11, 12, 13, 14].first(n -> n % 2 == 0)`       =>      `12`", 
        "params": [
          {
            "type": "(element: any) => any", 
            "name": "block"
          }
        ], 
        "return": "id",
        "js": (_this: any[], cb: (obj: any) => boolean) => _this.find(cb)
      }
    ]
  }, 
  "UIImage": {
    "width": [
      {
        "return": "CGFloat"
      }
    ], 
    "aspectRatio": [
      {
        "return": "CGFloat"
      }
    ], 
    "imageWithContentMode_width_height": [
      {
        "params": [
          {
            "type": "NSString*", 
            "name": "modeString"
          }, 
          {
            "type": "CGFloat", 
            "name": "width"
          }, 
          {
            "type": "CGFloat", 
            "name": "height"
          }
        ], 
        "return": "UIImage*"
      }
    ], 
    "height": [
      {
        "return": "CGFloat"
      }
    ]
  }
}