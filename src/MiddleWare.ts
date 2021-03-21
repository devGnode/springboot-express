import * as bodyParser from "body-parser";
import {ExpressSpringApp} from "./Application";
import {Cookie} from "lib-utils-ts/src/net/Cookie";

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
}