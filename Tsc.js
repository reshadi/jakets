"use strict";
var Node = require("./Node");
exports.Exec = Node.CreateNodeExec("tsc", "tsc --version ", "typescript/lib/tsc.js");
// import fs = require("fs");
// import path = require("path");
// var TSC = (function() {
//   let localTypescript = path.join(process.cwd(), "node_modules/typescript/lib/tsc.js");
//   let jaketsTypescript = path.join(__dirname, "node_modules/typescript/lib/tsc.js");
//   let tscCmd = "tsc"; //default is the one in the path
//   try {
//     if (fs.statSync(localTypescript)) {
//       tscCmd = "node " + localTypescript;
//     } else {
//       let execSync = require('child_process').execSync;
//       execSync("tsc --version "); //Confirms the global one exists
//     }
//   } catch (e) {
//     tscCmd = "node " + jaketsTypescript;
//   }
//   return tscCmd;
// })(); //path.join(__dirname, "node_modules", ".bin", "tsc");
// 
// export function Exec(args, callback) {
//   //var args = Array.prototype.join(arguments, " ");
//   if (!Array.isArray(args)) {
//     args = [args];
//   }
//   var cmd = args.map(function(arg) { return TSC + " " + arg; });
//   jake.Exec(cmd, callback);
// }
//# sourceMappingURL=Tsc.js.map