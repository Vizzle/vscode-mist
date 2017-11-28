export let functions = {
  "global": {
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
        "return": "double"
      }
    ], 
    "random": [
      {
        "comment": "返回 [0, 1) 的随机数", 
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "NSArray*"
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
        "return": "NSArray*"
      }, 
      {
        "comment": " 返回 `0` 到 `count - 1` 的数字组成的数组\n\n `for(5)`       =>      `[0, 1, 2, 3, 4]`", 
        "params": [
          {
            "type": "double", 
            "name": "count"
          }
        ], 
        "return": "NSArray*"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "id"
      }
    ], 
    "PI": [
      {
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
      }
    ], 
    "randomInt": [
      {
        "comment": "返回一个不小于 0 的随机整数", 
        "return": "uint"
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
        "return": "int"
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
        "return": "id"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "double"
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
        "return": "NSDictionary*"
      }
    ]
  }, 
  "NSString": {
    "trim": [
      {
        "comment": "移除首尾空白字符", 
        "return": "NSString*"
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
        "deprecated": "使用 `substring` 代替"
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
        "return": "NSString*"
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
        "return": "NSString*"
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
        "return": "NSString*"
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
        "return": "NSArray*"
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
        "deprecated": "使用 `replace` 代替"
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
        "return": "NSInteger"
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
            "type": "id(^)(id)", 
            "name": "block"
          }
        ], 
        "return": "BOOL"
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
        "return": "NSArray*"
      }
    ], 
    "last": [
      {
        "comment": " 最后一个元素，没有元素时返回 `nil`\n\n `['a', 'b', 'c'].last()`      =>      `'c'`", 
        "return": "id"
      }, 
      {
        "comment": " 最后一个满足条件的元素，没有满足条件的元素时返回 `nil`\n\n `[11, 12, 13, 14].last(n -> n % 2 == 0)`       =>      `14`", 
        "params": [
          {
            "type": "id(^)(id)", 
            "name": "block"
          }
        ], 
        "return": "id"
      }
    ], 
    "reverse": [
      {
        "comment": " 反转数组\n\n `[1, 2, 3].reverse()`      =>      `[3, 2, 1]`", 
        "return": "NSArray*"
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
        "return": "NSInteger"
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
        "return": "NSString*"
      }
    ], 
    "lastIndex": [
      {
        "comment": " 最后一个满足条件的元素的索引，没有满足条件的元素时返回 `-1`\n\n `[11, 12, 13, 14].lastIndex(n -> n % 2 == 0)`       =>      `3`", 
        "params": [
          {
            "type": "id(^)(id)", 
            "name": "block"
          }
        ], 
        "return": "NSInteger"
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
        "deprecated": "使用 `select` 和 `join` 代替"
      }
    ], 
    "filter": [
      {
        "comment": " 筛选出符合条件的元素\n\n `[11, 12, 13, 14].filter(n -> n % 2 == 0)`      =>      `[12, 14]`", 
        "params": [
          {
            "type": "id(^)(id)", 
            "name": "block"
          }
        ], 
        "return": "NSArray*"
      }
    ], 
    "distinct": [
      {
        "comment": " 返回去重后的数组\n\n `['a', 'b', 'a', 'c'].distinct()`      =>      `['a', 'b', 'c']`", 
        "return": "NSArray*"
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
        "return": "NSArray*"
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
        "return": "NSArray*"
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
        "deprecated": "使用 `subarray` 代替"
      }
    ], 
    "splice": [
      {
        "comment": " 删除/增加/替换元素\n\n `[1, 2, 3].splice(1, 0, 5)`      =>      `[1, 2, 5, 3]`\n `[1, 2, 3].splice(1, 1, 5)`      =>      `[1, 5, 3]`", 
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
        "return": "NSArray*"
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
        "return": "NSArray*"
      }, 
      {
        "comment": " 删除给定索引后的所有元素，如果 `start` 为负数，则表示从后往前数\n\n `[1, 2, 3].splice(1)`      =>      `[1]`\n `[1, 2, 3].splice(-2)`      =>      `[1]`", 
        "params": [
          {
            "type": "NSInteger", 
            "name": "start"
          }
        ], 
        "return": "NSArray*"
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
        "return": "NSArray*"
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
        "return": "NSInteger"
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
        "return": "NSArray*"
      }, 
      {
        "comment": " 展开数组\n\n `[1, [2, [3, 4]], 5].flatten()`      =>      `[1, 2, 3, 4, 5]`", 
        "return": "NSArray*"
      }
    ], 
    "firstIndex": [
      {
        "comment": " 第一个满足条件的元素的索引，没有满足条件的元素时返回 `-1`\n\n `[11, 12, 13, 14].firstIndex(n -> n % 2 == 0)`       =>      `1`", 
        "params": [
          {
            "type": "id(^)(id)", 
            "name": "block"
          }
        ], 
        "return": "NSInteger"
      }
    ], 
    "any": [
      {
        "comment": " 是否有至少一个元素满足条件\n\n `[11, 12, 13, 14].any(n -> n % 2 == 0)`      =>      `true`", 
        "params": [
          {
            "type": "id(^)(id)", 
            "name": "block"
          }
        ], 
        "return": "BOOL"
      }
    ], 
    "select": [
      {
        "comment": " 对数组每个元素做转换\n\n `[1, 2, 3].select(n -> n * 2)`      =>      `[2, 4, 6]`", 
        "params": [
          {
            "type": "id(^)(id)", 
            "name": "block"
          }
        ], 
        "return": "NSArray*"
      }
    ], 
    "first": [
      {
        "comment": " 第一个元素，没有元素时返回 `nil`\n\n `['a', 'b', 'c'].first()`      =>      `'a'`", 
        "return": "id"
      }, 
      {
        "comment": " 第一个满足条件的元素，没有满足条件的元素时返回 `nil`\n\n `[11, 12, 13, 14].first(n -> n % 2 == 0)`       =>      `12`", 
        "params": [
          {
            "type": "id(^)(id)", 
            "name": "block"
          }
        ], 
        "return": "id"
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