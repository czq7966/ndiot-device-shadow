import * as http from 'http';
import { ABUser } from '../model/ab-user';
export class ABApi {
    static useProxy = false;
    static proxyHost = "127.0.0.1";
    static proxyPort = "8888";
    static host = "116.205.178.152";
    static port = "28080";

    // static username = "13805014893";
    // static passward = "Y3pxMTIzNDU2";
    static username = "zhkj-ceshi";
    static passward = "emhrajEyMzQ1Ng==";
    

    static _getHttpOptions(mothed: string, path: string, dataLen: number): http.RequestOptions{
        let options: http.RequestOptions = {
            host: ABApi.useProxy ? ABApi.proxyHost : ABApi.host,
            port: ABApi.useProxy ? ABApi.proxyPort : ABApi.port,
            path: ABApi.useProxy ? `http://${ABApi.host}:${ABApi.port}${path}` : path,
            method: mothed,
            headers: {
                "Token" : ABUser.model.token + "",
                "Mobile-User-Id" : ABUser.model.openid + "",
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
        let body = `username=${ABApi.username}&password=${ABApi.passward}`;
        let promsie = this._httpRequest(this._getHttpOptions("POST", path, body.length), body);
        promsie.then(data => console.log("AB智绘扫地机器人登录成功"));
        promsie.catch(err => console.log("AB智绘扫地机器人登录失败：", err));
        return promsie; 
    }

    //版本
    static async version() {
        let path = "/fleetapi/about/version";
        let body = `token=${ABUser.model.token}&openid=${ABUser.model.openid}`;
        let promsie = this._httpRequest(this._getHttpOptions("POST", path, body.length), body);
        promsie.then(data => console.log("AB version", data));
        promsie.catch(err => console.log("AB version：", err));
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
        promsie.then(data => console.log("AB msgCnf", data));
        promsie.catch(err => console.log("AB msgCnf", err));
        return promsie;        

    }

    //消息列表
    static async newlist(){
        let path = "/fleetapi/message/newlist";
        let body = `token=${ABUser.model.token}&openid=${ABUser.model.openid}`;
        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB newlist", data));
        promsie.catch(err => console.log("AB newlist", err));
        return promsie;        

    }


    //字典
    static async projects(){
        let path = "/fleetapi/account/projects";
        let body = `token=${ABUser.model.token}&openid=${ABUser.model.openid}`;
        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB projects", data));
        promsie.catch(err => console.log("AB projects", err));
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
        promsie.then(data => console.log("AB deviceList", data));
        promsie.catch(err => console.log("AB deviceList", err));
        return promsie;        

    }

    //设备消息列表 type: 0=系统通知， 1=设备更新，  2=操作日记， 3=异常报警
    static async newDeviceList(type: string){
        let path = "/fleetapi/message/newdevicelist";
        let body = `token=${ABUser.model.token}&type=${type}&openid=${ABUser.model.openid}`;
        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB newdevicelist", data));
        promsie.catch(err => console.log("AB newdevicelist", err));
        return promsie;        

    }

    //机器使用状态
    static async deviceUsestatus(robotId?: string){
        let path = "/fleetapi/device/usestatus";
        let body = `token=${ABUser.model.token}&robotId=${robotId}&openid=${ABUser.model.openid}`;
        let promsie = this._httpRequest(this._getHttpOptions("POST", path, body.length), body);
        promsie.then(data => console.log("AB deviceUsestatus", data));
        promsie.catch(err => console.log("AB deviceUsestatus", err));
        return promsie; 
    }

    //机器使用地图
    static async deviceUsemap(robotId: string){
        let path = "/fleetapi/device/usemap";
        let body = `token=${ABUser.model.token}&id=${robotId}&openid=${ABUser.model.openid}`;
        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB deviceUsemap", data));
        promsie.catch(err => console.log("AB deviceUsemap", err));
        return promsie;        

    }

    //机器操作日记
    static async deviceOperationlog(robotId: string, page: number = 1, pageSize: number = 20){
        let path = "/fleetapi/message/operationlog";
        let body = `token=${ABUser.model.token}&type=0&id=${robotId}&openid=${ABUser.model.openid}&page=${page}&pageSize=${pageSize}`;

        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB获取机器操作日记 成功 "));
        promsie.catch(err => console.log("AB获取机器操作日记 失败", err));
        return promsie; 
    }

    //机器异常报警
    static async deviceWarnlog(robotId: string, page: number = 1, pageSize: number = 20){
        let path = "/fleetapi/message/warnlog";
        let body = `token=${ABUser.model.token}&type=0&id=${robotId}&openid=${ABUser.model.openid}&page=${page}&pageSize=${pageSize}`;

        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB获取机器异常报警 成功 "));
        promsie.catch(err => console.log("AB获取机器异常报警 失败", err));
        return promsie; 
    }

    //机器基础信息
    static async deviceInfo(sn: string){
        let path = "/fleetapi/device/info";
        let body = `token=${ABUser.model.token}&id=${sn}&openid=${ABUser.model.openid}`;

        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB deviceInfo", (data as any).data.software.name));
        promsie.catch(err => console.log("AB deviceInfo", err));
        return promsie; 
    }

    //机器清洁任务
    static async deviceCleanList(robotId: string, page: number = 1){
        let path = "/fleetapi/clean/list";
        let body = `token=${ABUser.model.token}&type=0&id=${robotId}&openid=${ABUser.model.openid}&page=${page}&pageSize=200`;

        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB deviceCleanList", data));
        promsie.catch(err => console.log("AB deviceCleanList", err));
        return promsie; 
    }

    //机器清洁日记列表
    static async deviceCleanLogsList(robotId: string, page: number = 1, pageSize: number = 1){
        console.log(`deviceCleanLogsList robotId=${robotId} , page=${page} , pageSize=${pageSize}`);
        let path = "/fleetapi/clean/logslist";
        let body = `token=${ABUser.model.token}&id=${robotId}&openid=${ABUser.model.openid}&page=${page}&pageSize=${pageSize}`;

        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB机器清洁日记列表 成功"));
        promsie.catch(err => console.log("AB deviceCleanLogsList", err));
        return promsie; 
    }
    
    //机器清洁日记详情
    static async deviceCleanLogsDetail(logId: string){
        let path = "/fleetapi/clean/logsdetail";
        let body = `token=${ABUser.model.token}&id=${logId}&openid=${ABUser.model.openid}`;

        let options = this._getHttpOptions("POST", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB获取机器清洁日记详情 成功"));
        promsie.catch(err => console.log("AB获取机器清洁日记详情 失败", err));
        return promsie; 
    }

    //机器清洁日记报告
    static async deviceTaskReport(reportId: string){
        // http://116.205.178.152:28080 
        let path = `/fleetapi/task/report?reportId=${reportId}`;
        let body = '';

        let options = this._getHttpOptions("GET", path, body.length);
        let promsie = this._httpRequest(options, body);
        promsie.then(data => console.log("AB获取机器清洁日记报告 成功"));
        promsie.catch(err => console.log("AB获取机器清洁日记报告 失败", err));
        return promsie; 
    }

}