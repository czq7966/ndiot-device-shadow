import { NDApi } from "../api/nd-api";

export interface INDUserModelToken {
 
}

export interface INDUserModel {
    access_token? : String;
    refresh_token? : String;
    server_time? : String;
    mac_key? : String;
    expires_at? : String;
    mac_algorithm? : String;
    user_id? : String;
}

export class NDUser {
    static login(): Promise<any> {
        let promise =  NDApi.login().then((data: any) => {
            NDUser.model = JSON.parse(data);
        })

        return promise;
    } 

    static model: INDUserModel = {} ;

    static getAuthorization(): string {
        var auth = `Bearer \"${this.model.access_token}\"//token`;
        console.log("222222222222", auth);
        return auth;

    }

}