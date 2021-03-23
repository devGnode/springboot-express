import * as bodyParser from "body-parser";
import {ExpressSpringApp} from "./Application";
import {Cookie} from "lib-utils-ts/src/net/Cookie";
import {Logger} from "logger20js-ts";
import * as jwt from "jsonwebtoken";
import {NextFunction,Response,Request} from "express";
import {SpringbootReq} from "./SpringbootReq";
import {Define} from "lib-utils-ts/src/Define";
/***
 *
 */
export enum ALGORITHM_JWT_ACCEPTED{
    HS256 = "HS256",
    RS256 = "RS256"
}
/***
 *
 */
export class MiddleWare{

    private app:ExpressSpringApp;

    constructor(app:ExpressSpringApp) {this.app = app; this.autoCall(); }
    /****
     *
     */
    private autoCall():this{
        this.app.getApp().use((req:Request,res:Response,next: NextFunction)=>{
            let user:SpringbootReq = new SpringbootReq();
            user.setType(-1);
            req["springboot"]=user;
            next();
        });
        return this;
    }
    /***
     * -1 or 0xffffffff : Block for all ( need JWT-Token auth for all endPoint )
     * 0 : access all ( all without ALL user can access )
     * @param level
     */
    public setMockDefaultUserAccess( level:number ):this{
        let user:SpringbootReq = new SpringbootReq();
        user.setType(level);
        return this;
    }
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
        this.app.getApp().use((req:Request,res:Response,next: NextFunction)=>{
            let user:SpringbootReq = req["springboot"];
            if( req.headers.cookie.length > 0 ){
                user.setCookie(req.headers
                    .cookie
                    .explodeAsList(";")
                    .stream()
                    .mapTo<Cookie>(value=>Cookie.parse(value))
                    .getList())
                   // .toArray();
            }
            next();
        });
        return this;
    }
    /****
     *
     */
    public jwtAuthorization(
        secret:string|Buffer,
        algorithm:ALGORITHM_JWT_ACCEPTED =ALGORITHM_JWT_ACCEPTED.HS256,
        cookieUser:Cookie = null
    ):this{
        this.app.getApp().use((req:Request,res:Response,next: NextFunction)=>{
            let token:String, spring:SpringbootReq = req["springboot"];

            if( Define.of(cookieUser).isNull() && req.headers.authorization ) token = req.headers.authorization;
            else if( !Define.of(cookieUser).isNull() ){
                token = spring.getCookie()
                    .stream()
                    .filter(cookie=>cookie.getName().trim().equals(<string>cookieUser.getName()))
                    .findFirst()
                    .orElse(new Cookie("empty","empty"))
                    .getValue();
            }
            if(token){
                jwt.verify( token, secret, {algorithm:algorithm}, (error,payload:any)=>{
                    if(error) {return;}
                    spring.setType(payload.access[0].role);
                    spring.setJwtToken(payload);
                });
            }
            next();
        });
        return this;
    }

}