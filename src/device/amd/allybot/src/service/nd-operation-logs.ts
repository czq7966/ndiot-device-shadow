import { ABApi } from "../api/ab-api";
import { NDApi } from "../api/nd-api";
import { IABOperationLog } from "../model/ab-operation-log";
import { ABDevices } from "./ab-devices";

export class NDOperationLogs {
    static RecheckAllLogs: boolean = false;
    static devices : {[name: string] : {
        start?: IABOperationLog;
        end?: IABOperationLog 
    }} = {}

    static async refreshTimeStamp() {
        let ids = ABDevices.ids();
        for (let i = 0; i < ids.length; i++) {
            await this.refreshTimeStampByRobotId(ids[i]);
        }
    }

    static async refreshTimeStampByRobotId(robotId: string) {
            let start = await NDApi.getFirstOperationLog(robotId, false) as any || {};
            let end = await NDApi.getFirstOperationLog(robotId, true) as any || {};
            let timestampName = 'datetime_1684113178508_572';
            let minTimestamp = 169157075500;
            
            let startTime;
            let endTime;
            let startTimestamp;
            let endTimestamp;
            if (start && start[timestampName]){
                startTime = start[timestampName];
                startTimestamp = (new Date(startTime)).getTime();
                if (startTimestamp < minTimestamp){
                    startTimestamp = 0;
                }
            }
            if (end && end[timestampName]){
                endTime = end[timestampName];
                endTimestamp = (new Date(endTime)).getTime();
                if (endTimestamp < minTimestamp){
                    endTimestamp = 0;
                }
            }

            if (!startTimestamp) {
                startTimestamp = endTimestamp || 0;
            }
    
            if (!endTimestamp) {
                endTimestamp = startTimestamp || 0;
            }

            
            this.devices[robotId] = {
                start: {timestamp: startTimestamp},
                end: {timestamp: endTimestamp}
            }            

            console.log("NDOperationLogs refresh time stamp： ", ABDevices.items[robotId].model.software.name, 
            startTime, start[timestampName],  endTime, end[timestampName]);


    }

    static async startPushOperationLogs() {
        let ids = ABDevices.ids();
        let promises = [];
        for (let i = 0; i < ids.length; i++) {
            var robotId = ids[i];
            // var robotId = "bc525455edd97380bb8a1eb2c1aac7cf";
            // var robotId = "08d13f563d3b444c719827eabf5fef49";
            
            promises.push(this.startPushOperationLogsByRobotId(robotId));
            // break;
        }        
        await Promise.all(promises);
    }

    static async startPushOperationLogsByRobotId(robotId: string, page: number = 1){
        try {
            if (page == 1 || !this.devices[robotId]) {
                await this.refreshTimeStampByRobotId(robotId);
            }
            let count = await this.pushOperationLogsByPage(robotId, page);
            if (count) {
                await this.startPushOperationLogsByRobotId(robotId, page + 1);            
            }
        } catch (error) {
            console.log(error);
            await this.startPushOperationLogsByRobotId(robotId, page);            
        }

    }

    static async pushOperationLogsByPage(robotId: string, page: number, pageSize = 20){
        let startTime = 0;
        let endTime = 0;
        let device = this.devices[robotId];
        if (device && device.start) {
            startTime = device.start.timestamp;
        }
        if (device && device.end) {
            endTime = device.end.timestamp;
        }
        startTime = startTime ? startTime : 0;
        endTime = endTime ? endTime : 0;
        if (!startTime) {
            startTime = endTime;
        }

        if (!endTime) {
            endTime = startTime;
        }



        var data = await ABApi.deviceOperationlog(robotId, page, pageSize) as any;
        // console.log(data, robotId);
        var logs: IABOperationLog[] = [];
        if (data && data.data){
            logs = data.data as any;
        }

        console.log("pushOperationLogsByPage", "logs.lenght=", logs.length, "startTime=", startTime, "endTime=", endTime);
        var pushLogs = [];
        // for (let i = logs.length - 1; i >= 0; i--) {
        for (let i = 0; i < logs.length; i++) {    
            const log = logs[i];
            log.timestamp =Number.parseInt(log.timestamp as any);
            if (log.timestamp < NDApi.minTimestamp) {
                log.timestamp = log.timestamp * 1000;
            }

            if (log.timestamp > endTime || log.timestamp < startTime){
                pushLogs.push(log);
            } else {
                // console.log(`已推送：robotId=${robotId} , logId=${log.id} , page=${page} , index=${i} , logTime=${log.timestamp}, startTime=${startTime}, endTime=${endTime}`);
            }
        }

        if (pushLogs.length > 0) {
            await NDApi.pushDeviceOperationLogs(robotId, pushLogs);
            console.log(`ND推送机器操作日记: robotId=${robotId} , pushLogs.length=${pushLogs.length} , page=${page} `);
        } else {
            console.log(`ND推送机器操作日记 完成: `, ABDevices.items[robotId].model.software.name);
        }
        // return 0;
        if (this.RecheckAllLogs) {
            return logs.length;
        } else {
            return pushLogs.length;
        }
    }


}