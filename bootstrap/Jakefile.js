"use strict";
require("@types/index");
var fs = require("fs");
var path = require("path");
var jake = require("./Jake");
exports.exec = jake.Exec;
exports.shell = jake.Shell;
exports.Log = jake.Log;
exports.LogTask = jake.LogTask;
var NodeUtil = require("./NodeUtil");
var Bower = require("./Bower");
exports.bower = Bower.Exec;
var Tsc = require("./Tsc");
exports.tsc = Tsc.Exec;
var Browserify = require("./Browserify");
exports.browserify = Browserify.Exec;
var Closure = require("./Closure");
exports.closure = Closure.Exec;
var jakeCmd = NodeUtil.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");
//////////////////////////////////////////////////////////////////////////////////////////
// Types and utils
//We use the following to better clarity what we are using/checking
exports.LocalDir = process.cwd();
function MakeRelativeToWorkingDir(fullpath) {
    if (!fullpath) {
        return fullpath;
    }
    return path.relative(exports.LocalDir, fullpath)
        .replace(/\\/g, "/") //Convert \ to / on windows
        || '.' //in case the answer is empty
    ;
    // return path.relative(LocalDir, fullpath) || '.';
}
exports.MakeRelativeToWorkingDir = MakeRelativeToWorkingDir;
//For backward compatibility
exports.MakeRelative = MakeRelativeToWorkingDir;
var JaketsDir = MakeRelativeToWorkingDir(__dirname.replace("bootstrap", ""));
exports.BuildDir = process.env.BUILD__DIR || MakeRelativeToWorkingDir("./build");
//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies 
var NodeModulesUpdateIndicator = MakeRelativeToWorkingDir("node_modules/.node_modules_updated");
var TypingsDefs = "typings/main.d.ts";
var TypingsJson = MakeRelativeToWorkingDir("typings.json");
var JakefileDependencies = MakeRelativeToWorkingDir("Jakefile.dep.json");
desc("update " + TypingsDefs + " from package.json");
rule(new RegExp(TypingsDefs.replace(".", "[.]")), function (name) { return path.join(path.dirname(name), "..", "package.json"); }, [], function () {
    var _this = this;
    var typingsDeclarations = this.name;
    var packageJson = this.source;
    jake.Log("updating file " + typingsDeclarations + " from package file " + packageJson, 1);
    jake.Log("" + packageJson, 3);
    var typingsDir = path.dirname(typingsDeclarations);
    var currDir = path.dirname(packageJson);
    var pkgNames;
    //Extract package names from pacakge.json for backward compatibility
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    var pkg = JSON.parse(pkgStr);
    var dependencies = pkg["dependencies"] || {};
    jake.Log(dependencies, 2);
    var additionalTypings = pkg["addTypings"] || {};
    pkgNames = Object.keys(dependencies);
    pkgNames = pkgNames.filter(function (p) { return p.lastIndexOf("@types", 6) === -1; });
    for (var typename in additionalTypings) {
        var typeSelector = additionalTypings[typename];
        var typeIndex = pkgNames.indexOf(typename);
        if (typeSelector === false || typeSelector === "-") {
            if (typeIndex !== -1) {
                //Remove this typing from the list
                pkgNames[typeIndex] = pkgNames[pkgNames.length - 1];
                --pkgNames.length;
            }
        }
        else {
            if (typeIndex === -1) {
                //add this missing type
                pkgNames.push(typename);
            }
        }
    }
    pkgNames.unshift("node");
    //Extract all package names in the node_modules/@types/
    var typesPkgDir = MakeRelativeToWorkingDir("node_modules/@types");
    pkgNames = pkgNames.concat(fs.readdirSync(typesPkgDir).filter(function (f) {
        return pkgNames.indexOf(f) === -1
            && fs.statSync(path.join(typesPkgDir, f)).isDirectory();
    }));
    jake.Log(pkgNames, 2);
    //We need to look this up the last moment to make sure correct path is picked up
    var typingsCmd = NodeUtil.GetNodeCommand("typings", "typings --version ", "typings/dist/bin.js");
    var command = pkgNames.reduce(function (fullcmd, pkgName) { return fullcmd + " && ( " + typingsCmd + " install " + pkgName + " --ambient --save || true ) "; }, "");
    // let command = pkgNames.reduce((fullcmd, pkgName) => fullcmd + " && ( " + typingsCmd + " install dt~" + pkgName + " --global --save || true ) ", "");
    exports.shell.mkdir("-p", typingsDir);
    exports.shell.mkdir("-p", typesPkgDir);
    jake.Exec([
        "cd " + currDir
            + " && touch " + TypingsJson
            + command
            + " && touch " + TypingsDefs //We already CD to this folder, so use the short name
    ], function () {
        //For backward compatibility, we make the main.d.ts to point to index.d.ts
        // fs.writeFileSync(TypingsDefs, `/// <reference path='./index.d.ts'/>`);
        fs.writeFileSync(path.join(typesPkgDir, "index.ts"), "import \"../../typings/index.ts\";");
        fs.writeFileSync(path.join(typingsDir, "index.ts"), "/// <reference path='./main.d.ts'/>");
        ;
        exports.shell.echo(typingsDeclarations);
        _this.complete();
        jake.LogTask(_this, 2);
    });
}, { async: true });
desc("update node_modules from package.json");
rule(new RegExp(NodeModulesUpdateIndicator), function (name) { return path.join(path.dirname(name), "..", "package.json"); }, [], function () {
    var _this = this;
    var indicator = this.name;
    var packageJson = this.source;
    jake.Log("updating file " + indicator + " from package file " + packageJson, 1);
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
        jake.LogTask(_this, 2);
    });
}, { async: true });
// desc("create empty package.json if missing");
file("package.json", [], function () {
    var _this = this;
    jake.Log(this.name, 3);
    console.error("Generating package.json");
    var NPM = path.join("npm");
    exports.exec([NPM + " init"], function () { _this.complete(); jake.LogTask(_this, 2); });
}, { async: true });
// 
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// setup
function CreatePlaceHolderTask(taskName, dependencies) {
    var t = task(taskName, dependencies, function () {
        jake.LogTask(this, 2);
    });
    jake.LogTask(t, 2);
    if (t["name"] !== taskName) {
        jake.Log(taskName + " != " + t["name"]);
    }
    return taskName;
}
function UpdatePackages(directories) {
    var dependencies = directories
        .filter(function (targetDir) {
        return targetDir.indexOf("node_modules") === -1 //Don't run npm install if this is checked out as part of another npm install
            && fs.existsSync(path.join(targetDir, "package.json"));
    })
        .map(function (targetDir) {
        return MakeRelativeToWorkingDir(path.join(targetDir, NodeModulesUpdateIndicator));
    })
        .concat(directories
        .map(function (targetDir) { return MakeRelativeToWorkingDir(path.join(targetDir, "Makefile")); })
        .filter(function (targetDir) { return fs.existsSync(targetDir); }));
    return CreatePlaceHolderTask("update_packages", dependencies);
}
exports.UpdatePackages = UpdatePackages;
function UpdateTypings(directories) {
    var taskName = "update_typings";
    var updateTask = task(taskName, [UpdatePackages(directories)], function () {
        var _this = this;
        //At this point we know that all package.json files are already installed
        //So, we can safely look for folders inside of node_modules folders as well
        var dependencies = directories
            .filter(function (targetDir) { return fs.existsSync(path.join(targetDir, "package.json")) || fs.existsSync(path.join(targetDir, "typings.json")); })
            .map(function (targetDir) { return path.join(targetDir, TypingsDefs).replace(/\\/g, "/"); });
        //Now we need to invoke all these files
        var depTask = task(taskName + "_dependencies", dependencies, function () {
            this.complete();
            jake.LogTask(this, 2);
        }, { async: true });
        depTask.addListener("complete", function () {
            _this.complete();
            jake.LogTask(_this, 2);
        });
        depTask.invoke();
        jake.LogTask(this, 2);
    }, { async: true });
    jake.LogTask(updateTask, 2);
    return taskName;
}
exports.UpdateTypings = UpdateTypings;
function CompileJakefiles(directories) {
    if (!directories) {
        directories = [];
    }
    directories.push(".");
    if (MakeRelativeToWorkingDir(JaketsDir) !== ".") {
        directories.push(JaketsDir);
    }
    directories = directories.filter(function (d, index, array) { return array.indexOf(d) === index; }); //Remove repeates in case later we add more
    jake.Log("LocalDir=" + exports.LocalDir + "  - JaketsDir=" + JaketsDir + " - Dirs=[" + directories.join(",") + "]", 3);
    var updateTypingsTaskName = UpdateTypings(directories);
    var dependencies = directories
        .filter(function (targetDir) { return fs.existsSync(targetDir); })
        .map(function (targetDir) {
        var jakefileTs = path.join(targetDir, "Jakefile.ts");
        var jakefileJs = jakefileTs.replace(".ts", ".js");
        var resultTarget;
        var dependencies = [updateTypingsTaskName];
        var compileJakefileTs = function () {
            var _this = this;
            exports.tsc(
            // `--module commonjs --inlineSourceMap ${MakeRelativeToWorkingDir(path.join(__dirname, TypingsDefs))} ${jakefileTs}`
            "--module commonjs --inlineSourceMap " + jakefileTs, function () { _this.complete(); jake.LogTask(_this, 2); });
        };
        var targetJakefileDependencies = path.join(targetDir, JakefileDependencies);
        var hasDependency = fs.existsSync(targetJakefileDependencies);
        if (!hasDependency) {
            //Compile unconditionally since it seems file was never compiled before and need to be sure
            var compileJakefileTaskName = "compile_Jakefile_in_" + path.basename(targetDir);
            task(compileJakefileTaskName, [updateTypingsTaskName], compileJakefileTs, { async: true });
            dependencies.push(compileJakefileTaskName);
            resultTarget = "setup_all_for_" + path.basename(targetDir);
            task(resultTarget, dependencies, function () {
                jake.LogTask(this, 2);
            });
        }
        else {
            //Compile conditionally since it seems file was already compiled before and we know what it depends on
            var depStr = fs.readFileSync(targetJakefileDependencies, 'utf8');
            dependencies = dependencies.concat(JSON.parse(depStr));
            resultTarget = jakefileJs;
            file(jakefileJs, dependencies, compileJakefileTs, { async: true });
        }
        return resultTarget;
    });
    return CreatePlaceHolderTask("compile_jakefiles", dependencies);
}
exports.CompileJakefiles = CompileJakefiles;
namespace("jts", function () {
    CreatePlaceHolderTask("setup", [CompileJakefiles([])]);
    task("generate_dependencies", [JakefileDependencies], function () { });
    file(JakefileDependencies, ["Jakefile.js"], function () {
        //We will add all imported Jakefile.js file as well as any local .js files that each one might be referencing.
        //Also we assumt his rule is called from a local directory and it will create the files in that directory.
        var jakefilePattern = /(Jakefile.*)\.js$/;
        var jsJakeFiles = Object.keys(require('module')._cache)
            .filter(function (m) { return m.search(jakefilePattern) > -1; })
            .map(MakeRelativeToWorkingDir);
        var tsJakeFiles = jsJakeFiles
            .map(function (f) { return f.replace(jakefilePattern, "$1.ts"); });
        var dependencies = tsJakeFiles; //TODO: add other local modules.
        fs.writeFileSync(JakefileDependencies, JSON.stringify(dependencies));
        var jakeFileMk = "Jakefile.dep.mk";
        var taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
        var taskList = taskListRaw && taskListRaw.match(/^jake ([-\w]*)/gm);
        if (taskList) {
            taskList = taskList.map(function (t) { return t.match(/\s.*/)[0]; });
            jake.Log("Found public tasks " + taskList, 1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWtlZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTyxjQUFjLENBQUMsQ0FBQTtBQUN0QixJQUFZLEVBQUUsV0FBTSxJQUFJLENBQUMsQ0FBQTtBQUN6QixJQUFZLElBQUksV0FBTSxNQUFNLENBQUMsQ0FBQTtBQUU3QixJQUFZLElBQUksV0FBTSxRQUFRLENBQUMsQ0FBQTtBQUNwQixZQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNqQixhQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixXQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNmLGVBQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBRWxDLElBQVksUUFBUSxXQUFNLFlBQVksQ0FBQyxDQUFBO0FBRXZDLElBQVksS0FBSyxXQUFNLFNBQVMsQ0FBQyxDQUFBO0FBQ3RCLGFBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBRTlCLElBQVksR0FBRyxXQUFNLE9BQU8sQ0FBQyxDQUFBO0FBQ2xCLFdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBRTFCLElBQVksVUFBVSxXQUFNLGNBQWMsQ0FBQyxDQUFBO0FBQ2hDLGtCQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztBQUV4QyxJQUFZLE9BQU8sV0FBTSxXQUFXLENBQUMsQ0FBQTtBQUMxQixlQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUVsQyxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBRW5GLDBGQUEwRjtBQUMxRixrQkFBa0I7QUFFbEIsbUVBQW1FO0FBQ3hELGdCQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRXBDLGtDQUF5QyxRQUFnQjtJQUN2RCxFQUFFLENBQUMsQ0FB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