const Blockly = require("node-blockly");
Blockly.JavaScript.text_print = text => `console.log(${Blockly.JavaScript.valueToCode(text, "TEXT", Blockly.JavaScript.ORDER_NONE) || ''});\n`;

let xml = Blockly.Xml.textToDom(``);
let workspace = new Blockly.Workspace();
Blockly.Xml.domToWorkspace(xml, workspace);
let code = Blockly.JavaScript.workspaceToCode(workspace).trim();

console.log(code);