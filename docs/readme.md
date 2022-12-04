## 概述
边缘组件是一个设备的影子管理器，nodejs编写，npm库，有如下特点：
1. 通过在云端或边缘端创建设备逻辑对象实例，称之为：影子
2. 模拟设备行为、缓存设备状态等逻辑，
3. 封装共性，统一化、标准化输入输出接口；
4. 动态插件式方式有针对性的实现设备的业务逻辑差异，来减少“重复造轮子”。
5. 已封装为Node-Red组件，用户可直接将它安装在Node-Red工具上，并直接使用

注意：
1. 该组件只是个设备对象管理器和消息分配器，不是服务，不能独立运行，需要宿主服务来创建并运行它
2. 消息的来源和去向需要由宿主服务或插件自行实现，比如：消息通讯方式是MQTT，那服务得自行创建MQTT连接和订阅发布消息。

## 安装：
` npm install node-red-nd-device-shadow `

## 代码引用方式：

* CommonJS (Require)
```
const DeviceManager = require("node-red-nd-device-shadow/device/manager")
const manager = new DeviceManager();


//南向输入调用
manager.events.south.input.emit(msg);

//北向输入调用
manager.events.north.input.emit(msg);

//插件输入调用
manager.events.plugins.input.emit(msg);

//影子输入调用
manager.events.shadows.input.emit(msg);

//南向事件输出监听
manager.events.south.output.on((msg) => {});

//北向事件输出监听
manager.events.north.output.on((msg) => {});

//插件事件输出监听
manager.events.plugins.output.on((msg) => {});

//影子事件输出监听
manager.events.shadows.output.on((msg) => {});
```

* ES6 Modules (Import)

```
import { IDeviceBusEventData } from "node-red-nd-device-shadow/device/device.dts";
import { DeviceManager } from "node-red-nd-device-shadow/device/manager";


let manager = new DeviceManager();


//南向输入调用
manager.events.south.input.emit(msg: IDeviceBusEventData);

//北向输入调用
manager.events.north.input.emit(msg: IDeviceBusEventData);

//插件输入调用
manager.events.plugins.input.emit(msg: IDeviceBusEventData);

//影子输入调用
manager.events.shadows.input.emit(msg: IDeviceBusEventData);

//南向事件输出监听
manager.events.south.output.on((msg: IDeviceBusEventData) => {});

//北向事件输出监听
manager.events.north.output.on((msg: IDeviceBusEventData) => {});

//插件事件输出监听
manager.events.plugins.output.on((msg: IDeviceBusEventData) => {});

//影子事件输出监听
manager.events.shadows.output.on((msg: IDeviceBusEventData) => {});

```

## 插件开发：

```

import { Debuger, DeviceBase } from "node-red-nd-device-shadow/device-base";
import { IDeviceBase, IDeviceBusEventData } from "node-red-nd-device-shadow/device.dts";

export interface IDevice extends IDeviceBase {}

export class Device extends DeviceBase implements IDevice {

    //初始化
    init() {
        Debuger.Debuger.log("Device init");
        //在此做设备自定义初始化
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("Device uninit");
        //在此做设备自定义反初始化
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Device  on_south_input ");

        // todo... 在此做数据解码


        super.on_south_input(msg);  //由上层影子自动转北向输出
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Device  on_north_input");
        //todo ... 在此做数据编码
        super.on_north_input(msg);//由上层影子自动转南向输出
    }        
}

```

### 插件安装：
1. 将编写测试好的插件JS脚本上传至http协议可获取的服务器上
2. 调用 manager.events.plugins.input.emit(msg)将插件id和url传入即可，例子：
```
manager.events.plugins.input.emit({
    action: "reg",
    payload: {
        id: "ND_RFIR_AC_GREE",
        url: "http://betacs.101.com/v0.1/static/preproduction_content_nd_iot_edg/ac/gree.js"
    }
})
```
