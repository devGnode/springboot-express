import * as express from "express";
import {readdirSync} from "fs";
import {ArrayList} from "lib-utils-ts/src/List";
import {Predication} from "lib-utils-ts/src/Predication";
import {List} from "lib-utils-ts/src/Interface";
import { SpringApplication} from "./Interfaces";
import { Logger} from "logger20js-ts";
import "lib-utils-ts/src/globalUtils";
import {AbstractProperties, Properties, PropertiesJson} from "lib-utils-ts/src/file/Properties";
import {IOException, RuntimeException} from "lib-utils-ts/src/Exception";
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
    /****
     * @getApp: return an instance of express application
     */
    public getApp( ):express.Application{return this.app;}
    /***
     * @addHandler : Add a new Instance of endpoint pages class.
     * this annotation below, allows to render efficacy the initiation
     * of spingboot. If this annotation is found when it loads all
     * pages, then he will keep this instance in memory. otherwise
     * a new instance will be created more later, so double run of
     * constructor :/
     *
     * @Spring.Instance
     * @param handler
     */
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
    /****
     * @setPreValidation
     *
     * @param constructorName
     */
    public setPreValidation(constructorName:string):void{this.preValidation.add(constructorName);}
    /***
     * @setConfigFileName :
     *
     *
     * @Spring.Configuration( path:string )
     * @param path
     */
    public setConfigFileName( path:string ):void{ this.configFile = path; }
    /****
     * @getConfigFileName
     *
     */
    public getConfigFileName(  ):string{ return this.configFile; }
    /****
     * @getProperties :
     *
     */
    public getProperties( ):Properties{ return this.prop; }
    /****
     * @loadConfiguration :
     *
     * @Throwable RuntimeException
     * @Throwable IOException
     * @Throwable JSONException
     * @Throwable NullPointerException
     * @param path
     */
    public loadConfiguration( path:string ):void{
        if (!path && this.getConfigFileName()) this.loadConfiguration(this.getConfigFileName());
        else {
            try {
                if (/json$/.test(path)) this.prop = new PropertiesJson();
                else this.prop = new Properties();
                this.prop.load(Application.getClass().getResourcesAsStream(path));
                Logger.setPropertiesConfigHandle(this.prop);
                this.logger.debug("Configuration '%s' was been loaded with successful",path.colorize().green);
            } catch (e) {
                throw new RuntimeException(e);
            }
        }
    }
    /***
     * @criticalFeature defect risk : 5/5
     *
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
        throw new IOException(`${path} is not a directory !`);
    }
    /****
     * @criticalFeature defect risk : 5/5
     *
     * @Throwable ClassNotFoundException
     * @Throwable NullPointerException
     * @param pages_directory
     */
    public init( pages_directory:string ): SpringApplication{
        let p0: Predication<string> = new Predication<string>();
        let p1: Predication<string> = new Predication<string>();

        if(this.loaded) return this;
        p1.test = (value)=>value.endsWith(".d.ts");
        p0.test = (value)=>value.endsWith(".ts");

        ArrayList.of(this.tree(pages_directory,/(.js|.map|.d.ts)$/))
            .stream()
            .filter(p0.and(p1.negate()))
            .each(value=>{
                let constructor: Constructor<Object>,
                    msg:string =`@Spring.Instance : static '%s' class was been add with successful`,
                    instance:Object;
                try{
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
                }catch (e){
                    throw new RuntimeException(e);
                }
                this.logger.debug(`import : %s page`,new Path(`${value}`.replace(process.cwd(),"")).toForNamePath().replace(/^\./,"@").colorize().green);
                this.logger.debug(msg,constructor.getName().colorize().green);
            });

        this.loaded=true;
        return this;
    }
    /***
     * @getInstance
     */
    public static getInstance():Application{ return Application.INSTANCE; }
}