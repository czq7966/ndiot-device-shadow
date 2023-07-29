import * as http from 'https';
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


    static baseHttpOptions(mothed: string, path: string, dataLen: number, host?: string): http.RequestOptions{
        host = host == null ? NDApi.host : host;
        let options: http.RequestOptions = {
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

    static authHttpOptions(mothed: string, path: string, dataLen: number, host?: string): http.RequestOptions{
        host = host == null ? NDApi.host : host;
        let options: http.RequestOptions = {
            host: NDApi.useProxy ? NDApi.proxyHost : host,
            port: NDApi.useProxy ? NDApi.proxyPort : NDApi.port,
            path: NDApi.useProxy ? `https://${host}:${NDApi.port}${path}` : path,
            method: mothed,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataLen,
                'sdp-app-id': this.sdpAppId,
                'bcs-app-id': this.bcsAppId,
                'Authorization': NDUser.getAuthorization()
            }
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
                req.write(body);
            }
            
            req.end();    
        })     
    }


    //登录
    static async login() {
        let host = "aqapi.101.com";
        let path = "/v0.93/bearer_tokens";
        let body = `{"login_name":"${NDApi.username}","password":"${NDApi.passward}"}`;

        let promsie = this.httpRequest(NDApi.baseHttpOptions('POST', path, body.length, host), body);

        promsie.then(data => console.log("ND登录成功"));
        promsie.catch(err => console.log("ND登录失败：", err));
        return promsie; 
    }

    // 获取清洁日记
    static async getClearLog(){
        let path = `/v0.1/events/loading/system_loading_es_data_list?suid=205122726583`;
        let body =`{
            "form_id": "c683f16c236e44c1b436c2e595125888",
            "filter": [
                {
                    "is_operator": false,
                    "key": "input_1689238656468_822",
                    "op": "eq",
                    "value": "robotid" 
                }
            ]
        }`;
        let options = this.authHttpOptions('POST', path, body.length);
        
        let promsie = this.httpRequest(options, body);

        promsie.then(data => console.log("获取清洁日记 成功"));
        promsie.catch(err => console.log("获取清洁日记 失败：", err));
        return promsie; 
    }



    //推送设备基础信息
    static pushDeviceBase(data){
        let path = `/v0.1/external_events/operation/c683f16c236e44c183c57335ad1ba894?suid=205122726583`;
        let body = JSON.stringify(data);
        let options = this.authHttpOptions('POST', path, body.length);
        
        let promsie = this.httpRequest(options, body);

        promsie.then(data => console.log("推送设备基础信息 成功"));
        promsie.catch(err => console.log("推送设备基础信息 失败：", err));
        return promsie; 
    }
}