var Path = require("path");
var Jake = require("./Jake");
var Node = require("./Node");
var RawExec = Node.CreateNodeExec("browserify", "browserify --help", "browserify/bin/cmd.js");
var Tsify = "tsify";
Tsify = Node.FindModulePath(Tsify) || Tsify;
var Collapser = "bundle-collapser/plugin.js";
Collapser = Node.FindModulePath(Collapser) || Collapser;
function Exec(inputs, output, callback, isRelease, tsargs, options) {
    var args = inputs;
    args += " -p [ " + Tsify + " " + (tsargs || "") + " ]";
    if (isRelease) {
        args += "  -p [ " + Collapser + " ]";
    }
    else {
        args += " --debug";
    }
    args += " --outfile " + output;
    if (options) {
        args += " " + options;
    }
    Jake.Shell.mkdir("-p", Path.dirname(output));
    RawExec(args, callback);
}
exports.Exec = Exec;
//# sourceMappingURL=Browserify.js.map