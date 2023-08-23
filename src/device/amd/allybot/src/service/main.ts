import { ABApi } from "../api/ab-api";
import { NDApi } from "../api/nd-api";
import { ABChannel, IChannelMessage } from "../model/ab-channel";
import { NDUser } from "../model/nd-user";
import { ABUser } from "../model/ab-user";
import { IABDevice } from "./ab-device";
import { ABDevices } from "./ab-devices";
import { NDDevices } from "./nd-devices";
import { NDDevice } from "../../../nd-device";
import { NDClearLogs } from "./nd-clear-logs";
import { NDWarnLogs } from "./nd-warn-logs";
import { NDOperationLogs } from "./nd-operation-logs";

export class Main{
    // 开始
    static async start(){
        var device = JSON.parse(`{"avatar":"http://116.205.178.152:28080/resource/img/app/robotqingjie.png","type":"清洁机器人","hardware":{"model":"C44P2DV2","size":"503mm(L)x503mm(W)x629mm(H)","weight":"40KG","worktemp":"0°C~40°C","protect":"IP33","power":"240W","battery":"25.6V 36Ah","charge":"直充(3h充满)"},"software":{"id":"2385d511c51f920e0dd94c14955be855","sn":"202251CNY002D0031","name":"智绘科技测试机","protversion":"v2.0.4","autoversion":null,"backendversion":null,"frontendversion":null}}`);
        // return NDApi.pushDeviceBase(device);
        await NDUser.login();
        await ABUser.login();
        NDUser.keepLogin();
        ABUser.keepLogin();


        //消息通道连接
        ABChannel.connect();
        ABChannel.events.on(ABChannel.Events.onMessge,(msg: IChannelMessage)=>{
            //todo 有消息通知
            console.log("有消息通知:", msg);
        })


        // 更新设备基础信息
        await NDDevices.updateDevicesBase();
        this.startPush();

        return;
    }

    static warnLogPushCount: number = 0;
    static clearLogPushCount: number = 0;
    static operationLogPushCount: number = 0;
    static async startPush(nextTimeout: number = 1 * 1000 * 60 * 1){        
        try {
        await NDWarnLogs.startPushWarnLogs();
        console.log("************ 推送完毕: 异常报警信息 *************, 次数：", this.warnLogPushCount++);
        await NDClearLogs.startPushClearLogs();        
        console.log("************ 推送完毕: 清洁日记信息 *************, 次数：", this.clearLogPushCount++);
        await NDOperationLogs.startPushOperationLogs();
        console.log("************ 推送完毕: 操作日记信息 *************, 次数：", this.operationLogPushCount++);

        this.restartPush(nextTimeout);         
            
        } catch (error) {
            console.log(error);
           this.restartPush(nextTimeout);            
        }

    }

    static restartPushHander: any = 0;
    static async restartPush(nextTimeout: number = 1 * 1000 * 60 * 1){ 
        if (this.restartPushHander) { 
            clearTimeout(this.restartPushHander);
        }

        console.log("************ 从", new Date(), '开始, ', nextTimeout / 1000, "秒后，将再次推送 ************");
        this.restartPushHander = setTimeout(()=>{
            this.restartPushHander = 0;
            this.startPush(nextTimeout);
        }, nextTimeout);   
    }


}