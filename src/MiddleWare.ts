import * as bodyParser from "body-parser";
import {ExpressSpringApp} from "./Application";
import {Cookie} from "lib-utils-ts/src/net/Cookie";
import {ArrayList} from "lib-utils-ts/src/List";
import {List} from "lib-utils-ts/src/Interface";
import {Logger} from "logger20js-ts";
import * as jwt from "jsonwebtoken";

export enum AUTH_JWT{
    JWT_AUTH_COOKIE = 0x00,
    JWT_AUTH_HEADER = 0x02
}

export class MiddleWare{

    private app:ExpressSpringApp;

    constructor(app:ExpressSpringApp) {this.app = app;}

    public jsonBodyParser( ):this{
        /***
         * Middleware
         */
         this.app.getApp().use(bodyParser.urlencoded({ extended: false }));
         this.app.getApp().use(bodyParser.json());
        return this;
    }
    public routeLogger( pattern:string = null ):this{
        /***
         */
        this.app.getApp().use(<any>Logger.expressRouteLoggerMiddleware(pattern));
        return this;
    }
    /****
     *
     */
    public cookieParser():this{
       this.app.getApp().use((req,res,next)=>{
            if( req.headers.cookie.length > 0 ){
                req["spring_boot"] = req.headers
                    .cookie
                    .explodeAsList(";")
                    .stream()
                    .mapTo<Cookie>(value=>Cookie.parse(value))
                    .getList()
                    .toArray();
            }
            next();
        });
        return this;
    }
    /****
     *
     */
    public jwtAuthorization( secret:string, mode:AUTH_JWT = AUTH_JWT.JWT_AUTH_HEADER,  cookieUser:Cookie = null ):this{
        this.app.getApp().use((req,res,next)=>{
            let token:String;
            if( mode === 0x00 && req.headers.authorization ) token = req.headers.authorization;
            else if( mode === 0x02 ){
                let cookie: List<Cookie> = new ArrayList(req["spring_boot"]);
                token = cookie
                    .stream()
                    .filter(cookie=>cookie.getName().equals(String(cookieUser.getName())))
                    .findFirst()
                    .orElse(new Cookie("empty","empty"))
                    .getValue();
            }
            if(token){
                jwt.verify( token, secret,(error,payload:string)=>{
                    if(error) return;
                    req["springboot_jwt_auth"] = payload;
                    this.app.authJwtHasSuccess = true;
                });
            }
            next();
        });
        return this;
    }

}