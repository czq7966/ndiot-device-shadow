import { Api } from "../api";
import { Channel } from "./channel";

export interface IUserModel {
    username?: string,
    avatar?: string,
    phone?: string,
    nike?: string,
    organ?: string,
    token?: string,
    openid?: string,
    is_admin?: number,
    org?: {
        id?: string,
        name?: string,
    }
}


export class User  {
    static login(): Promise<any> {
        return Api.login().then((data: any) => {
            if (data.code == 200) {
                User.model = data.data;
                Channel.connect();
                Api.version();
                Api.usestatus();
                Api.msgCnf("1", true);    
                Api.newlist();       
                Api.projects();  
                Api.deviceList();

                console.log(User.model);
            } else {
                User.model = {};
            }
            setTimeout(() => {
                
            }, 1 * 1000 * 60 * 60);
        })
    }
    static model: IUserModel = {} ;
}