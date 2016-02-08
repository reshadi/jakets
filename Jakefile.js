var fs = require("fs");
var path = require("path");
var jake = require("./Jake");
exports.exec = jake.Exec;
exports.shell = jake.Shell;
var Node = require("./Node");
var Bower = require("./Bower");
exports.bower = Bower.Exec;
var Tsc = require("./Tsc");
exports.tsc = Tsc.Exec;
var Browserify = require("./Browserify");
exports.browserify = Browserify.Exec;
var Closure = require("./Closure");
exports.closure = Closure.Exec;
var tsdCmd = Node.GetNodeCommand("tsd", "tsd --version ", "tsd/build/cli.js");
var jakeCmd = Node.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");
//////////////////////////////////////////////////////////////////////////////////////////
// Types and utils
//We use the following to better clarity what we are using/checking
exports.LocalDir = process.cwd();
var JaketsDir = __dirname;
function MakeRelative(fullpath) {
    if (!fullpath) {
        return fullpath;
    }
    return path.relative(exports.LocalDir, fullpath)
        .replace(/\\/g, "/") //Contert \ to / on windows
        || '.' //in case the answer is empty
    ;
    // return path.relative(LocalDir, fullpath) || '.';
}
exports.MakeRelative = MakeRelative;
exports.BuildDir = process.env.BUILD__DIR || MakeRelative("./build");
//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies 
// desc("Creates all dependencies");
// task("CreateDependencies", [], function() {
//   jake.Log(this.name);
//   task("temp", GetExtraDependencies()).invoke();
// }, { async: true });
var NodeModulesUpdateIndicator = "node_modules/.node_modules_updated";
var TypingsTsdDefs = "typings/tsd.d.ts";
var JakefileDependencies = "Jakefile.dep.json";
// function GetExtraDependencies(): string[] {
//   jake.Log("CreateDependencies");
//   var makefile = MakeRelative(path.join(__dirname, "Makefile")).replace(/\\/g, "/");
//   var dependencies: string[] = [];// [makefile];
//   if (fs.existsSync("bower.json")) {
//     dependencies.push("bower");
//   }
//   let HasPackageJson = fs.existsSync("package.json");
//   if (HasPackageJson) {
//     // dependencies.push(NodeModulesUpdateIndicator);
//   }
//   if (HasPackageJson || fs.existsSync("tsd.json")) {
//     dependencies.push(TypingsTsdDefs);
//   }
//   var jakefilePattern = /(Jakefile.*)\.js$/;
//   var jsJakeFiles =
//     Object.keys(require('module')._cache)
//       .filter(m => m.search(jakefilePattern) > -1)
//       .map(MakeRelative)
//       .map(f => f.replace(/\\/g, "/"))
//     ;
//   var tsJakeFiles =
//     jsJakeFiles
//       .map(f => f.replace(jakefilePattern, "$1.ts"))
//     ;
//   var jakeFileMkDependency = tsJakeFiles.concat(makefile);
//   var jakeFileMk = "Jakefile.mk";
//   file(jakeFileMk, jakeFileMkDependency, function() {
//     let taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
//     let taskList = taskListRaw.match(/^jake (\w*)/gm).map(t => t.match(/\s.*/)[0]);
//     var content = ""
//       + "JAKE_TASKS = " + taskList.join(" ") + "\n"
//       + "\n"
//       + "Jakefile.js: " + jakeFileMkDependency.join(" ") + "\n"
//       + "\n"
//       + "clean:\n"
//       + "\trm -f " + jsJakeFiles.join(" ") + "\n"
//       + "\trm -f " + jsJakeFiles.map(f => f + ".map").join(" ") + "\n"
//       ;
//     fs.writeFile(jakeFileMk, content, () => this.complete());
//   }, { async: true });
//   dependencies.push(jakeFileMk);
//   return dependencies;
// }
// task("bower", [], function() {
//   jake.Log(this.name);
//   bower("update --force-latest", () => this.complete());
// }, { async: true })
desc("update typings/tsd.d.ts from package.json");
// rule(/typings\/tsd[.]d[.]ts/, name => path.join(path.dirname(name), "..", "package.json"), [], function() {
rule(new RegExp(TypingsTsdDefs.replace(".", "[.]")), function (name) { return path.join(path.dirname(name), "..", "package.json"); }, [], function () {
    var _this = this;
    var tsdDeclarations = this.name;
    var packageJson = this.source;
    jake.Log("updating file " + tsdDeclarations + " from package file " + packageJson);
    var typingsDir = path.dirname(tsdDeclarations);
    var currDir = path.dirname(packageJson);
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    var pkg = JSON.parse(pkgStr);
    var dependencies = pkg["dependencies"] || {};
    var pkgNames = Object.keys(dependencies);
    jake.Log(dependencies);
    exports.shell.mkdir("-p", typingsDir);
    jake.Exec([
        "cd " + currDir
            + " && npm install"
            + " && " + tsdCmd + " install " + pkgNames.join(" ") + " --save"
            + " && " + tsdCmd + " reinstall --clean"
            + " && " + tsdCmd + " rebundle"
            + " && " + "touch " + tsdDeclarations
    ], function () {
        exports.shell.echo(tsdDeclarations);
        _this.complete();
    });
}, { async: true });
desc("update node_modules from package.json");
// rule(/node_modules\/node_modules_updated/, name => path.join(path.dirname(name), "..", "package.json"), [], function() {
rule(new RegExp(NodeModulesUpdateIndicator), function (name) { return path.join(path.dirname(name), "..", "package.json"); }, [], function () {
    var _this = this;
    var indicator = this.name;
    var packageJson = this.source;
    jake.Log("updating file " + indicator + " from package file " + packageJson);
    var packageDir = path.dirname(packageJson);
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    jake.Exec([
        "cd " + packageDir
            + " && npm install"
            + " && touch " + indicator
    ], function () {
        exports.shell.echo(indicator);
        _this.complete();
    });
}, { async: true });
// desc("create empty package.json if missing");
file("package.json", [], function () {
    var _this = this;
    jake.Log(this.name);
    console.error("Generating package.json");
    var NPM = path.join("npm");
    exports.exec([NPM + " init"], function () { return _this.complete(); });
}, { async: true });
// desc("update typings/tsd.d.ts from package.json");
// rule(/Jakefile[.]dep[.]js/, name => name.replace(".dep.js", ".js"), [], function() {
//   let jakefileDep: string = this.name;
//   let jakefile: string = this.source;
//   jake.Log(`updating file ${jakefileDep} from ${jakefile}`);
//   jake.Exec(`cd ${path.dirname(jakefile)} && ${jakeCmd} jts:genDep`, () => this.complete());
// }, { async: true });
// 
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// setup
namespace("jts", function () {
    /**
     * Calculates all the necessary dependencies for compiling the given Jakefile.js
     * The dependencies are added only if they exists.
     */
    function CompileJakefile(jakefileJs) {
        jakefileJs = MakeRelative(jakefileJs);
        var targetDir = path.dirname(jakefileJs);
        var dependencies = [];
        if (MakeRelative(targetDir) !== MakeRelative(JaketsDir)) {
            //Let's first make sure the jakets itself is fully done and ready
            dependencies.push(CompileJakefile(path.join(JaketsDir, "Jakefile.js")));
        }
        var makefile = MakeRelative(path.join(targetDir, "Makefile"));
        if (fs.existsSync(makefile)) {
            dependencies.push(makefile);
        }
        var jakefileTs = jakefileJs.replace(".js", ".ts");
        dependencies.push(jakefileTs);
        var hasPackageJson = fs.existsSync(path.join(targetDir, "package.json"));
        if (hasPackageJson) {
            dependencies.push(path.join(targetDir, NodeModulesUpdateIndicator));
        }
        if (hasPackageJson || fs.existsSync(path.join(targetDir, "tsd.json"))) {
            dependencies.push(path.join(targetDir, TypingsTsdDefs));
        }
        dependencies = dependencies.map(MakeRelative);
        var resultTarget;
        var targetJakefileDependencies = path.join(targetDir, JakefileDependencies);
        var hasDependency = fs.existsSync(targetJakefileDependencies);
        if (!hasDependency) {
            //Compile unconditionally since it seems file was never compiled before and need to be sure
            var compileJakefileTaskName = "compile_Jakefile_in_" + path.basename(targetDir);
            task(compileJakefileTaskName, [], function () {
                var _this = this;
                exports.tsc("--module commonjs --sourceMap " + jakefileTs, function () { return _this.complete(); });
            }, { async: true });
            dependencies.push(compileJakefileTaskName);
            resultTarget = "setup_all_for_" + path.basename(targetDir);
            task(resultTarget, dependencies, function () {
                jake.Log("Done with setup");
            });
        }
        else {
            //Compile conditionally since it seems file was already compiled before and we know what it depends on
            var depStr = fs.readFileSync(targetJakefileDependencies, 'utf8');
            dependencies = dependencies.concat(JSON.parse(depStr));
            resultTarget = jakefileJs;
            file(jakefileJs, dependencies, function () {
                var _this = this;
                exports.tsc("--module commonjs --sourceMap " + jakefileTs, function () { return _this.complete(); });
            }, { async: true });
        }
        jake.Log(dependencies);
        return resultTarget;
        // file(targetJakefileDependencies, [resultTarget], function() {
        //   jake.Log(`Updating file ${targetJakefileDependencies} from ${resultTarget}`);
        //   jake.Exec(`cd ${targetDir} && ${jakeCmd} jts:genDep`, () => this.complete());
        // }, { async: true });
        // return targetJakefileDependencies;
    }
    task("default", [CompileJakefile("Jakefile.js")], function () {
    });
    task("genDep", [JakefileDependencies], function () { });
    file(JakefileDependencies, ["Jakefile.js"], function () {
        //We will add all imported Jakefile.js file as well as any local .js files that each one might be referencing.
        //Also we assumt his rule is called from a local directory and it will create the files in that directory.
        var jakefilePattern = /(Jakefile.*)\.js$/;
        var jsJakeFiles = Object.keys(require('module')._cache)
            .filter(function (m) { return m.search(jakefilePattern) > -1; })
            .map(MakeRelative);
        var tsJakeFiles = jsJakeFiles
            .map(function (f) { return f.replace(jakefilePattern, "$1.ts"); });
        var dependencies = tsJakeFiles; //TODO: add other local modules.
        fs.writeFileSync(JakefileDependencies, JSON.stringify(dependencies));
        var jakeFileMk = "Jakefile.mk";
        var taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
        var taskList = taskListRaw.match(/^jake ([-\w]*)/gm);
        if (taskList) {
            taskList = taskList.map(function (t) { return t.match(/\s.*/)[0]; });
            jake.Log("Found public tasks " + taskList);
            var content = ""
                + "JAKE_TASKS = " + taskList.join(" ") + "\n"
                + "\n"
                + "Jakefile.js: " + dependencies.join(" ") + "\n"
                + "\n"
                + "clean:\n"
                + "\t#rm -f " + jsJakeFiles.join(" ") + "\n"
                + "\trm -f " + jsJakeFiles.map(function (f) { return f + ".map"; }).join(" ") + "\n";
            fs.writeFileSync(jakeFileMk, content);
        }
    });
});
// 
//////////////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=Jakefile.js.map