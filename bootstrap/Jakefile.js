"use strict";
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
function MakeRelative(fullpath) {
    if (!fullpath) {
        return fullpath;
    }
    return path.relative(exports.LocalDir, fullpath)
        .replace(/\\/g, "/") //Convert \ to / on windows
        || '.' //in case the answer is empty
    ;
    // return path.relative(LocalDir, fullpath) || '.';
}
exports.MakeRelative = MakeRelative;
var JaketsDir = MakeRelative(__dirname.replace("bootstrap", ""));
exports.BuildDir = process.env.BUILD__DIR || MakeRelative("./build");
//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies 
var NodeModulesUpdateIndicator = MakeRelative("node_modules/.node_modules_updated");
var TypingsDefs = "typings/main.d.ts";
var TypingsJson = MakeRelative("typings.json");
var JakefileDependencies = MakeRelative("Jakefile.dep.json");
desc("update typings/main.d.ts from package.json");
rule(new RegExp(TypingsDefs.replace(".", "[.]")), function (name) { return path.join(path.dirname(name), "..", "package.json"); }, [], function () {
    var _this = this;
    var typingsDeclarations = this.name;
    var packageJson = this.source;
    jake.Log("updating file " + typingsDeclarations + " from package file " + packageJson, 1);
    jake.Log("" + packageJson, 3);
    var typingsDir = path.dirname(typingsDeclarations);
    var currDir = path.dirname(packageJson);
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    var pkg = JSON.parse(pkgStr);
    var dependencies = pkg["dependencies"] || {};
    var additionalTypings = pkg["addTypings"] || {};
    var pkgNames = Object.keys(dependencies);
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
    pkgNames.unshift("", "node");
    jake.Log(dependencies, 3);
    //We need to look this up the last moment to make sure correct path is picked up
    var typingsCmd = NodeUtil.GetNodeCommand("typings", "typings --version ", "typings/dist/bin.js");
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
        return MakeRelative(path.join(targetDir, NodeModulesUpdateIndicator));
    })
        .concat(directories
        .map(function (targetDir) { return MakeRelative(path.join(targetDir, "Makefile")); })
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
    if (MakeRelative(JaketsDir) !== ".") {
        directories.push(JaketsDir);
        directories.push(MakeRelative("node_modules/jakets"));
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
        var targetJakefileDependencies = path.join(targetDir, JakefileDependencies);
        var hasDependency = fs.existsSync(targetJakefileDependencies);
        if (!hasDependency) {
            //Compile unconditionally since it seems file was never compiled before and need to be sure
            var compileJakefileTaskName = "compile_Jakefile_in_" + path.basename(targetDir);
            task(compileJakefileTaskName, [updateTypingsTaskName], function () {
                var _this = this;
                exports.tsc("--module commonjs --sourceMap " + jakefileTs, function () { _this.complete(); jake.LogTask(_this, 2); });
            }, { async: true });
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
            file(jakefileJs, dependencies, function () {
                var _this = this;
                exports.tsc("--module commonjs --sourceMap " + jakefileTs, function () { _this.complete(); jake.LogTask(_this, 2); });
            }, { async: true });
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
//# sourceMappingURL=Jakefile.js.map