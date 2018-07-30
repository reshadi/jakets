"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GlobalTask_1 = require("./GlobalTask");
class GlobalTaskNs extends GlobalTask_1.GlobalTask {
    GetName() {
        return this.TaskImplementation.fullName || super.GetName();
    }
}
exports.GlobalTaskNs = GlobalTaskNs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsVGFza05zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiR2xvYmFsVGFza05zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkNBQTBDO0FBRTFDLE1BQWEsWUFBYSxTQUFRLHVCQUFVO0lBQzFDLE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdELENBQUM7Q0FDRjtBQUpELG9DQUlDIn0=