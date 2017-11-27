
'use strict';

import * as json from 'jsonc-parser'

export function getPropertyNode(node: json.Node, property: string) {
    if (node.type == 'object') {
        let propertyNode = node.children.find(n => n.type == 'property' && n.children[0].value == property);
        if (propertyNode) {
            return propertyNode.children[1];
        }
    }
    return null;
}

// `json.parseTree` sometimes produces incorrect result
export function parseJson(text: string, errors?: json.ParseErrorCode[]): json.Node {
    let currentNode: json.Node;

    function onNode(node: json.Node, end: number) {
        if (currentNode) {
            node.parent = currentNode;
            if (currentNode.type === "array") {
                currentNode.children.push(node);
            }
            else if (currentNode.type === "object") {
                let property = currentNode.children[currentNode.children.length - 1];
                if (property.children.length == 1) {
                    property.children.push(node);
                    node.parent = property;
                    property.length = end - property.offset;
                }
            }
        }
        else {
            currentNode = node;
        }
    }

    function endNode() {
        let parent = currentNode.parent;
        if (parent) {
            if (parent.type === "property") {
                parent = parent.parent;
            }
        }
        if (parent) {
            currentNode = parent;
        }
    }

    json.visit(text, {
        onObjectBegin(offset: number, length: number) {
            let object: json.Node = {
                type: "object",
                offset: offset,
                length: length,
                children: []
            }
            onNode(object, offset + length);
            currentNode = object;
        },
        onObjectProperty(key: string, offset: number, length: number) {
            let property: json.Node = {
                type: "property",
                offset: offset,
                length: length,
                parent: currentNode,
                children: [
                    {
                        type: "string",
                        offset: offset,
                        length: length,
                        value: key
                    }
                ]
            }
            property.children[0].parent = property;
            currentNode.children.push(property);
        },
        onObjectEnd(offset: number, length: number) {
            currentNode.length = offset + length - currentNode.offset;
            endNode();
        },
        onArrayBegin(offset: number, length: number) {
            let array: json.Node = {
                type: "array",
                offset: offset,
                length: length,
                children: []
            }
            onNode(array, offset + length);
            currentNode = array;
        },
        onArrayEnd(offset: number, length: number) {
            currentNode.length = offset + length - currentNode.offset;
            endNode();
        },
        onLiteralValue(value: any, offset: number, length: number) {
            let node: json.Node = {
                type: value == null ? "null" : <json.NodeType>typeof value,
                offset: offset,
                length: length,
                value: value
            }
            onNode(node, offset + length);
        },
        onError(error: json.ParseErrorCode, offset: number, length: number) {
            if (errors) {
                errors.push(error);
            }
        }
    });

    return currentNode;
}

export function getNodeValue(node: json.Node): any {
	if (node.type === 'array') {
		return node.children.map(getNodeValue);
	} else if (node.type === 'object') {
		let obj = {};
		for (let prop of node.children) {
            if (prop.children.length == 2) {
                obj[prop.children[0].value] = getNodeValue(prop.children[1]);
            }
		}
		return obj;
	}
	return node.value;
}
