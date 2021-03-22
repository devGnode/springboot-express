import * as express from "express";
import {MiddleWare} from "./MiddleWare";
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
 * User storage user information
 */
export interface UserAuthorization{
    type:number
}
export type userAuthorization = { [key:string]:any } & UserAuthorization

export interface SprintRunner{
    run():void
}