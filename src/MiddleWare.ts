import * as bodyParser from "body-parser";
import {ExpressSpringApp} from "./Application";

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
}