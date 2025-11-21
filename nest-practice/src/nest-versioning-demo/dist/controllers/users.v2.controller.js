"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersV2Controller = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../services/users.service");
let UsersV2Controller = class UsersV2Controller {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getUsers() {
        return this.usersService.getV2Users();
    }
};
exports.UsersV2Controller = UsersV2Controller;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersV2Controller.prototype, "getUsers", null);
exports.UsersV2Controller = UsersV2Controller = __decorate([
    (0, common_1.Controller)({ path: 'users', version: '2' }),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersV2Controller);
//# sourceMappingURL=users.v2.controller.js.map