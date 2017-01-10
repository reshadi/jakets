"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Semver = require("semver");
const Jake = require("./Jake");
const Util = require("./Util");
function GetRemoteRepoInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield Jake.ExecAsync("git remote -v");
        let lines = result.StdOut.split("\n");
        Jake.Log(result.StdOut, 0);
        let remotes = [];
        for (let line of lines) {
            let items = /^([^\s]+)\s+([^\s]+)\s+/.exec(line);
            if (items && items.length > 2) {
                remotes.push({
                    Name: items[1],
                    Url: items[2],
                });
            }
        }
        return remotes;
    });
}
function GetVersionChangeInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield Jake.ExecAsync("git diff HEAD~1 -- package.json");
        const GetVersion = (pattern, str) => {
            let match = pattern.exec(str);
            let version = match && match[1];
            if (version && version[0] !== 'v' && Semver.valid("v" + version)) {
                version = "v" + version;
            }
            return version;
        };
        let prevVersion = GetVersion(/\-\s*"version"\s*:\s*"([^"]*)"/, result.StdOut);
        let currVersion = GetVersion(/\+\s*"version"\s*:\s*"([^"]*)"/, result.StdOut);
        //TODO: optionally, if package.json was not changed, we can use `git diff-tree --name-only -r HEAD~0..n to find which commit has package.json change
        return {
            Current: currVersion,
            Previous: prevVersion,
            Hash: "HEAD"
        };
    });
}
function UpdateVersionRangeTags(runRemoveCmds) {
    return __awaiter(this, void 0, void 0, function* () {
        Jake.Log(Util.LocalDir, 0);
        // "git tag -l"
        let tagInfo;
        try {
            //Since we always have commits in the repo, the other commands wont fail. But the following can fail
            let rawTagInfo = yield Jake.ExecAsync("git show-ref --tags");
            tagInfo = rawTagInfo.StdOut.split("\n");
            Jake.Log(rawTagInfo.StdOut, 0);
        }
        catch (e) {
            tagInfo = [];
        }
        const GitTagPattern = /^([0-9a-z]*) refs\/tags\/(.*)/;
        let version2hash = new Map();
        let versions = [];
        let ranges = [];
        let localCmds = [];
        let remoteCmds = [];
        for (let tagStr of tagInfo) {
            let match = GitTagPattern.exec(tagStr);
            if (match) {
                let [_, hash, version] = match;
                if (Semver.valid(version)) {
                    versions.push(version);
                    version2hash.set(version, hash);
                }
                else if (Semver.validRange(version)) {
                    ranges.push(version);
                    version2hash.set(version, hash);
                }
            }
        }
        let versionChangeInfo = yield GetVersionChangeInfo();
        if (versionChangeInfo.Current && versionChangeInfo.Previous) {
            //Current head is a version change
            if (!version2hash.get(versionChangeInfo.Current)) {
                //We don't have a tag for the current version;
                localCmds.push(`git tag -f ${versionChangeInfo.Current} ${versionChangeInfo.Hash}`);
                versions.push(versionChangeInfo.Current);
                version2hash.set(versionChangeInfo.Current, versionChangeInfo.Hash);
            }
        }
        for (let version of versions) {
            let range;
            for (let r of ranges) {
                if (Semver.satisfies(version, r)) {
                    range = r;
                    break;
                }
            }
            if (!range) {
                range = `v${Semver.major(version)}.x.x`;
                ranges.push(range);
            }
        }
        let remotes = yield GetRemoteRepoInfo();
        let writableRemote; //TODO: can we check each tag in each remote and decide to update or not?
        for (let remote of remotes) {
            if (/^ssh:/.test(remote.Url) //ssh has highest priority
                || (!writableRemote && /^git@/.test(remote.Url))) {
                //SSH has higher priority
                writableRemote = remote.Name;
            }
        }
        writableRemote = writableRemote || "";
        for (let range of ranges) {
            let maxVer = Semver.maxSatisfying(versions, range);
            if (version2hash.get(range) !== version2hash.get(maxVer)) {
                localCmds.push(`git tag -f ${range} ${maxVer}`);
                remoteCmds.push(`git push ${writableRemote} :refs/tags/${range}`);
            }
        }
        Jake.Log([versions, ranges, localCmds, remoteCmds], 0);
        yield Jake.ExecAsyncAll(localCmds);
        if (localCmds.length || remoteCmds.length) {
            remoteCmds.push(`git push ${writableRemote} --tags`);
            console.log("# Call the following commands");
            console.log("# " + remoteCmds.join("\n# "));
        }
        if (runRemoveCmds && remoteCmds.length) {
            yield Jake.ExecAsyncAll(remoteCmds);
        }
        return remoteCmds;
    });
}
desc("update all tags for version and range releases");
task("update_version_range_tags", function (runRemoveCmds) {
    UpdateVersionRangeTags(runRemoveCmds)
        .then(() => this.complete());
}, { async: true });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2l0VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdpdFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0EsaUNBQWlDO0FBRWpDLCtCQUErQjtBQUMvQiwrQkFBK0I7QUFFL0I7O1FBQ0UsSUFBSSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ25ELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUzQixJQUFJLE9BQU8sR0FBcUMsRUFBRSxDQUFDO1FBQ25ELEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxLQUFLLEdBQUcseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pELEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ1gsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2QsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQ2QsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVEOztRQUNFLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBZSxFQUFFLEdBQVc7WUFDOUMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLE9BQU8sR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakUsT0FBTyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUM7WUFDMUIsQ0FBQztZQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDakIsQ0FBQyxDQUFBO1FBQ0QsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLGdDQUFnQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5RSxJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMsZ0NBQWdDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlFLG9KQUFvSjtRQUNwSixNQUFNLENBQUM7WUFDTCxPQUFPLEVBQUUsV0FBVztZQUNwQixRQUFRLEVBQUUsV0FBVztZQUNyQixJQUFJLEVBQUUsTUFBTTtTQUNiLENBQUM7SUFDSixDQUFDO0NBQUE7QUFVRCxnQ0FBc0MsYUFBdUI7O1FBQzNELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixlQUFlO1FBQ2YsSUFBSSxPQUFpQixDQUFDO1FBQ3RCLElBQUksQ0FBQztZQUNILG9HQUFvRztZQUNwRyxJQUFJLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUM3RCxPQUFPLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1gsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFDRCxNQUFNLGFBQWEsR0FBRywrQkFBK0IsQ0FBQztRQUV0RCxJQUFJLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUM3QyxJQUFJLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFDNUIsSUFBSSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzFCLElBQUksU0FBUyxHQUFhLEVBQUUsQ0FBQztRQUM3QixJQUFJLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFFOUIsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFJLEtBQUssR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUMvQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUIsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDdkIsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2xDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNyQixZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxpQkFBaUIsR0FBRyxNQUFNLG9CQUFvQixFQUFFLENBQUM7UUFDckQsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsT0FBTyxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDNUQsa0NBQWtDO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELDhDQUE4QztnQkFDOUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLGlCQUFpQixDQUFDLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRixRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QyxZQUFZLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RSxDQUFDO1FBQ0gsQ0FBQztRQUVELEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxLQUFhLENBQUM7WUFDbEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDckIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO29CQUNWLEtBQUssQ0FBQztnQkFDUixDQUFDO1lBQ0gsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDWCxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckIsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLE9BQU8sR0FBRyxNQUFNLGlCQUFpQixFQUFFLENBQUM7UUFDeEMsSUFBSSxjQUFzQixDQUFDLENBQUMseUVBQXlFO1FBQ3JHLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0IsRUFBRSxDQUFDLENBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsMEJBQTBCO21CQUNoRCxDQUFDLENBQUMsY0FBYyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUNqRCxDQUFDLENBQUMsQ0FBQztnQkFDRCx5QkFBeUI7Z0JBQ3pCLGNBQWMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQy9CLENBQUM7UUFDSCxDQUFDO1FBQ0QsY0FBYyxHQUFHLGNBQWMsSUFBSSxFQUFFLENBQUM7UUFFdEMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRCxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxjQUFjLGVBQWUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNwRSxDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV2RCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFbkMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksY0FBYyxTQUFTLENBQUMsQ0FBQztZQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxhQUFhLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3BCLENBQUM7Q0FBQTtBQUVELElBQUksQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0FBQ3ZELElBQUksQ0FBQywyQkFBMkIsRUFBRSxVQUFVLGFBQXVCO0lBQ2pFLHNCQUFzQixDQUFDLGFBQWEsQ0FBQztTQUNsQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNqQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyJ9