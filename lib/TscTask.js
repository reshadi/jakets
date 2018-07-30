"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Path = require("path");
const Util = require("./Util");
const Helpers = require("./task/Helpers");
const Command = require("./Command");
const Typescript = require("typescript");
const Task = require("./task/Task");
//The following are the most common types used from typescript for the compiler optionss
exports.ModuleKind = Typescript.ModuleKind;
;
exports.ScriptTarget = Typescript.ScriptTarget;
function TscTask(name, filenames, dependencies, options, emitOptions, excludeExternals) {
    let depInfo = new Command.CommandInfo({
        Name: name,
        Dir: Path.resolve(Util.LocalDir),
        Command: "tsc",
        Inputs: filenames,
        TsConfig: options,
        Dependencies: Task.Task.NormalizeDedpendencies(dependencies)
    });
    return Helpers.FileTask(depInfo.DependencyFile, depInfo.AllDependencies, function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let sectionName = `tsc compile ${depInfo.DependencyFile}`;
            console.time(sectionName);
            let program = Typescript.createProgram(filenames, options);
            let allFilenames = program.getSourceFiles().map(f => Util.MakeRelativeToWorkingDir(f.fileName));
            if (!excludeExternals) {
                program = Typescript.createProgram(allFilenames, options);
                if (allFilenames.length !== program.getSourceFiles().length) {
                    let newAllFilenames = program.getSourceFiles().map(f => Util.MakeRelativeToWorkingDir(f.fileName));
                    let diff1 = allFilenames.filter(f => newAllFilenames.indexOf(f) === -1);
                    let diff2 = newAllFilenames.filter(f => allFilenames.indexOf(f) === -1);
                    this.Log(`
WARNING: Unexpected new source files discovered when compiling
>^^ top files
${filenames.join("\n")}
>-- reachable files removed
${diff1.join("\n")}
>++ reachable files added
${diff2.join("\n")}
`, 0);
                    // process.exit(1); //Only report but still try to compile!
                }
            }
            let emitResult = (emitOptions && emitOptions.programEmit)
                ? emitOptions.programEmit(program)
                : program.emit(undefined, undefined, undefined, undefined, emitOptions && emitOptions.customTransformers);
            let outputs = emitResult && emitResult.emittedFiles && emitResult.emittedFiles.map(Util.MakeRelativeToWorkingDir);
            let allDiagnostics = Typescript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
            allDiagnostics.forEach(diagnostic => {
                let message = Typescript.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                if (diagnostic.file) {
                    let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0);
                    message = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
                }
                console.warn(message);
            });
            let exitCode = emitResult.emitSkipped ? 1 : 0;
            this.Log(`Process exiting with code '${exitCode}'.`, 1);
            console.timeEnd(sectionName);
            if (exitCode > 0) {
                const msg = `>> TypeScript compilation failed for ${name}`;
                this.Log(msg, 0);
                process.exit(exitCode);
                // fail(msg, exitCode); //End the whole compilation
                // throw msg;
            }
            depInfo.Write(allFilenames, outputs);
        });
    });
}
exports.TscTask = TscTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHNjVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRzY1Rhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQiwwQ0FBMEM7QUFFMUMscUNBQXFDO0FBQ3JDLHlDQUF5QztBQUN6QyxvQ0FBb0M7QUFHcEMsd0ZBQXdGO0FBQzdFLFFBQUEsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7QUFBQSxDQUFDO0FBQ3BDLFFBQUEsWUFBWSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7QUFFbEQsU0FBZ0IsT0FBTyxDQUNyQixJQUFZLEVBQ1YsU0FBbUIsRUFDbkIsWUFBbUMsRUFDbkMsT0FBbUMsRUFDbkMsV0FHRCxFQUNDLGdCQUEwQjtJQUc1QixJQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxFQUFFLElBQUk7UUFDVixHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2hDLE9BQU8sRUFBRSxLQUFLO1FBQ2QsTUFBTSxFQUFFLFNBQVM7UUFDakIsUUFBUSxFQUFFLE9BQU87UUFDakIsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDO0tBQzdELENBQUMsQ0FBQztJQUVILE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUU7O1lBQ3ZFLElBQUksV0FBVyxHQUFHLGVBQWUsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzFELE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFMUIsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0QsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFD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