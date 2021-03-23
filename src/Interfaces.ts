import * as express from "express";
import {MiddleWare} from "./MiddleWare";
import {flombok} from "lib-utils-ts/src/flombok";
import {List, MapType} from "lib-utils-ts/src/Interface";
import {Cookie} from "lib-utils-ts/src/net/Cookie";
/**
 *
*/
export interface ExpressSpringApplicationImpl{
    getApp( ):express.Application
    getMiddleWare( ):MiddleWare
    loadProperties( path:string ):ExpressSpringApplicationImpl
    config( ): ExpressSpringApplicationImpl
    initPages():ExpressSpringApplicationImpl
    sslProtocol():void
    listen( ):void
}
/****
 *
*/
export interface SpringApplication{
    getApp( ):express.Application
    init( pages_directory:string ): SpringApplication
}
/***
 */
export interface SpringbootReqImpl{
    getType:flombok.getNumberFunc;
    setType:flombok.setNumberFunc;
    getCookie:flombok. accessorGetFunc<List<Cookie>>;
    setCookie:flombok. accessorSetFunc<List<Cookie>>;
    getJwtToken:flombok.accessorGetFunc<MapType<string, string>>;
    setJwtToken:flombok.accessorSetFunc<MapType<string, string>>;
}