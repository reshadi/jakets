"use strict";
var fs = require("fs");
var path = require("path");
var Crypto = require("crypto");
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
// let TypingsDefs = "typings/main.d.ts";
// let TypingsJson = MakeRelativeToWorkingDir("typings.json");
var JakefileDependencies = MakeRelativeToWorkingDir("Jakefile.dep.json");
// desc(`update ${TypingsDefs} from package.json`);
// rule(new RegExp(TypingsDefs.replace(".", "[.]")), name => path.join(path.dirname(name), "..", "package.json"), [], function () {
//   let typingsDeclarations: string = this.name;
//   let packageJson: string = this.source;
//   jake.Log(`updating file ${typingsDeclarations} from package file ${packageJson}`, 1);
//   jake.Log(`${packageJson}`, 3);
//   let typingsDir = path.dirname(typingsDeclarations);
//   let currDir = path.dirname(packageJson);
//   let pkgNames: string[];
//   //Extract package names from pacakge.json for backward compatibility
//   var pkgStr: string = fs.readFileSync(packageJson, 'utf8');
//   var pkg = JSON.parse(pkgStr);
//   var dependencies = pkg["dependencies"] || {};
//   jake.Log(dependencies, 2);
//   var additionalTypings = pkg["addTypings"] || {};
//   pkgNames = Object.keys(dependencies);
//   pkgNames = pkgNames.filter(p => p.lastIndexOf("@types", 6) === -1);
//   for (let typename in additionalTypings) {
//     let typeSelector = additionalTypings[typename];
//     let typeIndex = pkgNames.indexOf(typename);
//     if (typeSelector === false || typeSelector === "-") {
//       if (typeIndex !== -1) {
//         //Remove this typing from the list
//         pkgNames[typeIndex] = pkgNames[pkgNames.length - 1];
//         --pkgNames.length;
//       }
//     } else {
//       if (typeIndex === -1) {
//         //add this missing type
//         pkgNames.push(typename);
//       }
//     }
//   }
//   pkgNames.unshift("node");
//   //Extract all package names in the node_modules/@types/
//   let typesPkgDir = MakeRelativeToWorkingDir("node_modules/@types");
//   pkgNames = pkgNames.concat(
//     fs.readdirSync(typesPkgDir).filter(
//       f =>
//         pkgNames.indexOf(f) === -1
//         && fs.statSync(path.join(typesPkgDir, f)).isDirectory())
//   );
//   jake.Log(pkgNames, 2);
//   //We need to look this up the last moment to make sure correct path is picked up
//   let typingsCmd = NodeUtil.GetNodeCommand("typings", "typings --version ", "typings/dist/bin.js");
//   let command = pkgNames.reduce((fullcmd, pkgName) => fullcmd + " && ( " + typingsCmd + " install " + pkgName + " --ambient --save || true ) ", "");
//   // let command = pkgNames.reduce((fullcmd, pkgName) => fullcmd + " && ( " + typingsCmd + " install dt~" + pkgName + " --global --save || true ) ", "");
//   shell.mkdir("-p", typingsDir);
//   shell.mkdir("-p", typesPkgDir);
//   jake.Exec([
//     "cd " + currDir
//     // + " && touch " + TypingsJson
//     // + command
//     + " && touch " + TypingsDefs //We already CD to this folder, so use the short name
//   ], () => {
//     //For backward compatibility, we make the main.d.ts to point to index.d.ts
//     // fs.writeFileSync(TypingsDefs, `/// <reference path='./index.d.ts'/>`);
//     ["index", "main", "browser"].forEach(f => {
//       fs.writeFileSync(path.join(typesPkgDir, `${f}.ts`), `//import "../../typings/${f}";`);
//       fs.writeFileSync(path.join(typingsDir, `${f}.ts`), `// / <reference path='./${f}.d.ts'/>`);
//     });
//     shell.echo(typingsDeclarations);
//     this.complete();
//     jake.LogTask(this, 2);
//   });
// }, { async: true });
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
function GetDependencyInfo(data) {
    var hash = Crypto.createHash("sha1");
    hash.update(JSON.stringify(data));
    var value = hash.digest("hex");
    var depDir = exports.MakeRelative(path.join(exports.BuildDir, "dep"));
    var depFile = depDir + "/" + data.name + "_" + value + ".json";
    depDir = path.dirname(depFile);
    directory(depDir);
    var allDependencies = [depDir].concat(data.dependencies);
    if (fs.existsSync(depFile)) {
        var depStr = fs.readFileSync(depFile, 'utf8');
        try {
            var dep = JSON.parse(depStr);
            var previousDependencies = dep.dependencies.concat(dep.files);
            var existingDependencies = previousDependencies.filter(function (d) { return d && fs.existsSync(d); });
            allDependencies = allDependencies.concat(existingDependencies);
        }
        catch (e) {
            console.error("Regenerating the invalid dep file: " + depFile);
            allDependencies = [];
        }
    }
    var result = {
        DepFile: depFile,
        AllDependencies: allDependencies
    };
    return result;
}
function ExtractFilesAndUpdateDependencyInfo(data, depInfo, error, stdout, stderror) {
    if (error) {
        console.error("\n" + error + "\n" + stdout + "\n" + stderror);
        throw error;
    }
    data.files =
        stdout
            .split("\n")
            .map(function (f) { return f.trim(); })
            .filter(function (f) { return !!f; })
            .map(function (f) { return MakeRelativeToWorkingDir(f); });
    fs.writeFileSync(depInfo.DepFile, JSON.stringify(data, null, ' '));
}
function TscTask(name, dependencies, command, excludeExternal) {
    command += " --listFiles --noEmitOnError";
    var data = {
        name: name,
        dir: path.resolve(exports.LocalDir),
        command: command,
        dependencies: dependencies,
        files: []
    };
    var depInfo = GetDependencyInfo(data);
    file(depInfo.DepFile, depInfo.AllDependencies, function () {
        var _this = this;
        exports.tsc(command, function (error, stdout, stderror) {
            ExtractFilesAndUpdateDependencyInfo(data, depInfo, error, stdout, stderror);
            var callback = function () {
                _this.complete();
                exports.LogTask(_this, 2);
            };
            if (!excludeExternal) {
                var seenDirs_1 = {};
                var files = data.files.reverse().filter(function (f) {
                    if (/node_modules/.test(f) && !/[.]d[.]ts$/.test(f)) {
                        var dir = path.dirname(f);
                        var seenCount = seenDirs_1[dir] = ((seenDirs_1[dir] || 0) + 1);
                        return seenCount <= 5;
                    }
                    return false;
                });
                exports.tsc(command + " " + files.join(" "), callback, false);
            }
            else {
                callback();
            }
        }, true);
    }, { async: true });
    return depInfo.DepFile;
}
exports.TscTask = TscTask;
function BrowserifyTask(name, dependencies, output, inputs, isRelease, tsargs, options) {
    var data = {
        name: name,
        dir: path.resolve(exports.LocalDir),
        output: output,
        inputs: inputs,
        isRelease: isRelease,
        tsargs: tsargs,
        options: options,
        dependencies: dependencies
    };
    var depInfo = GetDependencyInfo(data);
    file(depInfo.DepFile, depInfo.AllDependencies, function () {
        var _this = this;
        exports.browserify(inputs, output, function (error, stdout, stderror) {
            ExtractFilesAndUpdateDependencyInfo(data, depInfo, error, stdout, stderror);
            _this.complete();
            exports.LogTask(_this, 2);
        }, isRelease, tsargs, (options || "") + " --list", true);
    }, { async: true });
    file(output, [depInfo.DepFile], function () {
        var _this = this;
        exports.browserify(inputs, output, function () {
            _this.complete();
            exports.LogTask(_this, 2);
        }, isRelease, tsargs, options);
    }, { async: true });
    return output;
}
exports.BrowserifyTask = BrowserifyTask;
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
    // let updateTypingsTaskName = UpdateTypings(directories);
    var dependencies = directories
        .filter(function (targetDir) { return fs.existsSync(targetDir); })
        .map(function (targetDir) {
        var jakefileTs = path.join(targetDir, "Jakefile.ts");
        var jakefileJs = jakefileTs.replace(".ts", ".js");
        var jakefileDepJson = jakefileTs.replace(".ts", ".dep.json");
        var jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");
        var resultTarget;
        var dependencies = []; //[updateTypingsTaskName];
        jakefileDepJson = TscTask("Jakefile", dependencies, "--module commonjs  --inlineSourceMap --noEmitOnError --listFiles " + jakefileTs);
        file(jakefileDepMk, [jakefileDepJson], function () {
            var computedDependencies;
            var depStr = fs.readFileSync(jakefileDepJson, 'utf8');
            try {
                var dep = JSON.parse(depStr);
                computedDependencies = dep.dependencies.concat(dep.files);
            }
            catch (e) {
                console.error("Invalid dep file: " + jakefileDepJson);
            }
            var taskListRaw;
            try {
                taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
            }
            catch (e) { }
            var taskList = taskListRaw && taskListRaw.match(/^jake ([-:\w]*)/gm);
            if (taskList) {
                taskList = taskList.map(function (t) { return t.match(/\s.*/)[0]; });
                jake.Log("Found public tasks " + taskList, 1);
            }
            else {
                taskList = [];
            }
            var content = "\nJAKE_TASKS += " + taskList.join(" ") + "\n\nJakefile.js: $(wildcard " + computedDependencies.join(" ") + ")\n\nclean:\n\t#rm -f " + computedDependencies
                .filter(function (f) { return !/node_modules|[.]d[.]ts/.test(f); })
                .map(function (f) { return f.replace(".ts", ".js") + " " + f.replace(".ts", ".dep.*"); })
                .join(" ") + "\n";
            fs.writeFileSync(jakefileDepMk, content);
            this.complete();
        }, { async: true });
        return jakefileDepMk;
    });
    return CreatePlaceHolderTask("compile_jakefiles", dependencies);
}
exports.CompileJakefiles = CompileJakefiles;
namespace("jts", function () {
    CreatePlaceHolderTask("setup", [CompileJakefiles([])]);
});
task("default");
//
//////////////////////////////////////////////////////////////////////////////////////////
