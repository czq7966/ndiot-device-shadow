import { ABApi } from "../api/ab-api";
import { NDApi } from "../api/nd-api";
import { ABChannel } from "../model/ab-channel";
import { NDUser } from "../model/nd-user";
import { ABUser } from "../model/ab-user";
import { IABDevice } from "./ab-device";
import { ABDevices } from "./ab-devices";
import { NDDevices } from "./nd-devices";
import { NDDevice } from "../../../nd-device";
import { NDClearLogs } from "./nd-clear-logs";
import { NDWarnLogs } from "./nd-warn-logs";

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
        ABChannel.events.on(ABChannel.Events.onMessge,()=>{
            //todo 有消息通知
        })

        // 更新设备基础信息
        await NDDevices.updateDevicesBase();
        // await NDClearLogs.startPushClearLogs();
        await NDWarnLogs.startPushWarnLogs();

        // await NDDevices.pushDevicesCleanLogs();



        return;


        // await Devices.updateBase();


        return NDUser.login().then(()=>{
            NDUser.keepLogin();
            // NDApi.getFirstClearLog();
        });

        return ABUser.login()
        .then(async ()=>{
            //消息通道连接
            ABChannel.connect();
            ABChannel.events.on(ABChannel.Events.onMessge,()=>{
                //todo 有消息通知
            })

            // 更新设备基础数据
            await ABDevices.updateBase()
            .then(data => {
                console.log("11111122222222", data);
                Object.values(data as {}).forEach((device: IABDevice) => {
                    console.log("333333333333", JSON.stringify(device.model));
                })
                // (data as Object)

            });

        })
        .catch(()=>{
            let msg = "登录失败，10秒后重新开始";
            console.log(msg);
            setTimeout(() => {
                this.start();                
            }, 1000 * 10);
        })

    }

}