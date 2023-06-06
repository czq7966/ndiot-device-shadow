import { Api } from "../api";
import { Channel } from "../model/channel";
import { User } from "../model/user";
import { Devices } from "./devices";

export class Main{
    // 开始
    static start(){
        User.login()
        .then(()=>{
            //消息通道连接
            Channel.connect();
            Channel.events.on(Channel.Events.onMessge,()=>{
                //todo 有消息通知
            })

            // 更新设备基础数据
            Devices.updateBase()
            .then(data => {
                console.log("11111122222222", data)

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