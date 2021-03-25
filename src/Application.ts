import * as express from "express";
import {readdirSync} from "fs";
import {ArrayList} from "lib-utils-ts/src/List";
import {Predication} from "lib-utils-ts/src/Predication";
import * as https from "https";
import {IPropertiesFile, List, MapType} from "lib-utils-ts/src/Interface";
import {ExpressSpringApplicationImpl, SpringApplication} from "./Interfaces";
import { Logger} from "logger20js-ts";
import {MiddleWare} from "./MiddleWare";
import "lib-utils-ts/src/globalUtils";
import {AbstractProperties, Properties, PropertiesJson} from "lib-utils-ts/src/file/Properties";
import {RuntimeException} from "lib-utils-ts/src/Exception";
import {Spring} from "./Spring";
import * as fs from "fs";
import {Define} from "lib-utils-ts/src/Define";
import {Class} from "lib-utils-ts/src/Class";
import {Constructor} from "lib-utils-ts/src/Constructor";
import {Path} from "lib-utils-ts/src/file/Path";
/***
 * Proxy Class
*/
export class Application implements SpringApplication{

    private static readonly INSTANCE: Application = new Application();

    private readonly logger:Logger  = Logger.factory(Application.name);

    private readonly app: express.Application;
    private prop:AbstractProperties<Object>;

    private loaded:boolean = false;
    private configFile:string;

    private handler:List<Object> = new ArrayList();
    private preValidation:List<string> = new ArrayList();

    constructor() {
        Logger.setPattern("[%hours{yellow}] %T{w?yellow;e?red;d?green}/%name - %error");
        Logger.setColorize(true);
        Logger.setSaveLog(false);
        this.app = express();
    }

    public getApp( ):express.Application{return this.app;}

    public addHandler( handler:Object ):Object{
        if(!this.getHandler(handler.getClass().getName())) this.handler.add(handler);
        return handler;
    }
    /****
     *  @getHandler: get instance of Object declared by Spring when it mapping endpoint
     * @param target
     */
    public getHandler( target: string ):Object{
        return this.handler
            .stream()
            .filter(value => value.getClass().getName().equals(target))
            .findFirst()
            .orElse(null);
    }

    public setPreValidation(constructorName:string):void{this.preValidation.add(constructorName);}

    public setConfigFileName( path:string ):void{ this.configFile = path; }

    public getConfigFileName(  ):string{ return this.configFile; }

    public getProperties( ):Properties{ return this.prop; }

    public loadConfiguration( path:string ):void{
        if (!path && this.getConfigFileName()) this.loadConfiguration(this.getConfigFileName());
        else {
            try {
                if (/json$/.test(path)) this.prop = new PropertiesJson();
                else this.prop = new Properties();
                this.prop.load(ExpressSpringApp.getClass().getResourcesAsStream(path));
            } catch (e) {
                throw new RuntimeException(e);
            }
        }
    }
    /***
     * @criticalFeature defect risk : 5/5
     * @param path
     * @param exclude
     * @param deepLimit : explores 50 deeps by subdirectory
     * @param deep
     * @private
     */
    private tree( path:string, exclude: RegExp = null,deepLimit:number = 50, deep:number = 0 ):string[]{
        let out:string[] = [];
        if(fs.lstatSync(path).isDirectory()){
            ArrayList.of<string>(readdirSync(path))
                .stream()
                .each(subPath=>{
                    let isDir:boolean;
                    if((isDir=fs.statSync(`${path}/${subPath}`).isDirectory())&&(deep<deepLimit||deepLimit===-1)){
                        out = out.concat(this.tree(`${path}/${subPath}`,exclude,deepLimit,0));
                        deep++;
                    }else if(!isDir){
                        if(Define.of(exclude).isNull()||!exclude.test(subPath))out.push(`${path}/${subPath}`);
                    }
            });
            return out;
        }
        throw new RuntimeException(`${path} is not a directory !`);
    }
    /****
     * @criticalFeature defect risk : 5/5
     * @param pages_directory
     */
    public init( pages_directory:string ): SpringApplication{
        let p0: Predication<string> = new Predication<string>();
        let p1: Predication<string> = new Predication<string>();

        if(this.loaded) return this;
        p1.test = (value)=>value.endsWith(".d.ts");
        p0.test = (value)=>value.endsWith(".ts");

        if(pages_directory.equals("undefined"))new RuntimeException("No configuration found !");
        ArrayList.of(this.tree(pages_directory,/(.js|.map|.d.ts)$/))
            .stream()
            .filter(p0.and(p1.negate()))
            .each(value=>{
                let constructor: Constructor<Object>,
                    msg:string =`@Spring.Instance : new static '%s' was been add with successful`,
                    instance:Object;
                try{
                    /***
                     * @waitOf ib-util-t-1.3.3-beta fixed
                     */
                    value = value.explodeAsList(/\.\w+$/).get(0);
                    /***
                     * @ClassNotFoundException
                     * @warning use lib-util-ts >= 1.3.3-beta
                     */
                    constructor = Class.forName(new Path(`${value}`));
                    instance = constructor.newInstance();
                    if( !this.preValidation.stream().filter(o=>o.equals(constructor.getName())).findFirst().isEmpty() ){
                        this.preValidation.remove(constructor.getName());
                        this.addHandler(instance);
                        msg=`@Spring.Instance : new instance of '%s' was been created with successful`;
                    }
                    // OLD
                    //import(`${value}`);
                }catch (e){
                    throw new RuntimeException(e);
                }
                this.logger.debug(`import : %s page`,new Path(`${value}`.replace(process.cwd(),"")).toForNamePath().replace(/^\./,"@").colorize().green);
                this.logger.debug(msg,constructor.getName().colorize().green);
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
    private static readonly logger:Logger  = Logger.factory(Application.name);

    private prop:AbstractProperties<Object> = Application.getInstance().getProperties();

    protected baseUrl:string = "/v1";
    protected middleWare: MiddleWare;
    protected mockUserAccess:Spring.AUTH_LEVEL = -1;

    protected constructor( properties: IPropertiesFile<string, Object> = null ) {

       if(properties){
           this.prop = <Properties>properties;
           this.baseUrl = <string>properties.getProperty("baseUrl", null );
       }else if(!this.prop){
           // minimal Configuration
           this.prop = new Properties();
           this.prop.setProperty("httpProtocol", true);
           this.prop.setProperty("httpProtocol", false);
           this.prop.setProperty("gateway", "gateway");
           this.prop.setProperty("loggerParser ", 80);
           this.prop.setProperty("loggerParser", "[%hours{yellow}] %T{w?yellow;e?red;d?green}/%name - %error");
           this.prop.setProperty("logEnabledColorize", true);
           this.prop.setProperty("saveLog", false);
       }
        this.middleWare = new MiddleWare(this);
    }

    public setBaseUrl( baseUrl:string ): ExpressSpringApp{
        this.baseUrl = baseUrl;
        return this;
    }

    public getBaseUrl( ):string{return String(this.prop.getProperty("gateway", this.baseUrl));}

    public setMockDefaultUserAccess( level:Spring.AUTH_LEVEL ):ExpressSpringApplicationImpl {
        this.mockUserAccess = level;
        return this;
    }

    public getMockDefaultUserAccess( ):Spring.AUTH_LEVEL {
        return this.mockUserAccess;
    }

    public getApp( ):express.Application{return this.applicationWrap.getApp();}

    public getMiddleWare(): MiddleWare { return this.middleWare; }
    /***
     * STEP 0
     */
    public loadProperties( path:string ):ExpressSpringApplicationImpl {
        this.applicationWrap.loadConfiguration(path);
        this.prop = this.applicationWrap.getProperties();
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
    public initPages():ExpressSpringApplicationImpl{
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
