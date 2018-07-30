"use strict";
/// <reference path="./ExternalTypings.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = (process.env.LogLevel && parseInt(process.env.LogLevel)) || 0;
function Log(msg, level = 1) {
    if (level <= exports.LogLevel) {
        console.log(msg);
    }
}
exports.Log = Log;
Log("Logging level is " + exports.LogLevel, 2);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQ0FBK0M7O0FBRWxDLFFBQUEsUUFBUSxHQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFOUYsU0FBZ0IsR0FBRyxDQUFDLEdBQVEsRUFBRSxRQUFnQixDQUFDO0lBQzdDLElBQUksS0FBSyxJQUFJLGdCQUFRLEVBQUU7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNsQjtBQUNILENBQUM7QUFKRCxrQkFJQztBQUVELEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxnQkFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDIn0=