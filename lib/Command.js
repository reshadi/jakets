"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = require("fs");
const Path = require("path");
const Crypto = require("crypto");
const Util_1 = require("./Util");
exports.DepDir = `${Util_1.BuildDir}/dep`;
class CommandInfo {
    constructor(data) {
        this.Data = data;
        let hash = Crypto.createHash("sha1");
        hash.update(JSON.stringify(data));
        let value = hash.digest("hex");
        this.DependencyFile = `${exports.DepDir}/${data.Name}_${value}.json`;
        //In case data.name had some / in it, we need to re-calculate the dir
        let depDir = Path.dirname(this.DependencyFile);
        directory(depDir);
        this.AllDependencies = [depDir].concat(data.Dependencies);
        this.Read();
    }
    Read() {
        if (Fs.existsSync(this.DependencyFile)) {
            let depStr = Fs.readFileSync(this.DependencyFile, 'utf8');
            try {
                let dep = JSON.parse(depStr);
                let previousDependencies = dep.Dependencies.concat(dep.Inputs).concat(dep.Files);
                let existingDependencies = previousDependencies.filter(d => d && Fs.existsSync(d));
                this.AllDependencies = this.AllDependencies.concat(existingDependencies);
            }
            catch (e) {
                console.error(`Regenerating the invalid dep file: ${this.DependencyFile}`);
                Fs.unlinkSync(this.DependencyFile);
                // this.AllDependencies = [];
            }
        }
    }
    Write(inputs, outputs, files) {
        if (inputs) {
            this.Data.Inputs = inputs;
        }
        if (outputs) {
            this.Data.Outputs = outputs;
        }
        if (files) {
            this.Data.Files = files;
        }
        Fs.writeFileSync(this.DependencyFile, JSON.stringify(this.Data, null, ' '));
    }
}
exports.CommandInfo = CommandInfo;
function ExtractFilesAndUpdateDependencyInfo(cmdInfo, error, stdout, stderror) {
    if (error) {
        console.error(`
${error}
${stdout}
${stderror}`);
        throw error;
    }
    let files = stdout
        .split("\n")
        .map(f => f.trim())
        .filter(f => !!f)
        .map(f => Util_1.MakeRelativeToWorkingDir(f));
    cmdInfo.Write(files);
}
exports.ExtractFilesAndUpdateDependencyInfo = ExtractFilesAndUpdateDependencyInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQyxpQ0FBNEQ7QUFFL0MsUUFBQSxNQUFNLEdBQUcsR0FBRyxlQUFRLE1BQU0sQ0FBQztBQXlCeEM7SUFVRSxZQUFZLElBQWM7UUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFFakIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxjQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQztRQUU3RCxxRUFBcUU7UUFDckUsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDL0MsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWxCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFTyxJQUFJO1FBQ1YsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNs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