import {Request, Response} from "express";
import {MapType} from "lib-utils-ts/src/Interface";
import {Application} from "./Application";
import {Define} from "lib-utils-ts/src/Define";
import {UserAuthorization, userAuthorization} from "./Interfaces";

export module Spring{
    /****
     * @AUTH_LEVEL
    */
    export enum AUTH_LEVEL {
        ALL         = 0x00,
        ADMIN       = 0x01,
        OPERATOR    = 0x02,
        SELLER      = 0x04,
        CUSTOMER    = 0x08
    }

    /****
     * @userControlHandler : Final Handler
     * @param handler
     * @param level
     */
    export function userControlHandler(handler: Function, level:Spring.AUTH_LEVEL){
        return (req: Request, res: Response)=> {
            let user: Define<userAuthorization> = Define.of(req["springboot_jwt_auth"]);

            if (( !user.isNull() || !level.equals(user.orElse({type:0xffffffff}).type)) && !level.equals(Spring.AUTH_LEVEL.ALL) ){
                res.status(401).json({ status: "Unauthorized" });
            }else{
                handler.call(null, req, res );
            }
        }
    }

    export function GetMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL ) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().get(route, Spring.userControlHandler(target[propertyKey], level ) );
        }
    }

    export function PostMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL ) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().post(route, Spring.userControlHandler(target[propertyKey], level ) );
        }
    }

    export function PutMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().put(route, Spring.userControlHandler(target[propertyKey], level ) );
        }
    }

    export function DeleteMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL ) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().delete(route, Spring.userControlHandler(target[propertyKey], level ) );
        }
    }

    export function HeadMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL ) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().head(route, Spring.userControlHandler(target[propertyKey], level ) );
        }
    }
}