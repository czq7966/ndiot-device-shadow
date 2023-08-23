import * as http from 'http';
import * as https from 'https';
import { resolve } from 'path';
import { NDUser } from '../model/nd-user';

export class NDApi {
    static useProxy = false;
    static proxyHost = "127.0.0.1";
    static proxyPort = "8888";
    static host = "bcs-app-service.sdp.101.com";
    static port = "443";

    static username = "nderp_bearer";
    static passward = "b998e647e1cd2d1987f960ef5aef47c3";

    static sdpAppId = "b4fb92a0-af7f-49c2-b270-8f62afac1133";
    static bcsAppId = "c683f16c236e44c1a35514319f3eaa41";

    static minTimestamp = 169157075500;


    static baseHttpsOptions(mothed: string, path: string, dataLen: number, host?: string): https.RequestOptions{
        host = host == null ? NDApi.host : host;
        let options: https.RequestOptions = {
            host: NDApi.useProxy ? NDApi.proxyHost : host,
            port: NDApi.useProxy ? NDApi.proxyPort : NDApi.port,
            path: NDApi.useProxy ? `https://${host}:${NDApi.port}${path}` : path,
            method: mothed,
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': dataLen,
            }
        } 
        return options;
    }

    static authHttpsOptions(mothed: string, path: string, dataLen?: number, host?: string): https.RequestOptions{
        host = host == null ? NDApi.host : host;
        let options: https.RequestOptions = {
            host: NDApi.useProxy ? NDApi.proxyHost : host,
            port: NDApi.useProxy ? NDApi.proxyPort : NDApi.port,
            path: NDApi.useProxy ? `https://${host}:${NDApi.port}${path}` : path,
            method: mothed,
            headers: {
                'Content-Type': 'application/json',
                'sdp-app-id': this.sdpAppId,
                'bcs-app-id': this.bcsAppId,
                'Authorization': NDUser.getAuthorization()
            } 
        } 
        if (dataLen){
            options.headers['Content-Length'] = dataLen;
        }
        return options;
    }

    static httpsRequest(options: https.RequestOptions, body: string){
        return new Promise((resolve, reject) => {
            let req = https.request(options, (res) => {
                res.setEncoding('utf8');
                let data = "";
                res.on('data', (chunk) => {                    
                    data = data + chunk;
                });
                res.on('end', () => {
                    if (res.statusCode == 200 || res.statusCode == 201){
                        resolve(data)
                    } else {
                        reject(data);
                    }
                });

            })
            if (body) {
                req.write(body,(e)=>{
                    if (e){
                        console.log("httpRequest error:", e);
                    } else {
                        req.end(); 
                    }
                });
            } else {
                req.end(); 
            }   
        })     
    }


    static authHttpOptions(mothed: string, path: string, dataLen?: number, host?: string): https.RequestOptions{
        host = host == null ? NDApi.host : host;
        NDApi.useProxy = true;
        let options: https.RequestOptions = {
            host: NDApi.useProxy ? NDApi.proxyHost : host,
            port: NDApi.useProxy ? NDApi.proxyPort : NDApi.port,
            path: NDApi.useProxy ? `http://${host}${path}` : path,
            method: mothed,
            headers: {
                'Content-Type': 'application/json',
                'sdp-app-id': this.sdpAppId,
                'bcs-app-id': this.bcsAppId,
                'Authorization': NDUser.getAuthorization()
            } 
        } 
        if (dataLen){
            options.headers['Content-Length'] = dataLen;
        }
        return options;
    }
    static httpRequest(options: http.RequestOptions, body: string){
        return new Promise((resolve, reject) => {
            let req = http.request(options, (res) => {
                res.setEncoding('utf8');
                let data = "";
                res.on('data', (chunk) => {                    
                    data = data + chunk;
                });
                res.on('end', () => {
                    if (res.statusCode == 200 || res.statusCode == 201){
                        resolve(data)
                    } else {
                        reject(data);
                    }
                });

            })
            if (body) {
                req.write(body,(e)=>{
                    if (e){
                        console.log("httpRequest error:", e);
                    } else {
                        req.end(); 
                    }
                });
            } else {
                req.end(); 
            }
            
               
        })     
    }

    //登录
    static async login() {
        let host = "aqapi.101.com";
        let path = "/v0.93/bearer_tokens";
        let body = `{"login_name":"${NDApi.username}","password":"${NDApi.passward}"}`;

        let promsie = this.httpsRequest(NDApi.baseHttpsOptions('POST', path, body.length, host), body);

        promsie.then(data => console.log("ND登录成功"));
        promsie.catch(err => console.log("ND登录失败：", err));
        return promsie; 
    }

    // 获取1条清洁日记
    static async getFirstClearLog(robotId: string, desc: boolean = true){
        return new Promise((resolve, reject) => {
            let path = `/v0.1/events/loading/system_loading_es_data_list?suid=860410`;
            let body =`{
                "form_id": "c683f16c236e44c1b436c2e595125888",
                "orderby":"endTime ${desc? 'desc' : 'asc'}",
                "limit":"1",
                "filter": [
                    {
                        "is_operator": false,
                        "key": "input_1689238656468_822",
                        "op": "eq",
                        "value": "${robotId}" 
                    }
                ]
            }`;
            let options = this.authHttpOptions('POST', path);
            
            let promsie = this.httpRequest(options, body);
    
            promsie.then((data: any) => { 
                 data = JSON.parse(data);
                 console.log("获取清洁日记 成功", robotId);
                 let items = data.items as any[];
                 if (items && items.length > 0){
                    resolve(items[0]);
                 } else {
                    resolve(null);
                 }
    
                });
            promsie.catch((err) => { 
                console.log("获取清洁日记 失败：", err);
                reject(err);
            });

        });
        
    }

    // 获取1条异常报警/操作日记
    static async getFirstWarnOrOperatonLog(robotId: string, type: string, desc: boolean = true){
        return new Promise((resolve, reject) => {
            let path = `/v0.1/events/loading/system_loading_es_data_list?suid=860410`;
            let body =`{
                "form_id":"c683f16c236e44c19cdd17c524eb2b55",
                "orderby":"datetime_1684113178508_572 ${desc? 'desc' : 'asc'}",
                "limit":"3",
                    "filter":[
                        {
                              "is_operator": false,
                              "key": "select_1689231840204_448",
                              "op": "eq",
                              "value": "${type}" 
                        },
                        {
                              "is_operator": false,
                              "key": "input_1689231771369_423",
                              "op": "eq",
                              "value": "${robotId}" 
                        }
                    ]
                }`;
            let options = this.authHttpOptions('POST', path);
            
            let promsie = this.httpRequest(options, body);
    
            promsie.then((data: any) => { 
                    data = JSON.parse(data);
                    console.log(`获取1条${type} 成功`, robotId);
                    let items = data.items as any[];
                    if (items && items.length > 0){
                        let timestampName = 'datetime_1684113178508_572';
                        let result;
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            result = item;
                            let timestamp = (new Date(result[timestampName])).getTime();
                             if (timestamp >  this.minTimestamp){
                                break;       
                            }                     
                        }
                        resolve(result);
                    
                    } else {
                    resolve(null);
                    }
    
                });
            promsie.catch((err) => { 
                console.log(`获取1条${type} 失败：`, err);
                reject(err);
            });

        });
        
    }    

    // 获取1条异常报警
    static async getFirstWarnLog(robotId: string, desc: boolean = true){
        return this.getFirstWarnOrOperatonLog(robotId, "机器异常报警", desc);
        return new Promise((resolve, reject) => {
            let path = `/v0.1/events/loading/system_loading_es_data_list?suid=860410`;
            let body =`{
                "form_id":"c683f16c236e44c19cdd17c524eb2b55",
                "orderby":"datetime_1684113178508_572 ${desc? 'desc' : 'asc'}",
                "limit":"3",
                    "filter":[
                        {
                              "is_operator": false,
                              "key": "select_1689231840204_448",
                              "op": "eq",
                              "value": "机器异常报警" 
                        },
                        {
                              "is_operator": false,
                              "key": "input_1689231771369_423",
                              "op": "eq",
                              "value": "${robotId}" 
                        }
                    ]
                }`;
            let options = this.authHttpOptions('POST', path);
            
            let promsie = this.httpRequest(options, body);
    
            promsie.then((data: any) => { 
                    data = JSON.parse(data);
                    console.log("获取1条异常报警 成功", robotId);
                    let items = data.items as any[];
                    if (items && items.length > 0){
                        let timestampName = 'datetime_1684113178508_572';
                        let result;
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            result = item;
                            let timestamp = (new Date(result[timestampName])).getTime();
                             if (timestamp >  this.minTimestamp){
                                break;       
                            }                     
                        }
                        resolve(result);
                    
                    } else {
                    resolve(null);
                    }
    
                });
            promsie.catch((err) => { 
                console.log("获取1条异常报警 失败：", err);
                reject(err);
            });

        });
        
    }

    // 获取1条操作日记
    static async getFirstOperationLog(robotId: string, desc: boolean = true){
        return this.getFirstWarnOrOperatonLog(robotId, "机器操作日记", desc);
        
    }

    //推送设备基础信息
    static pushDeviceBase(data){
        let path = `/v0.1/external_events/operation/c683f16c236e44c183c57335ad1ba894?suid=860410`;
        let body = JSON.stringify(data);
        let options = this.authHttpsOptions('POST', path);
        let promsie = this.httpsRequest(options, body);

        promsie.then(d => console.log("推送设备基础信息 成功: ", data.software.name));
        promsie.catch(err => console.log("推送设备基础信息 失败：", body));
        return promsie; 
    }

    //推送清洁日记信息
    static pushDeviceClearLogs(robotId: String, data: any[]){
        let path = `/v0.1/external_events/operation/c683f16c236e44c198c4980c643825bf?suid=860410`;
        let body = JSON.stringify({id: robotId, data: data});
        let options = this.authHttpOptions('POST', path);
        let promsie = this.httpRequest(options, body);

        promsie.then(d => console.log("ND推送清洁日记信息 成功: ", robotId));
        promsie.catch(err => console.log("ND推送清洁日记信息 失败：", err));
        return promsie; 
    }

    //推送异常报警信息
    static pushDeviceWarnLogs(robotId: String, data: any[]){
        let path = `/v0.1/external_events/operation/c683f16c236e44c1845a011cfbaae5d5?suid=860410`;
        let body = JSON.stringify({id: robotId, data: data});
        let options = this.authHttpOptions('POST', path);
        let promsie = this.httpRequest(options, body);

        promsie.then(d => console.log("ND推送异常报警信息 成功: ", robotId, `length=${data.length}`));
        promsie.catch(err => console.log("ND推送异常报警信息 失败：", err));
        return promsie; 
    }
    //推送操作日记信息
    static pushDeviceOperationLogs(robotId: String, data: any[]){
        let path = `/v0.1/external_events/operation/c683f16c236e44c1ba872a49255b9b5a?suid=860410`;
        let body = JSON.stringify({id: robotId, data: data});
        let options = this.authHttpOptions('POST', path);
        let promsie = this.httpRequest(options, body);

        promsie.then(d => console.log("ND推送操作日记信息 成功: ", robotId));
        promsie.catch(err => console.log("ND推送操作日记信息 失败：", err));
        return promsie; 
    }
}