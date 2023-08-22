import { ABApi } from "../api/ab-api";

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


export class ABUser  {
    static login(): Promise<any> {
        let promise =  ABApi.login().then((data: any) => {
            if (data.code == 200) {
                ABUser.model = data.data;
                // Channel.connect();
                // ABApi.version();
                // ABApi.deviceUsestatus("035d02acabe467785967e01747caca90");
                // ABApi.msgCnf("1", true);    
                // ABApi.newlist();       
                // ABApi.projects();  
                // ABApi.deviceList();
                // ABApi.deviceCleanList("035d02acabe467785967e01747caca90");
                // ABApi.deviceCleanLogsList("035d02acabe467785967e01747caca90");

                // console.log(ABUser.model);
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