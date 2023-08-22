import { ABApi } from "../api/ab-api";
import { NDApi } from "../api/nd-api";
import { IABWarnLog } from "../model/ab-warn-log";
import { ABDevices } from "./ab-devices";

export class NDWarnLogs {
    static devices : {[name: string] : {
        start?: IABWarnLog;
        end?: IABWarnLog 
    }} = {}

    static async refreshTimeStamp() {
        let ids = ABDevices.ids();
        for (let i = 0; i < ids.length; i++) {
            await this.refreshTimeStampByRobotId(ids[i]);
        }
    }

    static async refreshTimeStampByRobotId(robotId: string) {
            let start = await NDApi.getFirstWarnLog(robotId, false) as any;
            let end = await NDApi.getFirstWarnLog(robotId, true) as any;
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
            this.devices[robotId] = {
                start: {timestamp: startTimestamp},
                end: {timestamp: endTimestamp}
            }            

            console.log("NDClearLogs refresh endTime： ", ABDevices.items[robotId].model.software.name, 
            startTime, start[timestampName],  endTime, end[timestampName]);


    }

    static async startPushWarnLogs() {
        let ids = ABDevices.ids();
        for (let i = 0; i < ids.length; i++) {
            var robotId = ids[i];
            // var robotId = "bc525455edd97380bb8a1eb2c1aac7cf";
            // var robotId = "08d13f563d3b444c719827eabf5fef49";
            
            this.startPushWarnLogsByRobotId(robotId);
            // break;
        }        
    }

    static async startPushWarnLogsByRobotId(robotId: string, page: number = 1){
        try {
            if (page == 1) {
                await this.refreshTimeStampByRobotId(robotId);
            }
            let count = await this.pushWarnLogsByPage(robotId, page);
            if (count) {
                await this.startPushWarnLogsByRobotId(robotId, page + 1);            
            }
        } catch (error) {
            console.log(error);
            await this.startPushWarnLogsByRobotId(robotId, page);            
        }

    }

    static async pushWarnLogsByPage(robotId: string, page: number, pageSize = 100){
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



        var data = await ABApi.deviceWarnlog(robotId, page, pageSize) as any;
        // console.log(data, robotId);
        var logs: IABWarnLog[] = [];
        if (data && data.data){
            logs = data.data as any;
        }

        console.log("pushWarnLogsByPage", "logs.lenght=", logs.length, "startTime=", startTime, "endTime=", endTime);
        // for (let i = logs.length - 1; i >= 0; i--) {
        for (let i = 0; i < logs.length; i++) {    
            const log = logs[i];
            log.timestamp =Number.parseInt(log.timestamp as any);
            if (log.timestamp < NDApi.minTimestamp) {
                log.timestamp = log.timestamp * 1000;
            }

            if (log.timestamp > endTime || log.timestamp < startTime){
                await NDApi.pushDeviceWarnLogs(robotId, [log]);
                if (log.timestamp >= endTime) {
                    endTime = log.timestamp;
                } else if (log.timestamp <= startTime) {
                    startTime = log.timestamp;
                }

                if (!startTime) {
                    startTime = endTime;
                }

                if (!endTime) {
                    endTime = startTime;
                }

                device.start.timestamp = startTime;
                device.end.timestamp = endTime;
                console.log(`pushWarnLogsByPage: robotId=${robotId} , logId=${log.id} , page=${page} , index=${i}`);
            } else {
                console.log(`已推送：robotId=${robotId} , logId=${log.id} , page=${page} , index=${i} , logTime=${log.timestamp}, startTime=${startTime}, endTime=${endTime}`);
            }
        }
        return logs.length;
    }

    static async pushWarnLogByLogId(robotId: string, logId: string){
        // var detail = (await ABApi.deviceCleanLogsDetail(logId) as any).data as IABWarnLog;
        // var reports = (await ABApi.deviceTaskReport(detail.id) as any).data as IABWarnLog[];
        // if (detail){
        //     if (reports && reports.length > 0 ){
        //         const report = reports[0];
        //         detail.reportImgUrl = report.reportImgUrl;
        //         detail.avatar = report.mapInfo ? report.mapInfo.avatar: null;
        //     }
        //     console.log("pushWarnLogByLogId", robotId, logId);
        //     // await NDApi.pushDeviceWarnLogs(robotId, [detail]);
        // }
    }

}