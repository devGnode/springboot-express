import * as express from "express";
import {MiddleWare} from "./MiddleWare";
import {List} from "lib-utils-ts/src/Interface";
import {Cookie} from "lib-utils-ts/src/net/Cookie";
/**
 *
*/
export interface ExpressSpringApplicationImpl{
    getApp( ):express.Application
    getMiddleWare( ):MiddleWare
    config( ): ExpressSpringApplicationImpl
    sslProtocol():void
    listen( ):void
}
/****
 *
*/
export interface SpringApplication{
    setLogger(l:any): SpringApplication
    getApp( ):express.Application
    init( pages_directory:string ): SpringApplication
}