

export interface IRegTable{
    tables: {[key: number]: string | number};
    encode(): Buffer;
    decode(buf: Buffer);

}

export class RegTable implements IRegTable {
    static CharMinNum: number = 60000;
    static CharMaxNum: number = 60999;

    static Keys: {[name: string]: number} = {
        dev_vender :         60000,
        dev_model :          60001,
        dev_id :             60002,
        dev_mac :            60003,
        wifi_ssid :          60004,
        wifi_pass :          60005,
        ap_ssid :            60006,
        ap_pass :            60007,
        ota_update_url :     60008,
        mqtt_sub_topic :     60009,
        mqtt_pub_topic :     60010,
        mqtt_ip :            60011,
        mqtt_user :          60012,
        mqtt_pass :          60013,
        wifi_ssid_dev :      60014,
        wifi_pass_dev :      60015,
        
        dev_online :         61000,
        cfg_version :        61001,
        wifi_rssi :          61002,
        pin_led :            61003,
        pin_button :         61004,
        pin_reset :          61005,

        serial_debug :       61006,
        serial_baud :        61007,
        serial_data :        61008,
        serial_stop :        61009,
        serial_sum :         61010,
        serial_stream :      61011,

        ota_disable :        61012,
        ota_version :        61013,
        ota_update_interval :61014,

        wifi_disable :       61015,
        wifi_reset_timeout : 61016,

        ap_disable :         61017,
        ap_start_timeout :   61018,

        mqtt_disable :       61019,
        mqtt_port :          61020,
        mqtt_keepalive :     61021,
        mqtt_clean_session : 61022,
        mqtt_reset_timeout : 61023,
        mqtt_buffer_size :   61024,

        net_report_timeout :  61025,
        net_handshake_timeout:61026,
        net_handshake_count  :61027,

        dev_address :         61028,
        dev_offline_count :   61029,
    }
    
    tables: { [key: number]: string | number; } = {};

    encode(): Buffer {
        let buf = [];
        Object.keys(this.tables).forEach(strKey => {            
            let key = parseInt(strKey);
            if (key >=0 && key <= 0xFFFF) {            
                buf.push(key & 0xff);
                buf.push((key >> 8) & 0xff);
                if (key >= RegTable.CharMinNum && key <= RegTable.CharMaxNum ) {
                        let value: string = this.tables[key] as string;
                        let len = value.length;
                        len = len > 0 ? len + 1 : 0;
                        buf.push(len & 0xff);
                        buf.push((len >> 8) & 0xff); 
                        for (let i = 0; i < len; i++) {
                            if (i == len - 1)
                                buf.push(0);
                            else
                                buf.push(value.charCodeAt(i));                    
                        }

                } else {
                        let value: number = this.tables[key] as number;
                        buf.push(value & 0xff);
                        buf.push((value >> 8) & 0xff);
                }
            }

        })
        return Buffer.from(buf);

    }

    decode(buf: Buffer) {
        let idx = 0;
        while (idx < buf.length) {
            let key: number = buf[idx++] + (buf[idx++] << 8);
            if (key >= RegTable.CharMinNum && key <= RegTable.CharMaxNum ) {
                let len = buf[idx++] + (buf[idx++] << 8);
                if (len > 0) {
                    let value = buf.subarray(idx, idx + len - 1).toString();
                    idx = idx + len;
                    this.tables[key] = value;
                }
            } else {
                let value: number = buf[idx++] + (buf[idx++] << 8);
                this.tables[key] = value;
            }
        }        
    }


}

