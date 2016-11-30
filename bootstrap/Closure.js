"use strict";
const Path = require("path");
const Jake = require("./Jake");
const NodeUtil = require("./Util");
let ClosureJar = NodeUtil.FindModulePath("google-closure-compiler/compiler.jar", [".."]);
let RawExec = NodeUtil.CreateExec("java -jar " + ClosureJar);
function Exec(inputs, output, callback, options) {
    let args = "";
    //Default arguments that can be overwritten via options
    args += " --compilation_level ADVANCED_OPTIMIZATIONS";
    args += " --language_in ECMASCRIPT5";
    // args += " --new_type_inf"; //Looks like crashes the compier sometimes
    args += " --summary_detail_level 3";
    // args += " --warning_level VERBOSE";
    args += " --warning_level QUIET";
    args += " --js_output_file=" + output;
    // args += " --jszip=" + output + ".gz";
    if (options) {
        args += " " + options;
    }
    args += " " + inputs;
    Jake.Shell.mkdir("-p", Path.dirname(output));
    // RawExec(args, callback);
    RawExec(args, () => {
        Jake.Exec("gzip --best < " + output + " > " + output + ".gz", callback);
    });
}
exports.Exec = Exec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xvc3VyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNsb3N1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDZCQUE2QjtBQUk3QiwrQkFBK0I7QUFDL0IsbUNBQW1DO0FBRW5DLElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsc0NBQXNDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBRXpGLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0FBRTdELGNBQXFCLE1BQWMsRUFBRSxNQUFjLEVBQUUsUUFBUSxFQUFFLE9BQWdCO0lBQzdFLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLHVEQUF1RDtJQUN2RCxJQUFJLElBQUksNkNBQTZDLENBQUM7SUFDdEQsSUFBSSxJQUFJLDRCQUE0QixDQUFDO0lBQ3JDLHdFQUF3RTtJQUN4RSxJQUFJLElBQUksMkJBQTJCLENBQUM7SUFDcEMsc0NBQXNDO0lBQ3RDLElBQUksSUFBSSx3QkFBd0IsQ0FBQztJQUVqQyxJQUFJLElBQUksb0JBQW9CLEdBQUcsTUFBTSxDQUFDO0lBQ3RDLHdDQUF3QztJQUN4QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ1osSUFBSSxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUNELElBQUksSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDO0lBRXJCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFN0MsMkJBQTJCO0lBQzNCLE9BQU8sQ0FBQyxJQUFJLEVBQUU7UUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMxRSxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUF2QkQsb0JBdUJDIn0=