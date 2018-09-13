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
        let topInitDir = process && process.env && process.env.INIT_CWD;
        if (topInitDir) {
            try {
                const topPackageJson = Path.join(topInitDir, "package.json");
                Log_1.Log(`looking for jakets commands in ${topPackageJson}`, 0);
                let pkg = Util.LoadJson(topPackageJson);
                const scripts = pkg.scripts = pkg.scripts || {};
                const runJaketsSetup = `jake -t --jakefile ${Util.MakeRelativeToBaseDir(topInitDir, Path.join(Util.LocalDir, "Jakefile.js"))} jts:setup`;
                const runJaketsBuild = `jake -t --jakefile Jakefile.js`;
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
                    CheckAndSet("jakets:setup", runJaketsSetup),
                    CheckAndSet("jakets:build", runJaketsBuild),
                    CheckAndSet("jakets", runJakets)
                ].some(needSave => needSave)) {
                    Log_1.Log(`Updating jakets commands in ${topPackageJson}`, 0);
                    Fs.writeFileSync(topPackageJson, JSON.stringify(pkg, null, "  "));
                }
                return Exec_1.ExecAsync(`touch ${Path.join(topInitDir, Util.NodeModulesUpdateIndicator)} `);
            }
            finally {
            }
        }
    });
}
PostInstall();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdGluc3RhbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0aW5zdGFsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLCtCQUErQjtBQUMvQiwrQkFBNEI7QUFDNUIsaUNBQW1DO0FBRW5DLFNBQWUsV0FBVzs7UUFDeEIsSUFBSSxVQUFVLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDaEUsSUFBSSxVQUFVLEVBQUU7WUFDZCxJQUFJO2dCQUNGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUM3RCxTQUFHLENBQUMsa0NBQWtDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQU1wQixjQUFjLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztnQkFDaEQsTUFBTSxjQUFjLEdBQUcsc0JBQXNCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLFlBQVksQ0FBQztnQkFDekksTUFBTSxjQUFjLEdBQUcsZ0NBQWdDLENBQUM7Z0JBQ3hELE1BQU0sU0FBUyxHQUFHLDhDQUE4QyxDQUFDO2dCQUVqRSxTQUFTLFdBQVcsQ0FBQyxTQUFnRCxFQUFFLEtBQWE7b0JBQ2xGLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssRUFBRTt3QkFDaEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQzt3QkFDM0IsT0FBTyxJQUFJLENBQUM7cUJBQ2I7eUJBQU07d0JBQ0wsT0FBTyxLQUFLLENBQUM7cUJBQ2Q7Z0JBQ0gsQ0FBQztnQkFFRCxJQUNFO29CQUNFLFdBQVcsQ0FBQyxjQUFjLEVBQUUsY0FBYyxDQUFDO29CQUMzQyxXQUFXLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQztvQkFDM0MsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUM7aUJBQ2pDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQzVCO29CQUNBLFNBQUcsQ0FBQywrQkFBK0IsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3hELEVBQUUsQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUNuRTtnQkFDRCxPQUFPLGdCQUFTLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEY7b0JBQVM7YUFDVDtTQUNGO0lBQ0gsQ0FBQztDQUFBO0FBRUQsV0FBVyxFQUFFLENBQUMifQ==