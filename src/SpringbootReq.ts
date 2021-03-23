import {flombok} from "lib-utils-ts/src/flombok";
import {List, MapType} from "lib-utils-ts/src/Interface";
import {ArrayList} from "lib-utils-ts/src/List";
import {Cookie} from "lib-utils-ts/src/net/Cookie";
import {SpringbootReqImpl} from "./Interfaces";

export class SpringbootReq implements SpringbootReqImpl{

    @flombok.ENUMERABLE(false, -1 )
    @flombok.GETTER()
    @flombok.SETTER()
    private type:number;

    @flombok.ENUMERABLE(false, new ArrayList<Cookie>())
    @flombok.GETTER()
    @flombok.SETTER()
    private cookie:List<Cookie>;

    @flombok.ENUMERABLE(false )
    @flombok.GETTER()
    @flombok.SETTER()
    private jwtToken:MapType<string, string>;

    public getType:flombok.getNumberFunc;
    public setType:flombok.setNumberFunc;

    public getCookie:flombok.accessorGetFunc<List<Cookie>>
    public setCookie:flombok.accessorSetFunc<List<Cookie>>

    public getJwtToken:flombok.accessorGetFunc<MapType<string, string>>;
    public setJwtToken:flombok.accessorSetFunc<MapType<string, string>>;

}
