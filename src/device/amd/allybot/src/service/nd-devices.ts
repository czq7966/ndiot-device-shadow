import { ABApi } from "../api/ab-api";
import { NDApi } from "../api/nd-api";
import { ABDevices } from "./ab-devices";

export class NDDevices {
    static async updateDevicesBase() {
        console.log("正在获取设备列表......");
        await ABDevices.updateBase();
        var promises = [];
        var devices = Object.values(ABDevices.items);
        console.log("获取设备列表成功，数量：", devices.length);
        
        for (let i = 0; i < devices.length; i++) {
            var device = devices[i];
            await NDApi.pushDeviceBase(device.model);            
        }
    }

    static async pushDevicesCleanLogs(){
        var ids = ABDevices.ids();

        for (let i = 0; i < ids.length; i++) {
            var id = ids[i];
        }
        
        for (let i = 0; i < ids.length; i++) {
            var id = ids[3];
            var data = await ABApi.deviceCleanLogsList(id, 1, 10) as any;
            var logs = data.data as any[];
            // logs.forEach(async (log) => {
            //     var logId = log.id;
            //     // console.log("pushDevicesCleanLogs: ", log);  
            //     var detail = await ABApi.deviceCleanLogsDetail(logId) as any;
            //     console.log("pushDevicesCleanLogs detail: ", detail);
            //     var reportId = detail.data.id;
            //     var report = await ABApi.deviceTaskReport(reportId) as any;
            //     console.log("pushDevicesCleanLogs report: ", report.data);
                
            // });


            
            break;
            
        }
        
        
    }

}

export class NDClearLogs {

}