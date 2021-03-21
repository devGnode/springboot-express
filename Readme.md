<img src="https://img.shields.io/badge/Git version-Alpha-yellowgreen"/> <img src="https://img.shields.io/github/languages/top/devGnode/springboot-express"/> <img src="https://img.shields.io/badge/Javascript-ES2020-yellow"/> <img src="https://img.shields.io/npm/v/springboot-express"/> <img src="https://img.shields.io/node/v/logger20js-ts"/>

# springboot-express

<img src="https://i.ibb.co/tKdfYNv/libutilstsicon128.png" alt="lib-utils-ts" border="0" />

### Set up

`npm i springboot-express`


### Usage

For use Springboot-express you need to enabled `experimentalDecorators` property in your tsconfig.json as this framework
use the annotations expressions, warning Decorators are a stage 2 proposal for JavaScript and are available as an experimental
feature of TypeScript. Springboot-express use Express framework as environment.

### Configuration file

- config.json

````json
{
  "gateway": "0.0.0.0",
  "httpProtocol": true,
  "httpsProtocol": false,
  "port": 80,
  "sslPort": 443,
  "pagesDirectory": "src/dao/controller/pages"
}
````

Only for these properties, if they are not declared here is their value by default :

- gateway : `0.0.0.0`
- port : `80`
- sslPort : `443`

These parameters are obligatory and essential :

- **pagesDirectory**
- httpProtocol : `boolean`

### Organize Properties Configuration

Best patrice :

- Create your propertiesConfig class as below :

````typescript
import {IPropertiesFile} from "lib-utils-ts";
import {Properties, PropertiesJson} from "lib-utils-ts";

export class PropertiesConfig implements IPropertiesFile<string, Object>{

    private static readonly INSTANCE    = new PropertiesConfig();
    public static readonly CONFIG_FILE = process.cwd()+"/src/config/config.json";

    private config: Properties;

    constructor() {
        try{
            this.config = new PropertiesJson();
            this.config.load(PropertiesConfig.getClass().getResourcesAsStream(process.cwd()+"/src/config/config.json" ));
        }catch (e) {
            console.log(e);
        }
    }

    public  getProperty(key: string, defaultValue?: Object): Object {
        return this.config.getProperty(key,defaultValue);
    }

    public setProperty(key: string, value: Object): void {
       return  this.config.setProperty(key,value);
    }
    
    /* .... more precise .... */
    
    public static getInstance(){return this.INSTANCE;}
}
````
otherwise :

````typescript
import {Properties} from "lib-utils-ts";

try {
    properties: Properties = new PropertiesJson();
    properties.load(PropertiesConfig.getClass().getResourcesAsStream(process.cwd() + "/src/config/config.json"));
} catch (e) {
    console.log(e);
}
export const properties;
````

### Master controller

> public abstract class ExpressSpringApp extends ExpressSpringApplicationImpl

Protected properties :

- `prop: IPropertiesFile<string, Object>`
- `baseUrl:string = "/v1"`
- `middleWare: MiddleWare` 

Methods :

public setBaseUrl( baseUrl:string ): ExpressSpringApp{
this.baseUrl = baseUrl;
return this;
}

- `getBaseUrl( ):string` :
- `getApp( ):express.Application` : Express application handler
- `getMiddleWare(): MiddleWare` : Express middleware
- `config(): ExpressSpringApplicationImpl` : Throwable not implemented should be implemented in your MasterController
- `sslProtocol( ):void`
- `listen( ):void`

If you have somme importation error with `pagesDirectory` properties declare these properties here as below :

````typescript

PropertiesConfig.getInstance().setProperty("pagesDirectory", process.cwd()+"/src/pages" );

export class MasterController extends ExpressSpringApp{

    private static readonly INSTANCE:MasterController = new MasterController();

    constructor() {
        // give your PropertiesConfig class to springboot-express
        super(PropertiesConfig.getInstance());
    }

    public config():MasterController{
        return this;
    }

    public static getInstance( ):MasterController{return PortusController.INSTANCE;}
}
````

Pages :

`````typescript

export class Authentication {

    @Spring.GetMapping("/v1/authentication/firstFactor")
    public static firstFactorConnection(req: Request, res: Response):void{
        
        res.json({ bar: "foo-bar" });
    }

    @Spring.PostMapping("/v1/authentication/twoFactor")
    public static secondFactorConnection(req: Request, res: Response):void{
        
        res.json({ bar: "foo-bar" });
    }

    @Spring.PutMapping("/v1/admin", Spring.AUTH_LEVEL.ADMIN )
    public static secondFactorConnection(req: Request, res: Response):void{

        res.json({ bar: "foo-bar" });
    }

    @Spring.DeleteMapping("/v1/logs", Spring.AUTH_LEVEL.USER )
    public static secondFactorConnection(req: Request, res: Response):void{

        res.json({ bar: "foo-bar" });
    }
    /*....*/
}

`````

Run :

````typescript
MasterController.getInstance().config().listen();
````


## :octocat: From git

``
$ git clone https://github.com/devGnode/springboot-express.git
``
