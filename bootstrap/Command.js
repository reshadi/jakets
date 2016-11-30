"use strict";
const Fs = require("fs");
const Path = require("path");
const Crypto = require("crypto");
const Util_1 = require("./Util");
class CommandInfo {
    constructor(data) {
        this.Data = data;
        let hash = Crypto.createHash("sha1");
        hash.update(JSON.stringify(data));
        let value = hash.digest("hex");
        let depDir = Path.join(Util_1.BuildDir, "dep");
        this.DependencyFile = `${depDir}/${data.Name}_${value}.json`;
        //In case data.name had some / in it, we need to re-calculate the dir
        depDir = Path.dirname(this.DependencyFile);
        directory(depDir);
        this.AllDependencies = [depDir].concat(data.Dependencies);
        this.Read();
    }
    Read() {
        if (Fs.existsSync(this.DependencyFile)) {
            let depStr = Fs.readFileSync(this.DependencyFile, 'utf8');
            try {
                let dep = JSON.parse(depStr);
                let previousDependencies = dep.Dependencies.concat(dep.Files);
                let existingDependencies = previousDependencies.filter(d => d && Fs.existsSync(d));
                this.AllDependencies = this.AllDependencies.concat(existingDependencies);
            }
            catch (e) {
                console.error(`Regenerating the invalid dep file: ${this.DependencyFile}`);
                Fs.unlinkSync(this.DependencyFile);
            }
        }
    }
    Write(files) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBRWpDLGlDQUE0RDtBQW1CNUQ7SUFVRSxZQUFZLElBQWM7UUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFFakIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQztRQUU3RCxxRUFBcUU7UUFDckUsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzNDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVsQixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRU8sSUFBSTtRQUNWLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDO2dCQUNILElBQUksR0FBRyxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLG9CQUFvQixHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUMzRSxDQUFFO1lBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztnQkFDM0UsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFckMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQWdCO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDMUIsQ0FBQztRQUNELEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztDQUNGO0FBakRELGtDQWlEQztBQUVELDZDQUEyRSxPQUF1QixFQUFFLEtBQUssRUFBRSxNQUFjLEVBQUUsUUFBUTtJQUNqSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQztFQUNoQixLQUFLO0VBQ0wsTUFBTTtFQUNOLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDVixNQUFNLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxJQUFJLEtBQUssR0FDUCxNQUFNO1NBQ0gsS0FBSyxDQUFDLElBQUksQ0FBQztTQUNYLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2xCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQixHQUFHLENBQUMsQ0FBQyxJQUFJLCtCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBaEJELGtGQWdCQyJ9