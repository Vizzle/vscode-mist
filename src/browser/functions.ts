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
            "type": "number | string",
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
            "type": "number", 
            "name": "m11"
          }, 
          {
            "type": "number", 
            "name": "m12"
          }, 
          {
            "type": "number", 
            "name": "m13"
          }, 
          {
            "type": "number", 
            "name": "m14"
          }, 
          {
            "type": "number", 
            "name": "m21"
          }, 
          {
            "type": "number", 
            "name": "m22"
          }, 
          {
            "type": "number", 
            "name": "m23"
          }, 
          {
            "type": "number", 
            "name": "m24"
          }, 
          {
            "type": "number", 
            "name": "m31"
          }, 
          {
            "type": "number", 
            "name": "m32"
          }, 
          {
            "type": "number", 
            "name": "m33"
          }, 
          {
            "type": "number", 
            "name": "m34"
          }, 
          {
            "type": "number", 
            "name": "m41"
          }, 
          {
            "type": "number", 
            "name": "m42"
          }, 
          {
            "type": "number", 
            "name": "m43"
          }, 
          {
            "type": "number", 
            "name": "m44"
          }
        ], 
        "return": "Transform"
      }, 
      {
        "params": [
          {
            "type": "number", 
            "name": "a"
          }, 
          {
            "type": "number", 
            "name": "b"
          }, 
          {
            "type": "number", 
            "name": "c"
          }, 
          {
            "type": "number", 
            "name": "d"
          }, 
          {
            "type": "number", 
            "name": "tx"
          }, 
          {
            "type": "number", 
            "name": "ty"
          }
        ], 
        "return": "Transform"
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
        "return": "Point"
      }
    ], 
    "concat": [
      {
        "params": [
          {
            "type": "Transform", 
            "name": "a"
          }, 
          {
            "type": "Transform", 
            "name": "b"
          }
        ], 
        "return": "Transform"
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
            "type": "number", 
            "name": "sx"
          }, 
          {
            "type": "number", 
            "name": "sy"
          }, 
          {
            "type": "number", 
            "name": "sz"
          }
        ], 
        "return": "Transform"
      }, 
      {
        "params": [
          {
            "type": "number", 
            "name": "sx"
          }, 
          {
            "type": "number", 
            "name": "sy"
          }
        ], 
        "return": "Transform"
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
        "return": "Size"
      }
    ], 
    "scale": [
      {
        "params": [
          {
            "type": "Transform", 
            "name": "t"
          }, 
          {
            "type": "number", 
            "name": "sx"
          }, 
          {
            "type": "number", 
            "name": "sy"
          }, 
          {
            "type": "number", 
            "name": "sz"
          }
        ], 
        "return": "Transform"
      }, 
      {
        "params": [
          {
            "type": "Transform", 
            "name": "t"
          }, 
          {
            "type": "number", 
            "name": "sx"
          }, 
          {
            "type": "number", 
            "name": "sy"
          }
        ], 
        "return": "Transform"
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
            "type": "number", 
            "name": "tx"
          }, 
          {
            "type": "number", 
            "name": "ty"
          }, 
          {
            "type": "number", 
            "name": "tz"
          }
        ], 
        "return": "Transform"
      }, 
      {
        "params": [
          {
            "type": "number", 
            "name": "tx"
          }, 
          {
            "type": "number", 
            "name": "ty"
          }
        ], 
        "return": "Transform"
      }
    ], 
    "invert": [
      {
        "params": [
          {
            "type": "Transform", 
            "name": "t"
          }
        ], 
        "return": "Transform"
      }
    ], 
    "m34": [
      {
        "comment": "单位矩阵设置 m34 的值，一般用于创建 3D 旋转", 
        "params": [
          {
            "type": "number", 
            "name": "m34"
          }
        ], 
        "return": "Transform"
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
            "type": "Transform", 
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
            "type": "number", 
            "name": "value"
          }
        ], 
        "return": "Transform"
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
        "return": "Transform"
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
            "type": "Transform", 
            "name": "t"
          }, 
          {
            "type": "number", 
            "name": "angle"
          }, 
          {
            "type": "number", 
            "name": "x"
          }, 
          {
            "type": "number", 
            "name": "y"
          }, 
          {
            "type": "number", 
            "name": "z"
          }
        ], 
        "return": "Transform"
      }, 
      {
        "params": [
          {
            "type": "Transform", 
            "name": "t"
          }, 
          {
            "type": "number", 
            "name": "angle"
          }
        ], 
        "return": "Transform"
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
            "type": "Point", 
            "name": "origin"
          }, 
          {
            "type": "Size", 
            "name": "size"
          }
        ], 
        "return": "Rect"
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
        "return": "Rect"
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
            "type": "Transform", 
            "name": "t"
          }, 
          {
            "type": "number", 
            "name": "tx"
          }, 
          {
            "type": "number", 
            "name": "ty"
          }, 
          {
            "type": "number", 
            "name": "tz"
          }
        ], 
        "return": "Transform"
      }, 
      {
        "params": [
          {
            "type": "Transform", 
            "name": "t"
          }, 
          {
            "type": "number", 
            "name": "tx"
          }, 
          {
            "type": "number", 
            "name": "ty"
          }
        ], 
        "return": "Transform"
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
            "type": "number", 
            "name": "angle"
          }, 
          {
            "type": "number", 
            "name": "x"
          }, 
          {
            "type": "number", 
            "name": "y"
          }, 
          {
            "type": "number", 
            "name": "z"
          }
        ], 
        "return": "Transform"
      }, 
      {
        "params": [
          {
            "type": "number", 
            "name": "angle"
          }
        ], 
        "return": "Transform"
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
        "comment": "执行表达式并返回结果。目前尚无 json 解析的工具函数，可以先使用这个",
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
    ],
    "isNull": [
      {
        "comment": " 判断对象是否为 null/nil\n\n `isNull(0)`      =>      `false`\n`isNull(false)`      =>      `false`\n`isNull(null)`      =>      `true`", 
        "params": [
          {
            "type": "any",
            "name": "obj"
          }
        ],
        "return": "bool",
        "js": obj => {
          return obj === null
        }
      }
    ],
    "urlEncode": [
      {
        "params": [
          {
            "type": "string",
            "name": "str"
          }
        ],
        "return": "any",
        "js": encodeURIComponent,
      }
    ],
    "urlDecode": [
      {
        "params": [
          {
            "type": "string",
            "name": "str"
          }
        ],
        "return": "any",
        "js": decodeURIComponent,
      }
    ],
    "htmlEncode": [
      {
        "params": [
          {
            "type": "string",
            "name": "str"
          }
        ],
        "return": "any",
        "js": (str: string) => {
          return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>')
            .replace(/"/g, '&quot;')
        },
      }
    ],
    "findNode": [
      {
        "params": [
          {
            "type": "string",
            "name": "id"
          }
        ],
        "return": "Node",
        "comment": "根据 id 查找节点，只能在 `on-after-layout` 事件中调用"
      }
    ],
    "with": [
      {
        "params": [
          {
            "type": "any",
            "name": "obj"
          },
          {
            "type": "(obj: any) => void",
            "name": "block"
          }
        ],
        "return": "void",
        "comment": "方便对同一个对象调用多次操作"
      },
      {
        "params": [
          {
            "type": "any",
            "name": "obj1"
          },
          {
            "type": "any",
            "name": "obj2"
          },
          {
            "type": "(obj1: any, obj2: any) => void",
            "name": "block"
          }
        ],
        "return": "void",
        "comment": "方便对同一个对象调用多次操作"
      },
      {
        "params": [
          {
            "type": "any",
            "name": "obj1"
          },
          {
            "type": "any",
            "name": "obj2"
          },
          {
            "type": "any",
            "name": "obj3"
          },
          {
            "type": "(obj1: any, obj2: any, obj3: any) => void",
            "name": "block"
          }
        ],
        "return": "void",
        "comment": "方便对同一个对象调用多次操作"
      },
      {
        "params": [
          {
            "type": "any",
            "name": "obj1"
          },
          {
            "type": "any",
            "name": "obj2"
          },
          {
            "type": "any",
            "name": "obj3"
          },
          {
            "type": "any",
            "name": "obj4"
          },
          {
            "type": "(obj1: any, obj2: any, obj3: any, obj4: any) => void",
            "name": "block"
          }
        ],
        "return": "void",
        "comment": "方便对同一个对象调用多次操作"
      },
      {
        "params": [
          {
            "type": "any",
            "name": "obj1"
          },
          {
            "type": "any",
            "name": "obj2"
          },
          {
            "type": "any",
            "name": "obj3"
          },
          {
            "type": "any",
            "name": "obj4"
          },
          {
            "type": "any",
            "name": "obj5"
          },
          {
            "type": "(obj1: any, obj2: any, obj3: any, obj4: any, obj5: any) => void",
            "name": "block"
          }
        ],
        "return": "void",
        "comment": "方便对同一个对象调用多次操作"
      },
      {
        "params": [
          {
            "type": "any",
            "name": "obj1"
          },
          {
            "type": "any",
            "name": "obj2"
          },
          {
            "type": "any",
            "name": "obj3"
          },
          {
            "type": "any",
            "name": "obj4"
          },
          {
            "type": "any",
            "name": "obj5"
          },
          {
            "type": "any",
            "name": "obj6"
          },
          {
            "type": "(obj1: any, obj2: any, obj3: any, obj4: any, obj5: any, obj6: any) => void",
            "name": "block"
          }
        ],
        "return": "void",
        "comment": "方便对同一个对象调用多次操作"
      }
    ],
    "lerp": [
      {
        "params": [
          {
            "type": "number",
            "name": "t",
            "comment": "0~1 的值，只能为数字。超出 0~1 的数字会做截断"
          },
          {
            "type": "number | Point",
            "name": "beginValue",
            "comment": "开始值。目前支持类型为数字和 Point"
          },
          {
            "type": "number | Point",
            "name": "endValue",
            "comment": "结束值。目前支持类型为数字和 Point"
          }
        ],
        "return": "any",
        "comment": "用于将 0~1 的值映射到另一个区间的值。例如：`lerp(0.5, 10, 20)` 为 15，`lerp(0.1, 10, 0)` 为 9"
      }
    ]
  }, 
  "Node": {
    "top": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "right": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "bottom": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "left": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "width": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "height": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "position": [
      {
        "isProp": true,
        "return": "Point"
      }
    ],
    "center": [
      {
        "isProp": true,
        "return": "Point"
      }
    ],
    "visible": [
      {
        "isProp": true,
        "return": "boolean",
        "comment": "当前节点是否可见"
      }
    ],
    "line": [
      {
        "isProp": true,
        "return": "number",
        "comment": "当前节点在其父节点中的行索引"
      }
    ],
    "lines": [
      {
        "isProp": true,
        "return": "number",
        "comment": "当前节点的行数"
      }
    ],
    "index": [
      {
        "isProp": true,
        "return": "number",
        "comment": "当前节点在其父节点中的索引"
      }
    ],
    "parent": [
      {
        "isProp": true,
        "return": "Node",
        "comment": "父节点"
      }
    ],
    "children": [
      {
        "isProp": true,
        "return": "Node[]",
        "comment": "子节点数组"
      }
    ],
    "visibleCount": [
      {
        "isProp": true,
        "return": "number",
        "comment": "可见的子节点数量。刚布局结束时，可认为 children[visibleCount - 1] 即为最后一个可见子节点"
      }
    ],
    "setTop": [
      {
        "params": [
          {
            "name": "top",
            "type": "number"
          }
        ],
        "return": "Node"
      }
    ],
    "setRight": [
      {
        "params": [
          {
            "name": "right",
            "type": "number"
          }
        ],
        "return": "Node"
      }
    ],
    "setBottom": [
      {
        "params": [
          {
            "name": "bottom",
            "type": "number"
          }
        ],
        "return": "Node"
      }
    ],
    "setLeft": [
      {
        "params": [
          {
            "name": "left",
            "type": "number"
          }
        ],
        "return": "Node"
      }
    ],
    "setWidth": [
      {
        "params": [
          {
            "name": "width",
            "type": "number"
          }
        ],
        "return": "Node"
      }
    ],
    "setHeight": [
      {
        "params": [
          {
            "name": "height",
            "type": "number"
          }
        ],
        "return": "Node"
      }
    ],
    "setVisible": [
      {
        "params": [
          {
            "name": "visible",
            "type": "boolean"
          }
        ],
        "return": "Node"
      }
    ],
    "offset": [
      {
        "params": [
          {
            "name": "x",
            "type": "number"
          },
          {
            "name": "y",
            "type": "number"
          }
        ],
        "return": "Node",
        "comment": "对当前节点的位置进行偏移。例如 `node.offset(5, 0)` 表示将节点向右移动 5"
      }
    ],
    "align": [
      {
        "params": [
          {
            "name": "target",
            "type": "Node"
          },
          {
            "name": "type",
            "type": "'top' | 'right' | 'bottom' | 'left' | 'center'"
          }
        ],
        "return": "Node",
        "comment": "与 target 节点对齐。type 为对齐方式，可选的值为 'top', 'right', 'bottom', 'left', 'center'。"
      }
    ],
    "beside": [
      {
        "params": [
          {
            "name": "target",
            "type": "Node"
          },
          {
            "name": "type",
            "type": "'top' | 'right' | 'bottom' | 'left'"
          }
        ],
        "return": "Node",
        "comment": "移动到 target 节点的旁边。type 为对齐方式，可选的值为 'top', 'right', 'bottom', 'left'。"
      }
    ],
    "convertPoint": [
      {
        "params": [
          {
            "name": "target",
            "type": "Node"
          },
          {
            "name": "point",
            "type": "Point"
          }
        ],
        "return": "Point",
        "comment": "将 point 从当前节点坐标系转换到 target 节点坐标系"
      }
    ],
  },
  "View": {
    "top": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "right": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "bottom": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "left": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "width": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "height": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "alpha": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "translation": [
      {
        "isProp": true,
        "return": "Point"
      }
    ],
    "scale": [
      {
        "isProp": true,
        "return": "Point"
      }
    ],
    "rotation": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "pivot": [
      {
        "isProp": true,
        "return": "Point"
      }
    ],
    "setTop": [
      {
        "params": [
          {
            "name": "top",
            "type": "number"
          }
        ],
        "return": "View"
      }
    ],
    "setRight": [
      {
        "params": [
          {
            "name": "right",
            "type": "number"
          }
        ],
        "return": "View"
      }
    ],
    "setBottom": [
      {
        "params": [
          {
            "name": "bottom",
            "type": "number"
          }
        ],
        "return": "View"
      }
    ],
    "setLeft": [
      {
        "params": [
          {
            "name": "left",
            "type": "number"
          }
        ],
        "return": "View"
      }
    ],
    "setWidth": [
      {
        "params": [
          {
            "name": "width",
            "type": "number"
          }
        ],
        "return": "View"
      }
    ],
    "setHeight": [
      {
        "params": [
          {
            "name": "height",
            "type": "number"
          }
        ],
        "return": "View"
      }
    ],
    "setAlpha": [
      {
        "params": [
          {
            "name": "alpha",
            "type": "number"
          }
        ],
        "return": "View"
      }
    ],
    "setTranslation": [
      {
        "params": [
          {
            "name": "translation",
            "type": "Point"
          }
        ],
        "return": "View"
      }
    ],
    "setScale": [
      {
        "comment": "设置缩放（以 pivot 为中心点）", 
        "params": [
          {
            "name": "scale",
            "type": "number|Point"
          }
        ],
        "return": "View"
      }
    ],
    "setRotation": [
      {
        "comment": "设置旋转（单位为角度，以 pivot 为中心点）", 
        "params": [
          {
            "name": "rotation",
            "type": "number"
          }
        ],
        "return": "View"
      }
    ],
    "setPivot": [
      {
        "comment": "设置旋转和缩放的中心点，相对于 View，单位为系统单位，例如 (0, 0) 表示左上角。默认为 View 的中心", 
        "params": [
          {
            "name": "pivot",
            "type": "Point"
          }
        ],
        "return": "View"
      }
    ],
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
  "Point": {
    "x": [
      {
        "isProp": true,
        "return": "number"
      }
    ],
    "y": [
      {
        "isProp": true,
        "return": "number"
      }
    ]
  },
  "Controller": {
    "getValue": [
      {
        "comment": "获取缓存值",
        "params": [
          {
            "type": "string",
            "name": "key"
          }
        ],
        "return": "any",
        "js": (_this, key) => {
          return _this[key];
        }
      }
    ],
    "setValue": [
      {
        "comment": "设置缓存值",
        "params": [
          {
            "type": "string",
            "name": "key"
          },
          {
            "type": "any",
            "name": "value"
          }
        ],
        "return": "void",
        "js": (_this, key, value) => {
          _this[key] = value;
        }
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
        "return": "object",
        "js": (_this, key, value) => {
          _this[key] = value;
          return _this;
        }
      }
    ],
    "keys": [
      {
        "comment": " 获取字典的所有 key，返回一个数组\n\n `{'a': 1, 'b': 2}.keys()`      =>      `['a', 'b']`",
        "return": "array",
        "js": (_this) => Object.keys(_this)
      }
    ],
    "concat": [
      {
        "params": [
          {
            "type": "NSDictionary*",
            "name": "obj"
          },
        ], 
        "comment": " 合并字典返回一个新的字典\n\n `{'a': 1, 'b': 2}.concat({'b': 3, 'c': 4})`      =>      `{'a': 1, 'b': 3, 'c': 4}`",
        "return": "object",
        "js": (_this, obj) => Object.assign({}, _this, obj)
      }
    ],
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
        "js": (_this: string, target: string, replacement: string) => {
          let index = 0;
          let result = _this;
          while (index <= result.length - target.length) {
            index = result.indexOf(target, index)
            if (index < 0) {
              break
            }
            result = result.slice(0, index) + replacement + result.slice(index + target.length)
            index += replacement.length
            if (target === '') {
              index += 1
            }
          }
          return result
        }
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
    ],
    "numberValue": [
      {
        "comment": "转换为数字",
        "return": "number",
        "js": (_this: string) => parseFloat(_this)
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
            "type": "(value: any, index: number, array: any[]) => any", 
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
            "type": "(value: any, index: number, array: any[]) => any", 
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
            "type": "(value: any, index: number, array: any[]) => any", 
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
            "type": "(value: any, index: number, array: any[]) => any", 
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
    "divide": [
      {
        "min-version": 2,
        "comment": " 把数组分割成若干个指定元素个数的小数组\n\n `[1, 2, 3, 4, 5, 6, 7, 8].divide(3)`    =>      `[[1, 2, 3], [4, 5, 6], [7, 8]]`",
        "params": [
          {
            "type": "NSUInteger",
            "name": "count"
          }
        ],
        "return": "array",
        "js": (_this: any[], count) => {
          let arrays = [];
          for (var i = 0; i < _this.length; i += count) {
            arrays.push(_this.slice(i, Math.min(i + count, _this.length)))
          }
          return arrays;
        }
      }
    ],
    "slice": [
      {
        "max-version": 1,
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
      },
      {
        "min-version": 2,
        "comment": " 返回数组的一个片段\n\n `[1, 2, 3, 4, 5].slice(2)`    =>      `[3, 4, 5]`\n `[1, 2, 3, 4, 5].slice(-2)`    =>      `[4, 5]`",
        "params": [
          {
            "type": "NSUInteger",
            "name": "start"
          }
        ],
        "return": "array",
        "js": (_this: any[], start) => {
          return _this.slice(start)
        }
      },
      {
        "min-version": 2,
        "comment": " 返回数组的一个片段\n\n `[1, 2, 3, 4, 5].slice(2, 4)`    =>      `[3, 4]`\n `[1, 2, 3, 4, 5].slice(-3, -1)`    =>      `[3, 4]`",
        "params": [
          {
            "type": "NSUInteger",
            "name": "start"
          },
          {
            "type": "NSUInteger",
            "name": "end"
          }
        ],
        "return": "array",
        "js": (_this: any[], start, end) => {
          return _this.slice(start, end)
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
            "type": "(value: any, index: number, array: any[]) => any", 
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
            "type": "(value: any, index: number, array: any[]) => any", 
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
            "type": "(value: any, index: number, array: any[]) => any", 
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
            "type": "(value: any, index: number, array: any[]) => any", 
            "name": "block"
          }
        ], 
        "return": "id",
        "js": (_this: any[], cb: (obj: any) => boolean) => _this.find(cb)
      }
    ],
    "sum": [
      {
        "comment": " 数组求和\n\n `[1, 2, 3].sum()`      =>      `6`",
        "return": "number",
        "js": (_this: any[]) => _this.reduce((a, b) => a + b, 0)
      }
    ],
    "max": [
      {
        "comment": " 数组内最大值\n\n `[1, 2, 3].max()`      =>      `3`",
        "return": "number",
        "js": (_this: any[]) => _this.reduce((a, b) => Math.max(a, b), _this[0])
      }
    ],
    "min": [
      {
        "comment": " 数组内最小值\n\n `[1, 2, 3].min()`      =>      `1`",
        "return": "number",
        "js": (_this: any[]) => _this.reduce((a, b) => Math.min(a, b), _this[0])
      }
    ],
    "reduce": [
      {
        "comment": " 方法接受一个函数作为参数，这个函数作为一个累加器，从左到右遍历整个类型数组，最后返回一个单一的值\n\n `[1, 2, 3].reduce((a, b) -> a + b)`      =>      `6`",
        "params": [
          {
            "type": "(previousValue: any, currentValue: any, index: number, array: any[]) => any",
            "name": "block"
          }
        ],
        "return": "any",
        "js": (_this: any[], cb: (...args) => any) => _this.reduce(cb)
      },
      {
        "comment": " 方法接受一个函数作为参数，这个函数作为一个累加器，从左到右遍历整个类型数组，最后返回一个单一的值\n\n `[1, 2, 3].reduce((a, b) -> a + b, '')`      =>      `'123'`",
        "params": [
          {
            "type": "(previousValue: any, currentValue: any, index: number, array: any[]) => any",
            "name": "block"
          },
          {
            "type": "any",
            "name": "initialValue"
          }
        ],
        "return": "any",
        "js": (_this: any[], cb: (...args) => any, initialValue: any) => _this.reduce(cb, initialValue)
      }
    ],
    "reduceRight": [
      {
        "comment": " 方法接受一个函数作为参数，这个函数作为一个累加器，从右到左遍历整个类型数组，最后返回一个单一的值\n\n `[1, 2, 3].reduceRight((a, b) -> a - b)`      =>      `0`",
        "params": [
          {
            "type": "(previousValue: any, currentValue: any, index: number, array: any[]) => any",
            "name": "block"
          }
        ],
        "return": "any",
        "js": (_this: any[], cb: (...args) => any) => _this.reduceRight(cb)
      },
      {
        "comment": " 方法接受一个函数作为参数，这个函数作为一个累加器，从右到左遍历整个类型数组，最后返回一个单一的值\n\n `[1, 2, 3].reduceRight((a, b) -> a + b, '')`      =>      `'321'`",
        "params": [
          {
            "type": "(previousValue: any, currentValue: any, index: number, array: any[]) => any",
            "name": "block"
          },
          {
            "type": "any",
            "name": "initialValue"
          }
        ],
        "return": "any",
        "js": (_this: any[], cb: (...args) => any, initialValue: any) => _this.reduceRight(cb, initialValue)
      }
    ],
    "sort": [
      {
        "params": [
          {
            "type": "(a: any, b: any) => number",
            "name": "block"
          }
        ],
        "comment": " 对数组的元素进行排序，并返回数组\n\n `[2,1,3].sort((a, b) -> a - b)`      =>      `[1,2,3]`",
        "return": "any[]",
        "js": (_this: any[], cb: (...args) => number) => _this.sort(cb)
      }
    ],
  }, 
  "UIImage": {
    "width": [
      {
        "return": "number"
      }
    ], 
    "aspectRatio": [
      {
        "return": "number"
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
            "type": "number", 
            "name": "width"
          }, 
          {
            "type": "number", 
            "name": "height"
          }
        ], 
        "return": "UIImage*"
      }
    ], 
    "height": [
      {
        "return": "number"
      }
    ]
  }
}
