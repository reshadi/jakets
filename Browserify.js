var Path = require("path");
var Jake = require("./Jake");
var Node = require("./Node");
var RawExec = Node.CreateNodeExec("browserify", "browserify --help", "browserify/bin/cmd.js");
var Tsify = Path.join(__dirname, "node_modules/tsify");
var Collapser = Path.join(__dirname, "node_modules/bundle-collapser/plugin");
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
