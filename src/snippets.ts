export default class Snippets {
    public static nodeSnippets = {
"text": 
`"type": "text",
"style": {
  "text": "\${1:Text}",
  "font-size": \${2:13},
  "color": "\${3:black}"
}`,

"image": 
`"type": "image",
"style": {
  "image": "\${1:Image Name}"
}`,

"button": 
`"type": "button",
"on-tap": {
  $2
},
"style": {
  "title": "\${1:Button Title}"
}`,

"children": 
`"children": [
  {
    $0
  }
]`,

"stack": 
`"style": {
  "direction": "$1"
},
"children": [
  {
    $0
  }
]`,

"vertical stack": 
`"style": {
  "direction": "vertical"
},
"children": [
  {
    $0
  }
]`,

"paging": 
`"type": "paging",
"style": {
  "direction": "$1"\${2:,
  "page-control": true,
  "page-control-margin-bottom": \${3:6},
  "page-control-color": "\${4:#a000}",
  "page-control-selected-color": "\${5:#5000}"}
},
"children": [
  {
    "repeat": "\\\${\${6:repeat array or count}}",
    $0
  }
]`,

"scroll": 
`"type": "scroll",
"style": {
  "scroll-direction": "$1"
},
"children": [
  {
    "repeat": "\\\${\${2:repeat array or count}}",
    $0
  }
]`,
    };
}