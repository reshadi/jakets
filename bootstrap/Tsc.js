"use strict";
const NodeUtil = require("./NodeUtil");
exports.Exec = NodeUtil.CreateNodeExec("tsc", "tsc --version ", "typescript/lib/tsc.js");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHNjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVHNjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFZLFFBQVEsV0FBTSxZQUFZLENBQUMsQ0FBQTtBQUU1QixZQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FDdkMsS0FBSyxFQUNMLGdCQUFnQixFQUNoQix1QkFBdUIsQ0FDeEIsQ0FBQztBQUVGLDZCQUE2QjtBQUM3QixpQ0FBaUM7QUFDakMsMEJBQTBCO0FBQzFCLDBGQUEwRjtBQUMxRix1RkFBdUY7QUFDdkYseURBQXlEO0FBQ3pELFVBQVU7QUFDViwwQ0FBMEM7QUFDMUMsNENBQTRDO0FBQzVDLGVBQWU7QUFDZiwwREFBMEQ7QUFDMUQscUVBQXFFO0FBQ3JFLFFBQVE7QUFDUixrQkFBa0I7QUFDbEIsMkNBQTJDO0FBQzNDLE1BQU07QUFDTixtQkFBbUI7QUFDbkIsK0RBQStEO0FBQy9ELEdBQUc7QUFDSCx5Q0FBeUM7QUFDekMsdURBQXVEO0FBQ3ZELGdDQUFnQztBQUNoQyxxQkFBcUI7QUFDckIsTUFBTTtBQUNOLG1FQUFtRTtBQUNuRSw4QkFBOEI7QUFDOUIsSUFBSSJ9