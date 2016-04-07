"use strict";
var fs = require("fs");
var path = require("path");
var jake = require("./Jake");
exports.exec = jake.Exec;
exports.shell = jake.Shell;
var NodeUtil = require("./NodeUtil");
var Bower = require("./Bower");
exports.bower = Bower.Exec;
var Tsc = require("./Tsc");
exports.tsc = Tsc.Exec;
var Browserify = require("./Browserify");
exports.browserify = Browserify.Exec;
var Closure = require("./Closure");
exports.closure = Closure.Exec;
var typingsCmd = NodeUtil.GetNodeCommand("typings", "typings --version ", "typings/dist/bin.js");
var jakeCmd = NodeUtil.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");
//////////////////////////////////////////////////////////////////////////////////////////
// Types and utils
//We use the following to better clarity what we are using/checking
exports.LocalDir = process.cwd();
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
var JaketsDir = MakeRelative(__dirname.replace("bootstrap", ""));
exports.BuildDir = process.env.BUILD__DIR || MakeRelative("./build");
//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies 
var NodeModulesUpdateIndicator = "node_modules/.node_modules_updated";
var TypingsDefs = "typings/main.d.ts";
var TypingsJson = "typings.json";
var JakefileDependencies = "Jakefile.dep.json";
desc("update typings/main.d.ts from package.json");
rule(new RegExp(TypingsDefs.replace(".", "[.]")), function (name) { return path.join(path.dirname(name), "..", "package.json"); }, [], function () {
    var _this = this;
    var typingsDeclarations = this.name;
    var packageJson = this.source;
    jake.Log("updating file " + typingsDeclarations + " from package file " + packageJson);
    jake.Log("" + packageJson);
    var typingsDir = path.dirname(typingsDeclarations);
    var currDir = path.dirname(packageJson);
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    var pkg = JSON.parse(pkgStr);
    var dependencies = pkg["dependencies"] || {};
    var additionalTypings = pkg["addTypings"] || {};
    var typingNames = Object.keys(additionalTypings);
    var pkgNames = Object.keys(dependencies);
    pkgNames = pkgNames.concat(typingNames);
    pkgNames.unshift("", "node");
    jake.Log(dependencies);
    var command = pkgNames.reduce(function (fullcmd, pkgName) { return fullcmd + " && ( " + typingsCmd + " install " + pkgName + " --ambient --save || true ) "; }, "");
    exports.shell.mkdir("-p", typingsDir);
    jake.Exec([
        "cd " + currDir
            + " && touch " + TypingsJson
            + command
            + " && touch " + TypingsDefs //We already CD to this folder, so use the short name
    ], function () {
        exports.shell.echo(typingsDeclarations);
        _this.complete();
    });
}, { async: true });
desc("update node_modules from package.json");
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
            + " && npm update"
            + " && touch " + NodeModulesUpdateIndicator //We already CD to this folder, so use the short name
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
        jake.Log("LocalDir=" + exports.LocalDir + " jakefileJs=" + jakefileJs + " targetDir=" + targetDir + " JaketsDir=" + JaketsDir);
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
        if (hasPackageJson
            && targetDir.indexOf("node_modules") === -1 //Don't run npm install if this is checked out as part of another npm install
        ) {
            dependencies.push(path.join(targetDir, NodeModulesUpdateIndicator));
        }
        if (hasPackageJson || fs.existsSync(path.join(targetDir, "typings.json"))) {
            dependencies.push(path.join(targetDir, TypingsDefs));
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
    }
    task("setup", [CompileJakefile("Jakefile.js")], function () {
    });
    task("generate_dependencies", [JakefileDependencies], function () { });
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