"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const users_v1_controller_1 = require("./controllers/users.v1.controller");
const users_v2_controller_1 = require("./controllers/users.v2.controller");
const status_controller_1 = require("./controllers/status.controller");
const users_service_1 = require("./services/users.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [users_v1_controller_1.UsersV1Controller, users_v2_controller_1.UsersV2Controller, status_controller_1.StatusController],
        providers: [users_service_1.UsersService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map