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
                // TODO: remove --stack-size when jake is fixed
                const runJakets = "npm run jakets:setup && node --stack-size=8000 `which npm` run jakets:build";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdGluc3RhbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0aW5zdGFsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLCtCQUErQjtBQUMvQiwrQkFBNEI7QUFDNUIsaUNBQW1DO0FBRW5DLFNBQWUsV0FBVzs7UUFDeEIsSUFBSSxVQUFVLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDaEUsSUFBSSxVQUFVLEVBQUU7WUFDZCxJQUFJO2dCQUNGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUM3RCxTQUFHLENBQUMsa0NBQWtDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQU1wQixjQUFjLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztnQkFDaEQsTUFBTSxjQUFjLEdBQUcsc0JBQXNCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLFlBQVksQ0FBQztnQkFDekksTUFBTSxjQUFjLEdBQUcsZ0NBQWdDLENBQUM7Z0JBQ3hELCtDQUErQztnQkFDL0MsTUFBTSxTQUFTLEdBQUcsNkVBQTZFLENBQUM7Z0JBRWhHLFNBQVMsV0FBVyxDQUFDLFNBQWdELEVBQUUsS0FBYTtvQkFDbEYsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxFQUFFO3dCQUNoQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDO3dCQUMzQixPQUFPLElBQUksQ0FBQztxQkFDYjt5QkFBTTt3QkFDTCxPQUFPLEtBQUssQ0FBQztxQkFDZDtnQkFDSCxDQUFDO2dCQUVELElBQ0U7b0JBQ0UsV0FBVyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUM7b0JBQzNDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsY0FBYyxDQUFDO29CQUMzQyxXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQztpQkFDakMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDNUI7b0JBQ0EsU0FBRyxDQUFDLCtCQUErQixjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDeEQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ25FO2dCQUNELE9BQU8sZ0JBQVMsQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN0RjtvQkFBUzthQUNUO1NBQ0Y7SUFDSCxDQUFDO0NBQUE7QUFFRCxXQUFXLEVBQUUsQ0FBQyJ9