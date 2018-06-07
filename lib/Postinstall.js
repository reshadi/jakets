"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Path = require("path");
const Fs = require("fs");
const Util = require("./Util");
const Log_1 = require("./Log");
const Exec_1 = require("./Exec");
function PostInstall() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            let topInitDir = process.env.INIT_CWD;
            if (topInitDir) {
                const topPackageJson = Path.join(topInitDir, "package.json");
                Log_1.Log(`looking for jakets commands in ${topPackageJson}`, 0);
                let pkg = Util.GetPackage(topPackageJson);
                const scripts = pkg.scripts = pkg.scripts || {};
                const runJaketsSetup = `jake --jakefile ${Util.MakeRelativeToBaseDir(topInitDir, Path.join(Util.LocalDir, "Jakefile.js"))} jts:setup`;
                const runJaketsBuild = `jake --jakefile ${Util.MakeRelativeToBaseDir(topInitDir, "./Jakefile.js")}`;
                const runJakets = `npm run jakets:setup && npm run jakets:build`;
                function CheckAndSet(fieldName, value) {
                    if (scripts[fieldName] !== value) {
                        scripts[fieldName] = value;
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                if ([
                    CheckAndSet("jakets:build", runJaketsBuild),
                    CheckAndSet("jakets:setup", runJaketsSetup),
                    CheckAndSet("jakets", runJakets)
                ].some(needSave => needSave)) {
                    Log_1.Log(`Updating jakets commands in ${topPackageJson}`, 0);
                    Fs.writeFileSync(topPackageJson, JSON.stringify(pkg, null, "  "));
                }
            }
        }
        finally {
            return Exec_1.ExecAsync(`touch ${Util.NodeModulesUpdateIndicator}`);
        }
    });
}
PostInstall();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdGluc3RhbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0aW5zdGFsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLCtCQUErQjtBQUMvQiwrQkFBNEI7QUFDNUIsaUNBQW1DO0FBRW5DOztRQUNFLElBQUk7WUFDRixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUN0QyxJQUFJLFVBQVUsRUFBRTtnQkFDZCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDN0QsU0FBRyxDQUFDLGtDQUFrQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FNdEIsY0FBYyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7Z0JBQ2hELE1BQU0sY0FBYyxHQUFHLG1CQUFtQixJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQyxZQUFZLENBQUM7Z0JBQ3RJLE1BQU0sY0FBYyxHQUFHLG1CQUFtQixJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BHLE1BQU0sU0FBUyxHQUFHLDhDQUE4QyxDQUFDO2dCQUVqRSxxQkFBcUIsU0FBZ0QsRUFBRSxLQUFhO29CQUNsRixJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLEVBQUU7d0JBQ2hDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUM7d0JBQzNCLE9BQU8sSUFBSSxDQUFDO3FCQUNiO3lCQUFNO3dCQUNMLE9BQU8sS0FBSyxDQUFDO3FCQUNkO2dCQUNILENBQUM7Z0JBRUQsSUFDRTtvQkFDRSxXQUFXLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQztvQkFDM0MsV0FBVyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUM7b0JBQzNDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDO2lCQUNqQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUM1QjtvQkFDQSxTQUFHLENBQUMsK0JBQStCLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN4RCxFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDbkU7YUFDRjtTQUNGO2dCQUFTO1lBQ1IsT0FBTyxnQkFBUyxDQUFDLFNBQVMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQTtTQUM3RDtJQUNILENBQUM7Q0FBQTtBQUVELFdBQVcsRUFBRSxDQUFDIn0=