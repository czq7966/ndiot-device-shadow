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
        let promise =  Api.login().then((data: any) => {
            if (data.code == 200) {
                User.model = data.data;
                // Channel.connect();
                // Api.version();
                // Api.deviceUsestatus("035d02acabe467785967e01747caca90");
                // Api.msgCnf("1", true);    
                // Api.newlist();       
                // Api.projects();  
                // Api.deviceList();
                // Api.deviceCleanList("035d02acabe467785967e01747caca90");
                // Api.deviceCleanLogsList("035d02acabe467785967e01747caca90");

                // console.log(User.model);
            } 
            
        })

        return promise;
    }

    static keepLogin(timeout: number = 1 * 1000 * 60 * 60){
        setTimeout(() => {
            this.login()
            .then(()=>{
                this.keepLogin();
            })
            .catch(()=>{
                this.keepLogin(1 * 1000 * 60 );
            });                
        }, timeout);

    }
    static model: IUserModel = {} ;
}