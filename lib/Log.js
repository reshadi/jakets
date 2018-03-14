"use strict";
/// <reference path="./ExternalTypings.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = parseInt(process.env.LogLevel) || 0;
function Log(msg, level = 1) {
    if (level <= exports.LogLevel) {
        console.log(msg);
    }
}
exports.Log = Log;
Log("Logging level is " + exports.LogLevel, 2);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQ0FBK0M7O0FBRWxDLFFBQUEsUUFBUSxHQUFXLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUVwRSxhQUFvQixHQUFHLEVBQUUsUUFBZ0IsQ0FBQztJQUN4QyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksZ0JBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixDQUFDO0FBQ0gsQ0FBQztBQUpELGtCQUlDO0FBRUQsR0FBRyxDQUFDLG1CQUFtQixHQUFHLGdCQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMifQ==