<img src="https://img.shields.io/badge/Git version-Alpha-yellowgreen"/> <img src="https://img.shields.io/github/languages/top/devGnode/springboot-express"/> <img src="https://img.shields.io/badge/Javascript-ES2020-yellow"/> <img src="https://img.shields.io/npm/v/springboot-express"/> <img src="https://img.shields.io/node/v/logger20js-ts"/>

# springboot-express

<img src="https://i.ibb.co/tKdfYNv/libutilstsicon128.png" alt="lib-utils-ts" border="0" />

### Set up

`npm i springboot-express`

## Usage

Springboot-express allows of use express as springboot java but to minima. For use it you need to enabled `experimentalDecorators`
property in your tsconfig.json as this framework use the annotations expressions, and as saying official documentation of typescript.
Decorators are a stage 2 proposal for JavaScript and are available as an experimental feature of TypeScript. Springboot-express use
Express framework as environment.

### Annotation 

- `@Spring.GetMapping( endpoint: string [, authLevel  ] )`
- `@Spring.PostMapping( endpoint: string [, authLevel  ]  )`
- `@Spring.PutMapping( endpoint: string [, authLevel  ]  )`
- `@Spring.DeleteMapping( endpoint: string [, authLevel  ]  )`
- `@Spring.HeadMapping( endpoint: string [, authLevel  ]  )`


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

These parameters are mandatory and essential :

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

- `getBaseUrl( ):string` :
- `getApp( ):express.Application` : Express application handler
- `getMiddleWare(): MiddleWare` : Express middleware
- `config(): ExpressSpringApplicationImpl` : Throwable not implemented should be implemented in your MasterController
- `sslProtocol( ):void`
- `listen( ):void`

If you have somme importation error with `pagesDirectory` properties declare these properties here as below :

> PropertiesConfig.getInstance().setProperty("pagesDirectory", process.cwd()+"/src/pages" );

````typescript

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

### Authorization

Endpoint user authorization :

|  NAME | VALUE |
|:---|:---:|
| ALL | 0x00 |
| ADMIN | 0x01 |
| OPERATOR | 0x02 |
| SELLER | 0x04 |
| CUSTOMER | 0x08 |

- `GetMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL )`
- `PostMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL )`
- `PutMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL) `
- `DeleteMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL )`
- `HeadMapping( route: string, level: Spring.AUTH_LEVEL = Spring.AUTH_LEVEL.ALL )`

### MiddleWare

- `jsonBodyParser( ):this` : body-parser middleware
- `cookieParser` : is not rpm cookie-parser. Home made cookie parser

Define your middleware in your config method from your master class controller

````typescript
public config( ):ExpressSpringApplicationImpl{
    this.getMiddleWare()
        .jsonBodyParser()
        .cookieParser();
    /*....*/
}
````

### Cookie Parsing

Enabled from your middleware config : `cookieParser()`

Get cookie from callback :

- property : spring_boot

> get cookie by this way : req["spring_boot"]

````typescript
    import {List} from "lib-utils-ts/src/Interface";
    import {Cookie} from "lib-utils-ts/src/net/Cookie";
    /*...*/
    /*...*/
    @Spring.GetMapping("/v1/getCookie")
    public static firstFactorConnection(req: Request, res: Response):void{
        let cookie: List<Cookie> = new ArrayList(req["spring_boot"]);

        cookie.stream().each((value:Cookie)=>{
            console.log( value.getName() )
        });
        // getCookie
        cookie.stream()
            .filter(cookie=>cookie.getName().equals("myCookie"))
            .findFirst()
            .orElse(null);
        
        res.send("<html>OK</html>");
    }
    
````

## :octocat: From git

``
$ git clone https://github.com/devGnode/springboot-express.git
``
