export default class Snippets {
    public static nodeSnippets = {
"text": 
`"type": "text",
"style": {
  "text": "\${1:Text}",
  "font-size": \${2:13},
  "color": "\${3:black}"$4
}`,

"image": 
`"type": "image",
"style": {
  "clip": true,
  "flex-shrink": 0,
  "content-mode": "scale-aspect-fill",
  "image": "\${1:Image Name}"$2
}`,

"button": 
`"type": "button",
"on-tap": {
  $2
},
"style": {
  "title": "\${1:Button Title}"
}`,

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

"dash line": 
`"type": "line",
"style": {
  "color": "\${1:#888}",
  "space-length": \${2:2},
  "dash-length": \${3:2}
}`,

"indicator": 
`"type": "indicator",
"style": {
  "color": "\${1:#888}",
  "width": \${2:15},
  "height": \${3:15}
}`,

"import":
`"import": "\${1:component path}"$2`,

"slot":
`"type": "slot"$1`,

    };
}