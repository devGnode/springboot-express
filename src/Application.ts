import * as express from "express";
import {readdirSync} from "fs";
import {ArrayList} from "lib-utils-ts/src/List";
import {Predication} from "lib-utils-ts/src/Predication";
import * as bodyParser from "body-parser";
import * as https from "https";
import {IPropertiesFile, IPropertiesFileA} from "lib-utils-ts/src/Interface";
import {ExpressSpringApplicationImpl, SpringApplication} from "./Interfaces";
import { Logger} from "logger20js-ts";
import {MiddleWare} from "./MiddleWare";
import "lib-utils-ts/src/globalUtils";
import {AbstractProperties, Properties, PropertiesJson} from "lib-utils-ts/src/file/Properties";
import {RuntimeException} from "lib-utils-ts/src/Exception";
/***
 *
*/
export class Application implements SpringApplication{

    private static readonly INSTANCE: Application = new Application();

    private logger:Logger  = Logger.factory(Application.name);
    private loaded:boolean = false;
    private readonly app: express.Application;

    constructor() {this.app = express();}

    public getApp( ):express.Application{return this.app;}

    public setLogger(logger:any): Application{
        this.logger = logger;
        return this;
    }

    public init( pages_directory:string ): SpringApplication{
        let p0: Predication<string> = new Predication<string>();
        let p1: Predication<string> = new Predication<string>();

        if(this.loaded) return this;
        p1.test = (value)=>value.endsWith(".d.ts");
        p0.test = (value)=>value.endsWith(".ts");

        ArrayList.of(readdirSync(pages_directory))
            .stream()
            .filter(p0.and(p1.negate()))
            .map(value=> value.explodeAsList(".").get(0) )
            .each(value=>{
                try{import(`${pages_directory}/${value}`);}catch (e){
                    throw new RuntimeException(e);
                }
                this.logger.debug(`import : %s page`,String(`${pages_directory}/${value}`).colorize().green);
            });

        this.loaded=true;
        return this;
    }

    public static getInstance():Application{ return Application.INSTANCE; }
}
/****
 *
*/
export abstract class ExpressSpringApp implements ExpressSpringApplicationImpl{

    private readonly applicationWrap: Application = Application.getInstance();
    private static logger:Logger  = Logger.factory(Application.name);

    private prop:AbstractProperties<Object>;
    private propA:Properties;

    protected baseUrl:string = "/v1";
    protected middleWare: MiddleWare;

    constructor( properties: IPropertiesFile<string, Object> = null ) {

       if(properties){
           this.prop = <Properties>properties;
           this.baseUrl = <string>properties.getProperty("baseUrl", null );
       }else{
           // minimal Configuration
           this.prop = new Properties();
           this.prop.setProperty("httpProtocol",true);
           this.prop.setProperty("httpProtocol",false);
           this.prop.setProperty("gateway","gateway");
           this.prop.setProperty("loggerParser ",80);
           this.prop.setProperty("port","[%hours{yellow}] %T{w?yellow;e?red;d?green}/%name - %error");
           this.prop.setProperty("logEnabledColorize",true);
           this.prop.setProperty("saveLog",false);
       }
        this.middleWare = new MiddleWare(this);
    }

    public setBaseUrl( baseUrl:string ): ExpressSpringApp{
        this.baseUrl = baseUrl;
        return this;
    }

    public getBaseUrl( ):string{return String(this.prop.getProperty("gateway", this.baseUrl));}

    public getApp( ):express.Application{return this.applicationWrap.getApp();}

    public getMiddleWare(): MiddleWare { return this.middleWare; }
    /***
     * STEP 0
     */
    public loadProperties( path:string ):ExpressSpringApplicationImpl{
        try{
            if(/json$/.test(path)) this.prop = new PropertiesJson();
            else this.prop = new Properties();
            this.prop.load(ExpressSpringApp.getClass().getResourcesAsStream(path));
        }catch (e) {
            throw new RuntimeException(e);
        }
        return this;
    }
    /***
     * STEP 1
     * Initialize all middleware before initialize initPages methods
     * see MiddleWare Class
     */
    public config(): ExpressSpringApplicationImpl { throw new Error("Not implemented !"); }
    /***
     * STEP 2
     */
    initPages():ExpressSpringApplicationImpl{
        this.applicationWrap.init(String(this.prop.getProperty("pagesDirectory")));
        return this;
    }

    public sslProtocol( ):void{
        if(Boolean.of(this.prop.getProperty("httpsProtocol"))) {
            let port:number = Number(this.prop.getProperty("port", 80)),
                gateway:string = String(this.prop.getProperty("gateway", "0.0.0.0"));
            https.createServer({
                pfx: "",
                passphrase: ""
            }, this.getApp()).listen(
                port, gateway,
                1,
                () => {
                    ExpressSpringApp.logger.info("SSL/TLS server has been started : %s:%s",gateway,port);
                });
        }
    }
    /****
     *  STEP 3
     * EndPoint for launch APP http or https
     */
    public listen( ):void {
      if(Boolean.of(this.prop.getProperty("httpProtocol"))) {
          let port:number = Number(this.prop.getProperty("port", 80)),
            gateway:string = String(this.prop.getProperty("gateway", "0.0.0.0"));
            this.getApp().listen(
                port, gateway,
                () => {
                       ExpressSpringApp.logger.info("server has been started : %s:%s",gateway,port);
                });
      }
      return this.sslProtocol();
    }

}
