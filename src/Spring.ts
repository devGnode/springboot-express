import {Request, Response} from "express";
import {Application} from "./Application";
import {Define} from "lib-utils-ts/src/Define";
import {Logger} from "logger20js-ts";
import {SpringbootReq} from "./SpringbootReq";

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
     *
     * @param target
     * @param name
     */
    export function getHandler( target:Object ):Object{
        let app:Application = Application.getInstance(),
            handler:Object = null;
        if(!target.getClass().getName().equals("Function")){
            if( !(handler = app.getHandler(target.getClass().getName())) )handler = app.addHandler(target.getClass().newInstance());
            return handler;
        }
        return null;
    }
    /****
     * @userControlHandler : Final Handler
     * @param handler
     * @param level
     * @param target
     */
    export function userControlHandler(handler: Function, level:Spring.AUTH_LEVEL, target: Object = null ){
        return (req: Request, res: Response)=> {
            let spring:SpringbootReq = req["springboot"],
                user: Define<number> = Define.of(spring.getType());

            if ( user.isNull() || ( user.orElse(-1) >  level  && !level.equals(Spring.AUTH_LEVEL.ALL)) ){
                res.status(401).json({ status: "Unauthorized" });
            }else{
                Object.requireNotNull<Object>(handler,"Some bad - Endpoint Handler is null !")
                handler.call(target, req, res );
            }
        }
    }

    export function GetMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL ) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().get(route, Spring.userControlHandler(target[propertyKey], level, Spring.getHandler(target) ) );
        }
    }

    export function PostMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL ) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().post(route, Spring.userControlHandler(target[propertyKey], level,  Spring.getHandler(target) ) );
        }
    }

    export function PutMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().put(route, Spring.userControlHandler(target[propertyKey], level,  Spring.getHandler(target) ) );
        }
    }

    export function DeleteMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL ) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().delete(route, Spring.userControlHandler(target[propertyKey], level, Spring.getHandler(target) ) );
        }
    }

    export function HeadMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL ) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor){
            Application.getInstance().getApp().head(route, Spring.userControlHandler(target[propertyKey], level, Spring.getHandler(target) ) );
        }
    }

    export function Configuration( path:string ){
       return function (constructor: Function){
           Application.getInstance().loadConfiguration(path);
        }
    }

    export function Instance(constructor: Function) {
        // dev Checking
        if(!Application.getInstance().getHandler(constructor.class().getName()))Logger.factory("Spring").warn(`@Sprint.Instance : No instantiated  '${constructor.class().getName()}' class was found ! Are there any endpoint defined ?`);
    }

}