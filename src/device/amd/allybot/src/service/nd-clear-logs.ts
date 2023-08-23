import { ABApi } from "../api/ab-api";
import { NDApi } from "../api/nd-api";
import { IABClearLog, IABClearLogDetail, IABClearLogReport } from "../model/ab-clear-log";
import { ABDevices } from "./ab-devices";

export class NDClearLogs {
    static RecheckAllLogs: boolean = false;
    static devices : {[name: string] : {
        start?: IABClearLogDetail;
        end?: IABClearLogDetail 
    }} = {}

    static async refreshEndTime() {
        let ids = ABDevices.ids();
        for (let i = 0; i < ids.length; i++) {
            await this.refreshEndTimeByRobotId(ids[i]);
        }
    }

    static async refreshEndTimeByRobotId(robotId: string) {

            let start = await NDApi.getFirstClearLog(robotId, false) as any;
            let end = await NDApi.getFirstClearLog(robotId, true) as any;
            
            let startTime;
            let endTime;
            if (start && start.endTime){
                startTime = start.endTime;
                start.endTime = (new Date(startTime)).getTime();
            }
            if (end && end.endTime){
                endTime = end.endTime;
                end.endTime = (new Date(endTime)).getTime();
            }
            this.devices[robotId] = {
                start: start ? start : {},
                end: end ? end : {}
            }            

            console.log("NDClearLogs refresh endTime： ", ABDevices.items[robotId].model.software.name, startTime, endTime);


    }

    static async startPushClearLogs() {
        let ids = ABDevices.ids();
        let promises = [];
        for (let i = 0; i < ids.length; i++) {
            // var robotId = '07e71d123c4ec348fe411425955d72f6';
            var robotId = ids[i];
            promises.push(this.startPushClearLogsByRobotId(robotId));
            // break;
        }        
        await Promise.all(promises);
    }

    static async startPushClearLogsByRobotId(robotId: string, page: number = 1){
        try {
            if (page == 1) {
                await this.refreshEndTimeByRobotId(robotId);
            }
            let count = await this.pushClearLogsByPage(robotId, page);
            if (count) {
                await this.startPushClearLogsByRobotId(robotId, page + 1);            
            }
        } catch (error) {
            console.log(error);
            await this.startPushClearLogsByRobotId(robotId, page);            
        }

    }

    static async pushClearLogsByPage(robotId: string, page: number, pageSize = 100){
        let startTime = 0;
        let endTime = 0;
        let device = this.devices[robotId];
        if (device && device.start) {
            startTime = device.start.endTime;
        }
        if (device && device.end) {
            endTime = device.end.endTime;
        }
        startTime = startTime ? startTime : 0;
        endTime = endTime ? endTime : 0;
        if (!startTime) {
            startTime = endTime;
        }

        if (!endTime) {
            endTime = startTime;
        }


        var data = await ABApi.deviceCleanLogsList(robotId, page, pageSize) as any;
        var logs: IABClearLog[] = [];
        if (data && data.data){
            logs = data.data as any;
        }

        console.log("pushClearLogsByPage", "logs.lenght=", logs.length, "startTime=", startTime, "endTime=", endTime);


        // for (let i = logs.length - 1; i >= 0; i--) {
        for (let i = 0; i < logs.length; i++) {    
            const log = logs[i];
            if (log.endTime > endTime || log.endTime < startTime){
                await this.pushClearLogByLogId(robotId, log.id);
                if (log.endTime >= endTime) {
                    endTime = log.endTime;
                } else if (log.endTime <= startTime) {
                    startTime = log.endTime;
                }

                if (!startTime) {
                    startTime = endTime;
                }

                if (!endTime) {
                    endTime = startTime;
                }

                device.start.endTime = startTime;
                device.end.endTime = endTime;
                console.log(`pushClearLogsByPage: robotId=${robotId} , logId=${log.id} , page=${page} , index=${i}`);
            } else {
                // console.log(`已推送：robotId=${robotId} , logId=${log.id} , page=${page} , index=${i} , logTime=${log.endTime}, startTime=${startTime}, endTime=${endTime}`);
            }
        }
        return logs.length;
    }

    static async pushClearLogByLogId(robotId: string, logId: string){
        var detail = (await ABApi.deviceCleanLogsDetail(logId) as any).data as IABClearLogDetail;
        var reports = (await ABApi.deviceTaskReport(detail.id) as any).data as IABClearLogReport[];
        if (detail){
            if (reports && reports.length > 0 ){
                const report = reports[0];
                detail.reportImgUrl = report.reportImgUrl;
                detail.avatar = report.mapInfo ? report.mapInfo.avatar: null;
            }
            console.log("pushClearLogByLogId", robotId, logId);
            await NDApi.pushDeviceClearLogs(robotId, [detail]);
        }
    }

}