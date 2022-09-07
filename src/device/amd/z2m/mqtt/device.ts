
import { IDeviceBusEventData } from "../../../device.dts";
import { IZigbee2Mqtt, Zigbee2Mqtt } from "../base/device";

export interface IZigbee2Mqtt_MQTT extends IZigbee2Mqtt {}

export class Zigbee2Mqtt_MQTT extends Zigbee2Mqtt implements IZigbee2Mqtt_MQTT {

    on_config_get_response(msg: IDeviceBusEventData) {
        super.on_config_get_response(msg);
        this.do_handshake_req();
    }

    on_z2m_z2m_close(code) {
        //服务停止，请求握手
        this.do_handshake_req();
    }
}