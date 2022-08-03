import * as fs from 'fs'
import * as net from 'net'
import * as Mqtt from 'mqtt'
import * as Notify from 'fs.notify'
var isUtf8 = import('is-utf8');
import * as yaml from 'js-yaml'
import { ChildProcess, spawn, SpawnOptions } from "child_process";

import { Debuger, DeviceBase, DeviceBaseAttr } from "../../device-base";
import { Base, IBase, IDeviceBase, IDeviceBaseAttr, IDeviceBusDataPayload, IDeviceBusEventData } from "../../device.dts";
import { BaseEvent, IBaseEvent } from "../../../common/events";
import { UUID } from '../../../common/uuid';



let defaultConfiguration =  {
        homeassistant: false,
        permit_join: false,
        mqtt: {
            base_topic: "{mqtt_base_topic}",
            server: "{mqtt_server}",
            user: "{mqtt_user}",
            password: "{mqtt_password}"
        },
        serial: {
            port: "{serial_port}"
        },
        device_options: {
            legacy: false
        },
        advanced: {
            pan_id: "GENERATE",                                        
            channel: 11,
            network_key: "GENERATE",
            baudrate: 115200,
            homeassistant_legacy_entity_attributes: false,
            legacy_api: false,
            log_level: "debug"
        },
        frontend: {
            port: 0
        }
}

export interface IZ2MTcpServerEvents extends IBase {
    input: {
        data: IBaseEvent
    },
    output: {
        data: IBaseEvent
        close: IBaseEvent
        listening: IBaseEvent
        error: IBaseEvent
        connect: IBaseEvent    
    }
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


export interface IZ2MMqttEvents extends IBase {
    message: IBaseEvent
    publish: IBaseEvent
    connect: IBaseEvent
    reconnect: IBaseEvent
    disconnect: IBaseEvent
}

export interface IZ2MMqttConfig  {
    base_topic: string
    server: string
    user: string
    password: string
}

export interface IZ2MMqtt extends IBase {
    events: IZ2MMqttEvents
    config: IZ2MMqttConfig
    initConfig(cfg: {});   
    connect(cfg?: {})
    disconnect()
    publish(topic: string, payload: any);
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

export interface IZ2MZ2mConfigEvents {
    change: IBaseEvent
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
    events: Z2MZ2mConfigEvents

    fixUp();
    fixDown();
    startWatch();
    stopWatch();
}

export interface IZ2MZ2mEvents extends IBase {
    data: IBaseEvent
    error: IBaseEvent
    close: IBaseEvent
}

export interface IZ2MZ2m extends IBase {
    config: IZ2MZ2mConfig
    events: IZ2MZ2mEvents
    status: 'starting' | 'running' | 'killed';
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
    device?: IDeviceBaseAttr
}

export interface IZ2M extends IBase {
    tcp: IZ2MTcpServer,
    z2m: IZ2MZ2m
    config: IZ2MConfig;
    initConfig(cfg: IZ2MConfig)
    start(): Promise<number>;
    stop(): Promise<void>;
}

export interface IZigbee2Mqtt extends IDeviceBase {
    z2m: IZ2M ;
    config: IZigbee2MqttConfig
    mqtt: IZ2MMqtt
}

export interface IZigbee2MqttConfig extends IBase {
    device: IDeviceBaseAttr
    z2m: IZ2MConfig
    datafiles?: string
}



// Class **********************************************************

export class Z2MTcpServerEvents extends Base implements IZ2MTcpServerEvents{
    input: { data: IBaseEvent; };
    output: { data: IBaseEvent; close: IBaseEvent; listening: IBaseEvent; error: IBaseEvent; connect: IBaseEvent; };

    
    constructor() {
        super();
        this.input = {
            data: new BaseEvent()
        }
        this.output = {
            data: new BaseEvent(),
            close: new BaseEvent(),
            listening: new BaseEvent(),
            error: new BaseEvent(),
            connect: new BaseEvent()
        }
    }


    destroy() {
        this.input.data.destroy();
        this.output.connect.destroy();
        this.output.error.destroy();
        this.output.listening.destroy();
        this.output.close.destroy();
        this.output.data.destroy();
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

    base64RegExp: RegExp = new RegExp('^[A-Za-z0-9+\/=]*$');
    constructor() {
        super();
        this.buffer = Buffer.alloc(0);
        this.server = net.createServer();
        this.events = new Z2MTcpServerEvents();
        this.status = "killed";
        this.initServer();

        this.events.input.data.on((msg) => this.on_input_data(msg));
    }

    destroy() {
        this.uninitServer();
        this.events.destroy();
        delete this.server;
        delete this.buffer;
        super.destroy();
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


    initServer() {
        this.server.on("connection", (socket: net.Socket) => {
            this.status = "connected";
            this.stopSockt();
            this.socket = socket;
            this.initSocket();
            this.events.output.connect.emit(this);
            Debuger.Debuger.log("Z2MTcpServer " + this.status);
        })

        this.server.on("close", () => {
            this.status = "killed";            
            this.events.output.close.emit(this);
            Debuger.Debuger.log("Z2MTcpServer " + this.status);
        })

        this.server.on("error", (err: Error) => {
            if((err as any).code === 'EADDRINUSE' ) {

            } else {
                this.events.output.error.emit(err);
            }
        })
        this.server.on("listening", () => {
            this.status = "listened";
            this.events.output.listening.emit(this);
            Debuger.Debuger.log("Z2MTcpServer " + this.status);
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
                    Debuger.Debuger.log("2222222222222", port, e)
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
            }
            resolve();
        })
    }

    initSocket() {
        let socket = this.socket;
        socket.on("data", (data: Buffer) => {
            // this.buffer = Buffer.concat([this.buffer, data], this.buffer.length + data.length);
            let value = data.toString('base64');
            Debuger.Debuger.log("initSocket data", data);
            this.events.output.data.emit(value);

        })
        socket.on("end", () => {
            Debuger.Debuger.log("initSocket end");
            // let value = this.buffer.toString('base64');
            // this.events.output.data.emit(value);

            // delete this.buffer;
            // this.buffer = Buffer.alloc(0);
        })
        socket.on("timeout", () => {
            socket.end();
        })
        socket.on("error", (err: Error) => {
            this.events.output.error.emit(err);            
        })
        socket.on("close", (hadError: boolean) => {
            this.status = this.status == "killed" ? this.status : "listened";
            if (socket == this.socket) 
                this.stopSockt();

            this.events.output.close.emit(this, socket, hadError);
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

    on_input_data(msg) {
        if (this.socket) {
            if (Buffer.isBuffer(msg)) {
                this.socket.write(msg);
            } else {
                if (typeof msg === "string") {
                    let load = msg.replace(/\s+/g,''); 
                    if (this.base64RegExp.test(load) && (load.length % 4 === 0) ) {
                        this.socket.write(Buffer.from(load,'base64'));
                    }
                    else {
                        this.socket.write(Buffer.from("" + msg));
                    }
                } else {
                    this.socket.write(Buffer.from("" + msg));                    
                }
            }            
        }
    }
}

export class Z2MMqttEvents extends Base implements IZ2MMqttEvents {
    message: IBaseEvent;
    publish: IBaseEvent;
    connect: IBaseEvent;
    reconnect: IBaseEvent;
    disconnect: IBaseEvent;
    constructor() {
        super();
        this.message = new BaseEvent();
        this.publish = new BaseEvent();
        this.connect = new BaseEvent();
        this.reconnect = new BaseEvent();
        this.disconnect = new BaseEvent();
    }

    destroy(): void {
        this.message.destroy();
        this.publish.destroy();
        this.connect.destroy();
        this.reconnect.destroy();
        this.disconnect.destroy();      
        super.destroy();
    }
}

export class Z2MMqtt extends Base implements IZ2MMqtt {
    events: IZ2MMqttEvents;
    config: IZ2MMqttConfig;
    mqtt: Mqtt.Client;
    constructor() {
        super();
        this.events = new Z2MMqttEvents();
        this.config = {
            base_topic: "",
            server: "",
            user: "",
            password: ""
        };
    }
    publish(topic: string, payload: any) {
        if (this.mqtt.connected) {
            if (payload === null || payload === undefined) {
                payload = "";
            } else if (!Buffer.isBuffer(payload)) {
                if (typeof payload === "object") {
                    payload = JSON.stringify(payload);
                } else if (typeof payload !== "string") {
                    payload = "" + payload;
                }
            }

            this.mqtt.publish(this.config.base_topic + "/" + topic, payload, {qos: 2, retain: false});
        }
    }

    destroy(): void {
        this.disconnect();
        delete this.config;
        this.events.destroy();
        super.destroy();
    }

    initConfig(cfg: {}) {
        if (cfg) {        
            Object.keys(this.config).forEach(key => {
                this.config[key] = cfg[key];
            })
        }
    }

    initOptions(ops: Mqtt.IClientOptions) {
        ops.keepalive = 60
        ops.clientId = UUID.Guid();
        ops.clean = true;
        ops.reconnectPeriod = 5000;
        ops.connectTimeout = 30 * 1000;
        ops.username = this.config.user;
        ops.password = this.config.password;
    }

    connect(cfg?: {}){
        if (this.mqtt && this.mqtt.connected)
            return;
        this.initConfig(cfg);
        let ops: Mqtt.IClientOptions = {};
        this.initOptions(ops);
        this.mqtt = Mqtt.connect(this.config.server, ops);
        this.mqtt.on("connect", (packet: Mqtt.IConnackPacket) => {
            this.mqtt.subscribe(this.config.base_topic+"/#", {qos: 2});
            this.events.connect.emit(packet);
        })

        this.mqtt.on("reconnect", () => {
            this.events.reconnect.emit();
        })

        this.mqtt.on("disconnect", (packet: Mqtt.IDisconnectPacket) => {
            this.events.disconnect.emit(packet);
        })

        this.mqtt.on("close", () => {
            this.events.disconnect.emit();
        })

        this.mqtt.on("message", (topic: string, payload: Buffer, packet: Mqtt.IPublishPacket) => {
            this.events.message.emit(topic, payload, packet);
        })

    }
    disconnect() {
        if (this.mqtt) {
            this.mqtt.removeAllListeners();
            this.mqtt.end(true);
        }
        delete this.mqtt;
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

export class Z2MZ2mConfigEvents extends Base implements IZ2MZ2mConfigEvents {
    change: IBaseEvent;
    constructor() {
        super();
        this.change = new BaseEvent();
    }
    destroy(): void {
        this.change.destroy();
        super.destroy();
    }
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
    events: Z2MZ2mConfigEvents

    notifications: Notify;

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
        this.events = new Z2MZ2mConfigEvents();
    }    


    destroy() {
        this.stopWatch();
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

    fixUp() {        
        this.load();
        this.fixUpConfig();
    };

    fixUpConfig() {
        let configYaml = this.datafiles[this.configfile] || yaml.dump(defaultConfiguration);
        let config = yaml.load(configYaml) as IZ2MZ2mConfiguration;
        config.mqtt = this.configuration.mqtt;
        config.serial = this.configuration.serial;
        config.frontend = this.configuration.frontend;
        configYaml = yaml.dump(config);
        this.datafiles[this.configfile] = configYaml;
    }

    fixDown() {
        this.stopWatch();        
        this.fixUpConfig();
        this.save();
        this.startWatch();
    };

    load() {        
        Object.keys(this.datafiles).forEach(key => {
            if (key) {
                let fn = this.datadir + "/" + key;
                if (fs.existsSync(fn)) {
                    let file = fs.openSync(fn, "r");
                    if (file > 0) {
                        let buf = fs.readFileSync(file);
                        if (buf)
                            this.datafiles[key] = buf.toString();
                        fs.closeSync(file);                    
                        Debuger.Debuger.log("Z2MZ2mConfig load: ", fn, this.datafiles[key])
                    }            
                }
            } else {
                delete this.datafiles[key];
            }
        })
    }

    save() {
        fs.mkdirSync(this.datadir, {recursive: true});
        Object.keys(this.datafiles).forEach(key => {
            let value = this.datafiles[key];
            let fn = this.datadir + "/" + key;
            let file = fs.openSync(fn, "w");        
            fs.writeFileSync(file, value);
            fs.closeSync(file);
        })
    }

    startWatch() {
        this.stopWatch();
        let files = [];
        Object.keys(this.datafiles).forEach(key => {
            files.push(this.datadir + "/" + key)
        })

        this.notifications = new Notify(files);        
        this.notifications.on('change', (file, event, fpath) => {            
            Debuger.Debuger.log("file change: ", file, event, fpath);
            this.events.change.emit(file, event, fpath)
        })
    }

    stopWatch() {
        if (this.notifications)
            this.notifications.close();
        delete this.notifications;
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
        this.config.datafiles[this.config.configfile] = "";
        this.config.datafiles[this.config.databasefile] = "";
        this.config.datafiles[this.config.coordinatorfile] = "";
        this.config.configuration.mqtt.base_topic = cfg.device.id;
        this.config.configuration.mqtt.server = cfg.mqtt.server;
        this.config.configuration.mqtt.user = cfg.mqtt.user;
        this.config.configuration.mqtt.password = cfg.mqtt.password;
        this.config.configuration.serial.port = "tcp://127.0.0.1:" + cfg.z2m.tcp.port;
        this.config.configuration.frontend.port = cfg.z2m.tcp.port + 1;
        this.config.fixUp();
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
            this.config.fixDown();
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
                Debuger.Debuger.error("Z2MZ2m error: " + err.message);
                this.status = "killed";
                this.events.error.emit(err);
            })      
            child.on("close", (code, signal) => {
                Debuger.Debuger.log("Z2MZ2m closed");
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
                Debuger.Debuger.log("tcp status:" + this.tcp.status);
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
    device: IDeviceBaseAttr
    z2m: IZ2MConfig
    datafiles: string
    constructor() {
        super();
        this.device = new DeviceBaseAttr();
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
    mqtt: IZ2MMqtt;    
    config: IZigbee2MqttConfig

    
    //初始化
    init() {
        this.z2m = new Z2M();
        this.mqtt = new Z2MMqtt();
        this.config = new Zigbee2MqttConfig();

        this.z2m.tcp.events.output.data.on((msg) => {this.on_z2m_tcp_output_data(msg);})
        this.z2m.z2m.events.close.on((msg) => {this.on_z2m_z2m_close(msg);})

        this.initConfig();
        this.initMqtt();
        this.mqtt.connect();
        // this.z2m.start();
        setTimeout(() => this.getConfig());
        Debuger.Debuger.log("Zigbee2Mqtt init");
    }
     
    //反初始化
    uninit() {
        this.z2m.stop()
        .finally(() => {
            this.z2m.destroy();
        })

        this.config.destroy();
        this.mqtt.destroy();
        Debuger.Debuger.log("Zigbee2Mqtt uninit");
     }

    //南向输入 
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Zigbee2Mqtt  on_south_input ");

        let payload: IDeviceBusDataPayload = msg.payload;
        let entry = payload.hd.entry;
        //透传
        if (entry.type == "evt" && entry.id == "penet") 
            // -> Tcp输入
            this.do_z2m_tcp_input_data(msg);
        else if (entry.type == "svc" && entry.id == "handshake" && payload.hd.stp == 0) 
            // ->握手请求
            this.on_handshake_req(msg);
        else 
            // -> 父类转北向输出
            super.on_south_input(msg);
        
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Zigbee2Mqtt  on_north_input");
        this.on_mqtt_north_input(msg);

    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Zigbee2Mqtt  on_child_input", msg.id, msg.payload);
        let pPayload = msg.payload as IDeviceBusDataPayload;
        let _msg: IDeviceBusEventData = {
            topic: msg.id + "/" + pPayload.hd.entry.id,
            payload: pPayload.pld
        }
        this.on_mqtt_south_output(_msg);
    }  

    //配置输入
    on_config_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Zigbee2Mqtt  on_config_input");
        if (msg.action == "get_res") {
            this.on_config_get_response(msg);
        }

    }      

    //私有函数
    initConfig() {
        this.config.device = Object.assign({}, this.attrs);
        this.config.z2m.device = this.config.device;
        this.config.z2m.mqtt.base_topic = this.attrs.id;
        this.z2m.initConfig(this.config.z2m);
        this.z2m.z2m.config.events.change.on((file, event, fpath) => {
            this.on_z2m_z2m_config_events_change(file, event, fpath);
        })
    }

    initMqtt() {
        this.mqtt.initConfig(this.z2m.config.mqtt);
        this.mqtt.events.connect.on((p) => {this.on_mqtt_events_connect(p)})
        this.mqtt.events.reconnect.on(() => {this.on_mqtt_events_reconnect()})
        this.mqtt.events.disconnect.on((p) => {this.on_mqtt_events_disconnect(p)})
        this.mqtt.events.message.on((topic, payload, packet) => {this.on_mqtt_events_message(topic, payload, packet)})

    }

//配置文件相关    
    getConfig() {
        let msg: IDeviceBusEventData = {
            action: "get",
        }
        this.events.config.output.emit(msg);
    }
    on_config_get_response(msg: IDeviceBusEventData) {
        if (msg.payload) {
            let payload = msg.payload as IZigbee2MqttConfig;
            if(payload && payload.datafiles) {
                this.config.datafiles = payload.datafiles;
                let datafiles = JSON.parse(payload.datafiles);
                Object.keys(datafiles).forEach(key => {
                    this.z2m.z2m.config.datafiles[key] = datafiles[key];
                })
                
            }
        }

        this.do_handshake_req();
    }    

    setConfig() {
        this.z2m.z2m.config.fixUp();
        let msg: IDeviceBusEventData = {
            action: "set",
            payload: {
                datafiles: JSON.stringify(this.z2m.z2m.config.datafiles)
            }
        }
        this.events.config.output.emit(msg)
    }    

    _on_z2m_z2m_config_events_change_handler: any;
    on_z2m_z2m_config_events_change(file, event, fpath) {
        clearTimeout(this._on_z2m_z2m_config_events_change_handler);
        this._on_z2m_z2m_config_events_change_handler = setTimeout(() => {
            clearTimeout(this._on_z2m_z2m_config_events_change_handler);
            this.setConfig();            
        }, 10000);


    }

    do_handshake_req() {
        //todo 超时逻辑
        Debuger.Debuger.log("Zigbee2Mqtt" ,"reqHandshake");
        let payload: IDeviceBusDataPayload = {
            hd: {
                entry: {
                    type: "svc",
                    id: "handshake"
                }
            }
        }
        let msg: IDeviceBusEventData = {
            payload: payload
        }
        this.events.south.output.emit(msg);        
    }

    //握手响应
    do_handshake_resp(reqMsg: IDeviceBusEventData) {
        let reqPld = reqMsg.payload as IDeviceBusDataPayload;
        let respPld: IDeviceBusDataPayload  = {
            hd: {
                entry: reqPld.hd.entry,
                sid: reqPld.hd.sid,
                stp: 1
            }
        }
        let msg: IDeviceBusEventData = {
            payload: respPld
        }
        this.events.south.output.emit(msg);      
    }

    // 握手请求
    on_handshake_req(msg: IDeviceBusEventData) {        
        this.do_handshake_resp(msg);   
        let payload = msg.payload as IDeviceBusDataPayload;
        if (payload.pld.handshake_count === 0 || this.z2m.z2m.status == "killed") {
            this.z2m.stop()
            .finally(() => {
                this.z2m.start();
            })
        }        
    }

    //Tcp输入
    do_z2m_tcp_input_data(msg: IDeviceBusEventData) {        
        let payload: IDeviceBusDataPayload = msg.payload;
        Debuger.Debuger.log("do_z2m_tcp_input_data", payload.pld.raw);
        this.z2m.tcp.events.input.data.emit(payload.pld.raw);
    }

    //Tcp输出 -> 南向输出
    on_z2m_tcp_output_data(data) {
        Debuger.Debuger.log("on_z2m_tcp_output_data", data);
        let payload: IDeviceBusDataPayload = {
            hd: {
                entry: {
                    type: "svc",
                    id: "penet"
                }
            },
            pld: {
                raw: data
            }
        }
        let msg: IDeviceBusEventData = {
            payload: payload
        }
        this.events.south.output.emit(msg);
    }

    on_z2m_z2m_close(code) {
        //服务停止，请求握手
        this.do_handshake_req();
    }



    //Mqtt
    on_mqtt_events_connect(packet: Mqtt.IConnackPacket) {
        Debuger.Debuger.log("Zigbee2Mqtt", "on_mqtt_events_connect");

    }

    on_mqtt_events_reconnect() {
        Debuger.Debuger.log("Zigbee2Mqtt", "on_mqtt_events_reconnect");
    }

    on_mqtt_events_disconnect(packet: Mqtt.IDisconnectPacket) {
        Debuger.Debuger.log("Zigbee2Mqtt", "on_mqtt_events_disconnect");
    }

    on_mqtt_events_message(topic: string, payload: Buffer, packet: Mqtt.IPublishPacket) {
        Debuger.Debuger.log("Zigbee2Mqtt", "on_mqtt_events_message", topic);
        this.on_mqtt_south_input(packet);
    }    

//Mqtt南向输入    
    on_mqtt_south_input(packet: Mqtt.IPublishPacket) {
        Debuger.Debuger.log("Zigbee2Mqtt", "on_mqtt_south_input", packet.topic);
        let topics = packet.topic.split("/");
        if (topics[1] == "bridge")
            this.on_z2m_bridge_events(packet);
        else
            this.on_z2m_child_events(packet);           
    }

        //协调器事件 拆解
        on_z2m_bridge_events(packet: Mqtt.IPublishPacket) {
            let topics = packet.topic.split("/");
            let type = topics[2];
            if (type == "state") {  //状态
                this.on_z2m_bridge_events_state(packet);            
            } else if (type == "event") { //事件
                this.on_z2m_bridge_events_event(packet);            
            } else if (type == "response") { //响应
                this.on_z2m_bridge_events_response(packet);
            }
        }

        //协调器事件: 在线状态 -> 北向输出
        on_z2m_bridge_events_state(packet: Mqtt.IPublishPacket) {
            let payload: IDeviceBusDataPayload = {
                hd: {
                    entry: {
                        type: "evt",
                        id: "state"
                    },
                    sid: "",
                    stp: 0
                },
                pld: {
                    value: packet.payload.toString()
                }
            }
            let msg: IDeviceBusEventData = {
                payload: payload
            }
            this.events.north.output.emit(msg);
        }

        //协调器事件: 子设备组网事件 -> 北向输出
        on_z2m_bridge_events_event(packet: Mqtt.IPublishPacket) {
            let pPayload = JSON.parse(packet.payload as any);
            if (pPayload.type === "device_joined") {
                this.on_z2m_bridge_events_event_device_joined(packet);
            } else if (pPayload.type === "device_leave") {
                this.on_z2m_bridge_events_event_device_leave(packet);
            } else if (pPayload.type === "device_interview") {
                this.on_z2m_bridge_events_event_device_interview(packet);
            }
            else {
                this.on_z2m_bridge_events_event_else(packet);
            }
            
            // else if (pPayload.type === "device_announce") {
            //     this.on_z2m_bridge_events_event_device_announce(packet);
            // } else if (pPayload.type === "device_interview") {
            //     this.on_z2m_bridge_events_event_device_interview(packet);
            // }
        }

        //协调器事件: 子设备入网事件 -> 北向输出
        on_z2m_bridge_events_event_device_joined(packet: Mqtt.IPublishPacket) {
            let pPayload = JSON.parse(packet.payload as any);
            let payload: IDeviceBusDataPayload = {
                hd: {
                    entry: {
                        type: "evt",
                        id: pPayload.type
                    },
                    sid: "",
                    stp: 0
                },
                pld: {
                    id: pPayload.data.ieee_address,
                    pid: this.attrs.id,
                    app_id: this.attrs.app_id,
                    dom_id: this.attrs.dom_id,                    
                }
            }
        
            this.events.north.output.emit({payload: payload});
        }

        //协调器事件: 子设备脱网事件 -> 北向输出
        on_z2m_bridge_events_event_device_leave(packet: Mqtt.IPublishPacket) {
            let pPayload = JSON.parse(packet.payload as any);
            let payload: IDeviceBusDataPayload = {
                hd: {
                    entry: {
                        type: "evt",
                        id: pPayload.type
                    },
                    sid: "",
                    stp: 0
                },
                pld: {
                    id: pPayload.data.ieee_address,
                    pid: this.attrs.id
                }
            }

            this.events.north.output.emit({payload: payload});
        }        

        //协调器事件: 子设备检索事件 -> 北向输出
        on_z2m_bridge_events_event_device_interview(packet: Mqtt.IPublishPacket) {
            let pPayload = JSON.parse(packet.payload as any);
            if (pPayload.data.status === "successful" ) {            
                let payload: IDeviceBusDataPayload = {
                    hd: {
                        entry: {
                            type: "evt",
                            id: pPayload.type
                        },
                        sid: "",
                        stp: 0
                    },
                    pld: {
                        id: pPayload.data.ieee_address,
                        pid: this.attrs.id,
                        app_id: this.attrs.app_id,
                        dom_id: this.attrs.dom_id,                                            
                        vendor: pPayload.data.definition.vendor,
                        model: pPayload.data.definition.vendor + "-" + pPayload.data.definition.model,
                        desc: pPayload.data.definition.description
                    },
                    extra: pPayload 
                } as any;

                this.events.north.output.emit({payload: payload});
            }
        }   

        //协调器事件: 子设备其它事件 -> 北向输出
        on_z2m_bridge_events_event_else(packet: Mqtt.IPublishPacket) {
            let pPayload = JSON.parse(packet.payload as any);
            let payload: IDeviceBusDataPayload = {
                hd: {
                    entry: {
                        type: "evt",
                        id: pPayload.type
                    },
                    sid: "",
                    stp: 0
                },
                pld: pPayload
            }

            this.events.north.output.emit({payload: payload});
        }   

        //协调器事件: 响应事件 -> 北向输出
        on_z2m_bridge_events_response(packet: Mqtt.IPublishPacket) {
            let topics = packet.topic.split("/");
            let type = topics[3];
            if (type == "permit_join") {
                this.on_z2m_bridge_events_response_permit_join(packet);
            }
        }

        //协调器事件: 响应事件: 开启/关闭入网 -> 北向输出
        on_z2m_bridge_events_response_permit_join(packet: Mqtt.IPublishPacket) {
            let topics = packet.topic.split("/");
            let pPayload = JSON.parse(packet.payload as any);
            let payload: IDeviceBusDataPayload = {
                hd: {
                    entry: {
                        type: "evt",
                        id: topics[3]
                    },
                    sid: pPayload.transaction,
                    stp: 1
                },
                pld: {
                    permit_join: pPayload.data.value
                }
            }

            let msg: IDeviceBusEventData = {
                payload: payload
            }

            this.events.north.output.emit(msg);
        }

        //Mqtt南向输入(子设备事件) -> 北向输出
        on_z2m_child_events(packet: Mqtt.IPublishPacket) {
            let topics = packet.topic.split("/");
        }
            
//Mqtt南向输出
    on_mqtt_south_output(msg: IDeviceBusEventData) {
        this.mqtt.publish(msg.topic, msg.payload);
    }    

//Mqtt北向输入 -> 南向输出
    on_mqtt_north_input(msg: IDeviceBusEventData){
        let payload: IDeviceBusDataPayload = msg.payload;
        if (payload.hd.stp == 0) {
            if (payload.hd.entry.type == "svc") {
                if (payload.hd.entry.id == "set" && typeof payload.pld == "object") {
                    if (payload.pld.hasOwnProperty("permit_join"))
                    this.on_mqtt_north_input_request_permit_join(msg);
                }
            }
        }
    }
        //允许、关闭入网
        on_mqtt_north_input_request_permit_join(_msg: IDeviceBusEventData){
            let _payload = (_msg.payload as IDeviceBusDataPayload);
            let msg: IDeviceBusEventData = {};
            msg.topic = "bridge/request/permit_join";
            msg.payload = {
                value: _payload.pld.permit_join,
                time: 254,
                transaction: _payload.hd.sid
            };
            this.on_mqtt_south_output(msg);
        }
  
}
