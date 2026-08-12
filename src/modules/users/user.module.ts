import { Module } from "@nestjs/common";
import { UserControler } from "./user.controller";
import { UserService } from "./user.service";


@Module({
    imports: [],
    controllers: [UserControler],
    providers: [UserService],
    exports: [UserService]
})

export class UserModule {

}