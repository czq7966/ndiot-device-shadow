import { ABChannel, IChannelMessage } from "../model/ab-channel";
import { NDUser } from "../model/nd-user";
import { ABUser } from "../model/ab-user";
import { NDDevices } from "./nd-devices";
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


        // 更新设备基础信息
        await NDDevices.updateDevicesBase();
        // this.startPush(0);

        //消息通道连接
        ABChannel.connect();
        ABChannel.events.on(ABChannel.Events.onMessge,(msg: IChannelMessage)=>{
            //todo 有消息通知
            console.log("有消息通知:", new Date().toLocaleString(), msg);
            this.addPushTask();
        })

        ABChannel.events.on(ABChannel.Events.onOpen,(msg: IChannelMessage)=>{
            this.addPushTask();
        })  
        
        ABChannel.events.on(ABChannel.Events.onClose,(msg: IChannelMessage)=>{
            ABChannel.connect();
        }) 

        return;
    }

    static warnLogPushCount: number = 0;
    static clearLogPushCount: number = 0;
    static operationLogPushCount: number = 0;
    static async startPush(nextTimeout: number = 1 * 1000 * 60 * 1){        
        try{
            console.log("************开始推送 *************", new Date().toLocaleString(),);
            try {
                

                await NDWarnLogs.startPushWarnLogs();
                console.log("************ 推送完毕: 异常报警信息 *************, 次数：", this.warnLogPushCount++);
                await NDClearLogs.startPushClearLogs();        
                console.log("************ 推送完毕: 清洁日记信息 *************, 次数：", this.clearLogPushCount++);
                await NDOperationLogs.startPushOperationLogs();
                console.log("************ 推送完毕: 操作日记信息 *************, 次数：", this.operationLogPushCount++);

                this.restartPush(nextTimeout, nextTimeout);         
                
            } catch (error) {
                console.error("推送发生异常：", new Date().toLocaleString(), error);
                this.restartPush(nextTimeout, nextTimeout);            
            }
        }finally{

        }

    }

    static restartPushHander: any = 0;
    static async restartPush(timeout: number = 1 * 1000 * 60 * 1, nextTimeout: number = 1 * 1000 * 60 * 1){ 
        if (!timeout){
            return;
        }

        if (this.restartPushHander) { 
            clearTimeout(this.restartPushHander);
        }

        console.log("************ 从", new Date().toLocaleString(), '开始, ', timeout / 1000, "秒后，将再次推送 ************");
        this.restartPushHander = setTimeout(()=>{
            this.restartPushHander = 0;
            this.startPush(nextTimeout);
        }, timeout);   
    }

    static pushTaskCount = 0;
    static async addPushTask(){
        console.log(`*********当前任务列表数量：${this.pushTaskCount} + 1 **********`);
        if (this.pushTaskCount == 0){
            this.pushTaskCount++;
            // 定时推送
            // this.startPushTaskTimeout();
            //实时推送
            this.startPushTask();
        } else {
            this.pushTaskCount++;
        }
    }

    static startPushTaskTimeoutHandler: any = 0;

    static async startPushTaskTimeout(timeout: number = 1 * 1000 * 60 * 1 ){
        if (this.pushTaskCount > 0){
            if (!this.startPushTaskTimeoutHandler) {
                this.startPushTaskTimeoutHandler = setTimeout(()=>{
                    this.startPushTaskTimeoutHandler = 0;
                    this.startPush(0)
                    .then(d=>{
                        this.pushTaskCount = this.pushTaskCount > 1 ? 1: 0;
                        this.startPushTaskTimeout(timeout);
                    })
                    .catch(e=>{
                        console.error("推送失败：", new Date().toLocaleString(), e);
                        this.pushTaskCount = this.pushTaskCount > 1 ? 1: 0;
                        this.startPushTaskTimeout(timeout);     
                    })
                }, timeout); 

                console.log("************ 从", new Date().toLocaleString(), '开始, ', timeout / 1000, "秒后，将继续推送 ************");
 
            }

        }
    }

    static async startPushTask(){
        if (this.pushTaskCount > 0){
            this.startPush(0)
            .then(d=>{
                this.pushTaskCount = this.pushTaskCount > 1 ? 1: 0;
                this.startPushTask();
            })
            .catch(e=>{
                console.error("推送失败：", new Date().toLocaleString(), e);
                this.pushTaskCount = this.pushTaskCount > 1 ? 1: 0;
                this.startPushTask();     
            })
        }
    }

}