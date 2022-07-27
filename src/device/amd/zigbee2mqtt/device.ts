import * as net from 'net'
import * as isUtf8 from "is-utf8";
import { ChildProcess, spawn, SpawnOptions } from "child_process";

import { DeviceBase, DeviceBaseProp } from "../../device-base";
import { Base, IBase, IDeviceBase, IDeviceBaseProp, IDeviceBusEventData } from "../../device.dts";
import { BaseEvent, IBaseEvent } from "../../../common/events";



export interface IZ2MTcpServerEvents extends IBase {
    data: IBaseEvent
    close: IBaseEvent
    listening: IBaseEvent
    error: IBaseEvent
    connect: IBaseEvent    
}


export interface IZ2MTcpServer extends IBase {
    port_start: number;
    port_end: number;
    port: number,
    status: "killed" | "listened" | "connected"
    socket: net.Socket
    server: net.Server
    buffer: Buffer
    events: IZ2MTcpServerEvents
    initServer();
    uninitServer();
    startServer(): Promise<number>;
    stopServer(): Promise<void>;
    initSocket();
    stopSockt();

    start(): Promise<number>;
    stop(): Promise<void>;

}

export interface IZ2MZ2mConfiguration extends IBase {
    mqtt: {
        base_topic: string
        server: string
        user: string
        password: string
    },
    serial: {
        port: string
    },
    frontend: {
        port: number
    }
}

export interface IZ2MZ2mConfigExec {
    cmd: string
    args: string[]
    options: SpawnOptions
}

export interface IZ2MZ2mConfig extends IBase {
    configuration: IZ2MZ2mConfiguration,
    z2mdir: string
    datadir: string
    exec: IZ2MZ2mConfigExec
    datafiles: {[name: string]: string}
    configfile: string
    databasefile: string
    coordinatorfile: string
}

export interface IZ2MZ2mEvents extends IBase {
    data: IBaseEvent
    error: IBaseEvent
    close: IBaseEvent
}

export interface IZ2MZ2m extends IBase {
    config: IZ2MZ2mConfig
    events: IZ2MZ2mEvents
    initConfig(cfg: IZ2MConfig);
    start(): Promise<number>;
    stop(): Promise<void>;
}

export interface IZ2MConfig extends IBase {
    mqtt: {
        base_topic?: string
        server: string
        user: string
        password: string        
    },
    z2m: {
        dir: string
        tcp: {
            port_start: number,
            port_end: number
            port?: number
        }
    },
    device?: IDeviceBaseProp
}

export interface IZ2M extends IBase {
    tcp: IZ2MTcpServer,
    z2m: IZ2MZ2m
    initConfig(cfg: IZ2MConfig)
    start(): Promise<number>;
    stop(): Promise<void>;
}

export interface IZigbee2Mqtt extends IDeviceBase {
    z2m: IZ2M ;
}

export interface IZigbee2MqttConfig extends IBase {
    device: IDeviceBaseProp
    z2m: IZ2MConfig
    datafiles?: string
}

// Class **********************************************************

export class Z2MTcpServerEvents extends Base implements IZ2MTcpServerEvents{
    data: IBaseEvent;
    close: IBaseEvent;
    listening: IBaseEvent;
    connect: IBaseEvent;
    error: IBaseEvent;
    constructor() {
        super();
        this.data = new BaseEvent();
        this.close = new BaseEvent();
        this.listening = new BaseEvent();
        this.error = new BaseEvent();
        this.connect = new BaseEvent();
    }

    destroy() {
        this.connect.destroy();
        this.error.destroy();
        this.listening.destroy();
        this.close.destroy();
        this.data.destroy();
        super.destroy();        
    }

}

export class Z2MTcpServer extends Base implements IZ2MTcpServer {
    socket: net.Socket;
    port_start: number;
    port_end: number;    
    port: number;
    status: "killed" | "listened" | "connected"
    server: net.Server;
    buffer: Buffer;
    events: IZ2MTcpServerEvents;
    constructor() {
        super();
        this.buffer = Buffer.alloc(0);
        this.server = net.createServer();
        this.events = new Z2MTcpServerEvents();
        this.status = "killed";
        this.initServer();
    }

    start(): Promise<number> {
        if (this.status != "killed")
            return Promise.resolve(this.port)
        else 
            return this.startServer();
    }
    stop(): Promise<void> {
        let promise = this.stopServer();
        promise.then(v => this.status = "killed");
        return promise;
    }

    destroy() {
        this.uninitServer();
        this.events.destroy();
        delete this.server;
        delete this.buffer;
        super.destroy();
    }

    initServer() {
        this.server.on("connection", (socket: net.Socket) => {
            this.status = "connected";
            this.stopSockt();
            this.socket = socket;
            this.initSocket();
            this.events.connect.emit(this);
            console.log("Z2MTcpServer " + this.status);
        })

        this.server.on("close", () => {
            this.status = "killed";            
            this.events.close.emit(this);
            console.log("Z2MTcpServer " + this.status);
        })

        this.server.on("error", (err: Error) => {
            if((err as any).code === 'EADDRINUSE' ) {

            } else {
                this.events.error.emit(err);
            }
        })
        this.server.on("listening", () => {
            this.status = "listened";
            this.events.listening.emit(this);
            console.log("Z2MTcpServer " + this.status);
        })        
    }
    uninitServer() {
        this.stopServer();
    }

    _startServer(port: number): Promise<number> {        
        return new Promise<number>((resolve, reject) => {
            let error = (err: Error) => {
                this.server.off("error", error);
                this.server.off("listening", listening);
                if((err as any).code === 'EADDRINUSE' ) {
                    reject("port in use: " + port)
                } else {
                    resolve(port)
                }
            };
            let listening = () => {
                this.server.off("error", error);
                this.server.off("listening", listening);                
                resolve(port)
            }

            this.server.once("error", error);
            this.server.once("listening", listening);    
            this.server.listen(port);
        })        
    }

    startServer(): Promise<number>{
        return new Promise<number>((resolve, reject) => {
            let port = this.port || this.port_start;
            let _start = () => {
                this._startServer(port)
                .then(p => {
                    this.port = p;
                    resolve(p)
                })
                .catch(e => {
                    port += 2;
                    if (port < this.port_end)
                        _start();
                    else {
                        this.port = 0;
                        reject("all port in use, start_port:" + this.port_start + " , end_port:" + this.port_end);
                    }
                })
            }
            _start();            
        });
    }

    stopServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.stopSockt();
                this.server.close();
                delete this.server;        
            }
            resolve();
        })
    }

    initSocket() {
        let socket = this.socket;
        socket.on("data", (data: Buffer) => {
            this.buffer = Buffer.concat([this.buffer, data], this.buffer.length + data.length);

        })
        socket.on("end", () => {            
            this.events.data.emit(this.buffer);
            delete this.buffer;
            this.buffer = Buffer.alloc(0);
        })
        socket.on("timeout", () => {
            socket.end();
        })
        socket.on("error", (err: Error) => {
            this.events.error.emit(err);            
        })
        socket.on("close", (hadError: boolean) => {
            this.status = this.status == "killed" ? this.status : "listened";
            if (socket == this.socket) 
                this.stopSockt();

            this.events.close.emit(this, socket, hadError);
        })
    }

    stopSockt() {
        if (this.socket) {
            this.socket.end();
            this.socket.destroy();
            this.socket.unref();            
        }
        delete this.socket;
    }
}

export class Z2MZ2mConfiguration extends Base implements IZ2MZ2mConfiguration {
    mqtt: { base_topic: string; server: string; user: string; password: string; };
    serial: { port: string; };
    frontend: { port: number; };
    constructor() {
        super();
        this.mqtt = {
            base_topic: "",
            server: "",
            user: "",
            password: ""
        };
        this.serial = {
            port: ""
        };
        this.frontend = {
            port: 0
        }
    };
    destroy() {
        delete this.frontend;
        delete this.serial;
        delete this.mqtt;
        super.destroy();        
    };
}

export class Z2MZ2mConfig extends Base implements IZ2MZ2mConfig {
    configuration: IZ2MZ2mConfiguration;
    z2mdir: string;
    datadir: string;
    exec: IZ2MZ2mConfigExec;
    datafiles: { [name: string]: string; };
    configfile: string;
    databasefile: string;
    coordinatorfile: string;

    constructor() {
        super();
        this.configuration = new Z2MZ2mConfiguration();
        this.z2mdir = "";
        this.datadir = "";
        this.exec = {
            cmd: "",
            args: [],
            options: {stdio: 'inherit'}
        };
        this.datafiles = {};
        this.configfile = "";
        this.databasefile = "";
        this.coordinatorfile = "";

    }    


    destroy() {
        this.configuration.destroy();
        delete this.configuration;
        delete this.z2mdir;
        delete this.datadir;
        delete this.exec;
        delete this.datafiles;
        delete this.configfile;
        delete this.databasefile;
        delete this.coordinatorfile;
        super.destroy();        
    }    
}

export class Z2MZ2mEvents extends Base implements IZ2MZ2mEvents {
    data: IBaseEvent;
    error: IBaseEvent;
    close: IBaseEvent;
    constructor() {
        super();
        this.data = new BaseEvent();
        this.error = new BaseEvent();
        this.close = new BaseEvent();
    }
    destroy(): void {
        this.close.destroy();
        this.error.destroy();
        this.data.destroy();
        super.destroy();
    }
}


export class Z2MZ2m extends Base implements IZ2MZ2m {
    config: IZ2MZ2mConfig;
    events: IZ2MZ2mEvents;
    status: 'starting' | 'running' | 'killed';

    child: ChildProcess
    childPromise: Promise<void>

    constructor() {
        super();
        this.status = "killed";
        this.config = new Z2MZ2mConfig();
        this.events = new Z2MZ2mEvents();
    }    

    destroy() {
        this.stop();
        this.events.destroy();
        this.config.destroy();
        super.destroy();        
    }

    initConfig(cfg: IZ2MConfig) {
        this.config.z2mdir =  cfg.z2m.dir || this.config.z2mdir;
        this.config.datadir = this.config.z2mdir + "/data/" + cfg.device.id;
        this.config.exec.cmd = "node";
        this.config.exec.args = [this.config.z2mdir + "/index.js"];
        this.config.exec.options.cwd = this.config.z2mdir;
        this.config.configfile = "configuration.yaml";
        this.config.databasefile = "database.db";
        this.config.coordinatorfile = "coordinator_backup.json";
        this.config.datafiles[this.config.configfile] = this.config.datadir + "/" + this.config.configfile;
        this.config.datafiles[this.config.databasefile] = this.config.datadir + "/" + this.config.databasefile;
        this.config.datafiles[this.config.coordinatorfile] = this.config.datadir + "/" + this.config.coordinatorfile;
        this.config.configuration.mqtt.base_topic = cfg.device.id;
        this.config.configuration.mqtt.server = cfg.mqtt.server;
        this.config.configuration.mqtt.user = cfg.mqtt.user;
        this.config.configuration.mqtt.password = cfg.mqtt.password;
        this.config.configuration.serial.port = "tcp://127.0.0.1:" + cfg.z2m.tcp.port;
        this.config.configuration.frontend.port = cfg.z2m.tcp.port + 1;
    };

    start(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.stop()
            .then(v => {
                this.childPromise = this.startChild();
            })
        })

        
    }
    stop(): Promise<void> {
        return this.stopChild();
    }    

    startChild(): Promise<void> {
        return new Promise((resolve, reject) => {
            let exec = this.config.exec;
            process.env["ZIGBEE2MQTT_DATA"] = this.config.datadir;
            let child = spawn(exec.cmd, exec.args, exec.options);    
            this.status = "starting";
            // child.stdout.on("data", (data: any) => {
            //     this.status = "running";
            //     let payload;
            //     if (isUtf8(data)) payload = data.toString(); 
            //     else payload = data;
                
            //     this.events.data.emit(payload);
            // })
            // child.stderr.on("data", (data: any) => {
            //     let payload;
            //     if (isUtf8(data)) payload = data.toString(); 
            //     else payload = data;

            //     this.events.data.emit(payload);
            // })
            child.on("error", (err: Error) => {
                console.error("Z2MZ2m error: " + err.message);
                this.status = "killed";
                this.events.error.emit(err);
            })      
            child.on("close", (code, signal) => {
                console.log("Z2MZ2m closed");
                this.status = "killed";
                this.events.close.emit(code, signal);
                reject(code);
            });
            this.child = child; 
        })
    }
    stopChild(): Promise<void> {
        if (this.child && !this.child.killed )
            this.child.kill();
        return new Promise((resolve, reject) => {
            if (this.childPromise) {
                this.childPromise
                .then(v => {
                    resolve();
                })
                .catch((e => {
                    resolve(e)
                }))
            } else {
                resolve();
            }
        })
    }
}

export class Z2MConfig extends Base implements IZ2MConfig {
    mqtt: {base_topic?: string; server: string; user: string; password: string; };
    z2m: { dir: string; tcp: { port_start: number; port_end: number; }; };
    constructor(){
        super();
        this.mqtt = {
            server: "mqtt://127.0.0.1:1883",
            user: "device",
            password: ""
        };
        this.z2m = {
            dir: "/services/zigbee2mqtt",
            tcp: {
                port_start: 18090,
                port_end: 18199
            }
        }
        if (process.platform == "win32")
            this.z2m.dir = "E:/data/zigbee2mqtt";
    }
    destroy(): void {
        delete this.z2m;
        delete this.mqtt;
        super.destroy();
    }
    
}

export class Z2M extends Base implements IZ2M {
    tcp: IZ2MTcpServer;
    z2m: IZ2MZ2m;
    config: IZ2MConfig;
    constructor() {
        super();
        this.tcp = new Z2MTcpServer();
        this.z2m = new Z2MZ2m();
        this.config = new Z2MConfig();
    }
    destroy(): void {
        this.stop()
        .finally( () => {
            this.z2m.destroy();
            this.tcp.destroy();
        })      
        this.config.destroy();
        super.destroy();
    }
    initConfig(cfg: IZ2MConfig) {

        this.config.mqtt.base_topic = cfg.mqtt.base_topic;
        this.config.mqtt.server = cfg.mqtt.server;
        this.config.mqtt.user = cfg.mqtt.user;
        this.config.mqtt.password = cfg.mqtt.password;

        this.config.z2m.dir = cfg.z2m.dir;
        this.config.z2m.tcp.port_start = cfg.z2m.tcp.port_start;
        this.config.z2m.tcp.port_end = cfg.z2m.tcp.port_end;
        this.config.device = cfg.device;

        this.initTcp();
    }
    initTcp() {
        this.tcp.port_start = this.config.z2m.tcp.port_start;
        this.tcp.port_end = this.config.z2m.tcp.port_end;
    }

    start(): Promise<number> {
        this.tcp.port_start = this.config.z2m.tcp.port_start;
        this.tcp.port_end = this.config.z2m.tcp.port_end;
        return new Promise((resolve, reject) => {
            this.tcp.start()
            .then(pTcp =>{
                this.config.z2m.tcp.port = pTcp;
                this.z2m.initConfig(this.config);
                console.log("tcp status:" + this.tcp.status);
                this.z2m.start().then(pFront => resolve(pFront)).catch(e => reject(e));
            })
            .catch(e => {
                reject(e);
            });
        })
    }

    stop(): Promise<any> {
        let promises: Promise<any>[] = [];
        promises.push(this.z2m.stop());
        promises.push(this.tcp.stop());
        return Promise.all(promises);
    }
}

export class Zigbee2MqttConfig extends Base implements IZigbee2MqttConfig {
    device: IDeviceBaseProp
    z2m: IZ2MConfig
    datafiles: string
    constructor() {
        super();
        this.device = new DeviceBaseProp();
        this.z2m = new Z2MConfig();
    }
    destroy(): void {
        this.z2m.destroy();
        delete this.device;
        delete this.z2m;
        delete this.datafiles;
        super.destroy();
    }
}

export class Zigbee2Mqtt extends DeviceBase implements IZigbee2Mqtt {
    z2m: IZ2M;
    config: IZigbee2MqttConfig

    //初始化
    init() {
        this.z2m = new Z2M();
        this.config = new Zigbee2MqttConfig();
        this.initConfig();
        this.getConfig();
        this.z2m.start();
        console.log("Zigbee2Mqtt init");
    }
     
    //反初始化
    uninit() {
        this.config.destroy();
        this.z2m.destroy();
        console.log("Zigbee2Mqtt uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        console.log("Zigbee2Mqtt  on_south_input ");

        //父设备 todo...
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg); 

        //正常 todo...
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        console.log("Zigbee2Mqtt  on_north_input");
        //todo ...
        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        console.log("Zigbee2Mqtt  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  

    //配置输入
    on_config_input(msg: IDeviceBusEventData) {
        console.log("Zigbee2Mqtt  on_child_input");
        this.config = msg.payload as IZigbee2MqttConfig;
    }      

    //私有函数
    initConfig() {
        Object.keys(this.config.device).forEach(key => {
            this.config.device[key] = this[key];
        })       

        this.config.z2m.device = this.config.device;
        this.z2m.initConfig(this.config.z2m)
    }

    getConfig() {
        let msg: IDeviceBusEventData = {
            action: "get",
            payload: this.config
        }
        this.events.config.output.emit(msg)
    }

    setConfig() {
        let msg: IDeviceBusEventData = {
            action: "set",
            payload: this.config
        }
        this.events.config.output.emit(msg)
    }    
}