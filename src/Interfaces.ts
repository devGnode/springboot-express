import * as express from "express";
import {MiddleWare} from "./MiddleWare";
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
/***
 * User storage user information
 */
export interface UserAuthorization{
    type:number
}
export type userAuthorization = { [key:string]:any } & UserAuthorization