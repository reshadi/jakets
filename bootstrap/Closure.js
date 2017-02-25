"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xvc3VyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNsb3N1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFJN0IsK0JBQStCO0FBQy9CLG1DQUFtQztBQUVuQyxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLHNDQUFzQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUV6RixJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsQ0FBQztBQUU3RCxjQUFxQixNQUFjLEVBQUUsTUFBYyxFQUFFLFFBQVEsRUFBRSxPQUFnQjtJQUM3RSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFDZCx1REFBdUQ7SUFDdkQsSUFBSSxJQUFJLDZDQUE2QyxDQUFDO0lBQ3RELElBQUksSUFBSSw0QkFBNEIsQ0FBQztJQUNyQyx3RUFBd0U7SUFDeEUsSUFBSSxJQUFJLDJCQUEyQixDQUFDO0lBQ3BDLHNDQUFzQztJQUN0QyxJQUFJLElBQUksd0JBQXdCLENBQUM7SUFFakMsSUFBSSxJQUFJLG9CQUFvQixHQUFHLE1BQU0sQ0FBQztJQUN0Qyx3Q0FBd0M7SUFDeEMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNaLElBQUksSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQztJQUVyQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRTdDLDJCQUEyQjtJQUMzQixPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLE1BQU0sR0FBRyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUUsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBdkJELG9CQXVCQyJ9