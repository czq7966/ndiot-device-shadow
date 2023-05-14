import * as http from 'http';
import { User } from './model/user';
export class Api {
    static useProxy = true;
    static proxyHost = "127.0.0.1";
    static proxyPort = "8888";
    static host = "116.205.178.152";
    static port = "28080";

    static username = "13805014893";
    static passward = "Y3pxMTIzNDU2";

    static _getHttpOptions(mothed: string, path: string, dataLen: number): http.RequestOptions{
        let options: http.RequestOptions = {
            host: Api.useProxy ? Api.proxyHost : Api.host,
            port: Api.useProxy ? Api.proxyPort : Api.port,
            path: Api.useProxy ? `http://${Api.host}:${Api.port}${path}` : path,
            method: mothed,
            headers: {
                "Token" : User.model.token + "",
                "Mobile-User-Id" : User.model.openid + "",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': dataLen,
                "X-Api-Version": 131,
                "Language": "zh_CN"
            }
        } 
        return options;
    }
    static _httpRequest(options: http.RequestOptions, body: string){
        return new Promise((resolve, reject) => {
            let req = http.request(options, (res) => {
                res.setEncoding('utf8');
                let data = "";
                res.on('data', (chunk) => {                    
                    data = data + chunk;
                });
                res.on('end', () => {
                    if (res.statusCode == 200){
                        resolve(JSON.parse(data))
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
        let path = "/fleetapi/account/login";
        let body = `username=${Api.username}&password=${Api.passward}`;
        let promsie = this._httpRequest(this._getHttpOptions("POST", path, body.length), body);
        promsie.then(data => console.log("智绘扫地机器人登录成功"));
        promsie.catch(err => console.log("智绘扫地机器人登录失败：", err));
        return promsie; 
    }

    //版本
    static async version() {
        let path = "/fleetapi/about/version";
        let body = `token=${User.model.token}&openid=${User.model.openid}`;
        let promsie = this._httpRequest(this._getHttpOptions("POST", path, body.length), body);
        promsie.then(data => console.log("version", data));
        promsie.catch(err => console.log("version：", err));
        return promsie; 
    }

    //机器使用状态
    static async usestatus(robotId?: string){
        let path = "/fleetapi/device/usestatus";
        let body = `token=${User.model.token}&robotId=${robotId}&openid=${User.model.openid}`;
        let promsie = this._httpRequest(this._getHttpOptions("POST", path, body.length), body);
        promsie.then(data => console.log("usestatus", data));
        promsie.catch(err => console.log("usestatus", err));
        return promsie; 
    }

    static async msgCnf(msgType: string, turnedOn: boolean){
        let path = "/fleetapi/user/msgCnf";
        let msg = {
            msgType: msgType,
            turnedOn: turnedOn
        }
        let body = JSON.stringify(msg);
        let options = this._getHttpOptions("PUT", path, body.length);
        options.headers["Content-Type"] = "application/json; charset=utf-8";
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("msgCnf", data));
        promsie.catch(err => console.log("msgCnf", err));
        return promsie;        

    }

    //消息列表
    static async newlist(){
        let path = "/fleetapi/message/newlist";
        let body = `token=${User.model.token}&openid=${User.model.openid}`;
        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("newlist", data));
        promsie.catch(err => console.log("newlist", err));
        return promsie;        

    }


    //字典
    static async projects(){
        let path = "/fleetapi/account/projects";
        let body = `token=${User.model.token}&openid=${User.model.openid}`;
        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("projects", data));
        promsie.catch(err => console.log("projects", err));
        return promsie;        

    }

    //设备列表
    static async deviceList(){
        let path = "/fleetapi/robot/deviceList";
        let msg = {
            "deviceOnlineStatus":"",
            "deviceType":"",
            "keyword":"",
            "pageNum":"1",
            "pageSize":"200",
            "projectIds":[],
            "useStatus":""}
        let body = JSON.stringify(msg);
        let options = this._getHttpOptions("POST", path, body.length);
        options.headers["Content-Type"] = "application/json; charset=utf-8";
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("deviceList", data));
        promsie.catch(err => console.log("deviceList", err));
        return promsie;        

    }

    //设备消息列表 type: 0=系统通知， 1=设备更新，  2=操作日记， 3=异常报警
    static async newdevicelist(type: string){
        let path = "/fleetapi/message/newdevicelist";
        let body = `token=${User.model.token}&type=${type}&openid=${User.model.openid}`;
        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("newdevicelist", data));
        promsie.catch(err => console.log("newdevicelist", err));
        return promsie;        

    }

    //机器使用地图
    static async usemap(robotId: string){
        let path = "/fleetapi/device/usemap";
        let body = `token=${User.model.token}&id=${robotId}&openid=${User.model.openid}`;
        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("usemap", data));
        promsie.catch(err => console.log("usemap", err));
        return promsie;        

    }

    //机器操作日记
    static async operationlog(robotId: string, page: number){
        let path = "/fleetapi/message/operationlog";
        let body = `token=${User.model.token}&id=${robotId}&openid=${User.model.openid}&page=${page}&pageSize=20`;

        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("operationlog", data));
        promsie.catch(err => console.log("operationlog", err));
        return promsie;        

    }

}