"use strict";
var Path = require("path");
var Jake = require("./Jake");
var NodeUtil = require("./NodeUtil");
var ClosureJar = NodeUtil.FindModulePath("google-closure-compiler/compiler.jar", [".."]);
var RawExec = NodeUtil.CreateExec("java -jar " + ClosureJar);
function Exec(inputs, output, callback, options) {
    var args = "";
    //Default arguments that can be overwritten via options
    args += " --compilation_level ADVANCED_OPTIMIZATIONS";
    args += " --language_in ECMASCRIPT5";
    args += " --new_type_inf";
    args += " --summary_detail_level 3";
    args += " --warning_level VERBOSE";
    args += " --js_output_file=" + output;
    // args += " --jszip=" + output + ".gz";
    if (options) {
        args += " " + options;
    }
    args += " " + inputs;
    Jake.Shell.mkdir("-p", Path.dirname(output));
    // RawExec(args, callback);
    RawExec(args, function () {
        Jake.Exec("gzip --best < " + output + " > " + output + ".gz", callback);
    });
}
exports.Exec = Exec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xvc3VyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNsb3N1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQVksSUFBSSxXQUFNLE1BQU0sQ0FBQyxDQUFBO0FBSTdCLElBQVksSUFBSSxXQUFNLFFBQVEsQ0FBQyxDQUFBO0FBQy9CLElBQVksUUFBUSxXQUFNLFlBQVksQ0FBQyxDQUFBO0FBRXZDLElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsc0NBQXNDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBRXpGLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0FBRTdELGNBQXFCLE1BQWMsRUFBRSxNQUFjLEVBQUUsUUFBUSxFQUFFLE9BQWdCO0lBQzdFLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLHVEQUF1RDtJQUN2RCxJQUFJLElBQUksNkNBQTZDLENBQUM7SUFDdEQsSUFBSSxJQUFJLDRCQUE0QixDQUFDO0lBQ3JDLElBQUksSUFBSSxpQkFBaUIsQ0FBQztJQUMxQixJQUFJLElBQUksMkJBQTJCLENBQUM7SUFDcEMsSUFBSSxJQUFJLDBCQUEwQixDQUFDO0lBRW5DLElBQUksSUFBSSxvQkFBb0IsR0FBRyxNQUFNLENBQUM7SUFDdEMsd0NBQXdDO0lBQ3hDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDWixJQUFJLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUM7SUFFckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUU3QywyQkFBMkI7SUFDM0IsT0FBTyxDQUFDLElBQUksRUFBRTtRQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzFFLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQXRCZSxZQUFJLE9Bc0JuQixDQUFBIn0=