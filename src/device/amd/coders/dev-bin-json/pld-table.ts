

export interface IPldTable{
    tables: {[key: number]:  Buffer | string | number};
    encode(): Buffer;
    decode(buf: Buffer);
    reset();

}

export class PldTableKeys {
    //字符串
    static dev_vender =         60000;
    static dev_model =          60001;
    static dev_id =             60002;
    static dev_mac =            60003;
    static wifi_ssid =          60004;
    static wifi_pass =          60005;
    static ap_ssid =            60006;
    static ap_pass =            60007;
    static ota_update_url =     60008;
    static mqtt_sub_topic =     60009;
    static mqtt_pub_topic =     60010;
    static mqtt_ip =            60011;
    static mqtt_user =          60012;
    static mqtt_pass =          60013;
    static wifi_ssid_dev =      60014;
    static wifi_pass_dev =      60015;

    static intranet_mqtt_ip =	60040;
    static intranet_mqtt_user =	60041;
    static intranet_mqtt_pass =	60042;
    static intranet_ip =    	60043;
    

    //二进制
    static penet_data =         60500;
    static rfir_sniff_data =	60501;
    static rfir_send_data = 	60502;

    
    //数字
    static dev_online =         61000;
    static cfg_version =        61001;
    static wifi_rssi =          61002;
    static pin_led =            61003;
    static pin_button =         61004;
    static pin_reset =          61005;

    static serial_debug =       61006;
    static serial_baud =        61007;
    static serial_data =        61008;
    static serial_stop =        61009;
    static serial_sum =         61010;
    static serial_stream =      61011;

    static ota_disable =        61012;
    static ota_version =        61013;
    static ota_update_interval =61014;

    static wifi_disable =       61015;
    static wifi_reset_timeout = 61016;

    static ap_disable =         61017;
    static ap_start_timeout =   61018;

    static mqtt_disable =       61019;
    static mqtt_port =          61020;
    static mqtt_keepalive =     61021;
    static mqtt_clean_session = 61022;
    static mqtt_reset_timeout = 61023;
    static mqtt_buffer_size =   61024;

    static net_report_timeout =  61025;
    static net_handshake_timeout=61026;
    static net_handshake_count  =61027;

    static dev_address =         61028;
    static dev_offline_count =   61029;

    static net_report_reason =   61030;
    static serial_read_timeout = 61031;
    static serial_read_bufsize = 61032;
    static serial_half_rw_pin =	 61033;
    static serial_half_r_level = 61034;
        
    static gpio_rw_pin =	     61035;
    static gpio_rw_value =	     61036;
        
    static intranet_mqtt_enable =61040;
    static intranet_mqtt_port =	 61041;
    static intranet_enable =	 61042;
    static intranet_port =	     61043;
        
    static rfir_sniff_enable =	 61050;
    static rfir_sniff_pin =	     61051;
    static rfir_sniff_inverted = 61052;
    static rfir_sniff_minCount = 61053;
    static rfir_sniff_maxCount = 61054;
    static rfir_sniff_minDelta = 61055;
    static rfir_sniff_maxDelta = 61056;
        
    static rfir_send_enable =	 61060;
    static rfir_send_pin =	     61061;
    static rfir_send_inverted =	 61062;
    static rfir_send_modulation =61063;
    static rfir_send_repeat =	 61064;
    static rfir_send_frequency = 61065;
    static rfir_send_dutycycle = 61066;
    
}

export class PldTable implements IPldTable {
    static StrMinNum = 60000;
    static StrMaxNum = 60499;
    static BytesMinNum = 60500;
    static BytesMaxNum = 60999;    
    static Keys = PldTableKeys
    static Names: {[id: number]: string} = {};
    static InitNames() {
        Object.keys(PldTable.Keys).forEach(key => {
            const val = PldTable.Keys[key];
            PldTable.Names[val] = key;
        })
    }
    
    tables: { [key: number]: Buffer | string | number; } = {};

    encode(): Buffer {
        const buf = [];
        Object.keys(this.tables).forEach(strKey => {            
            const key = parseInt(strKey);
            if (key >=0 && key <= 0xFFFF) {            
                buf.push(key & 0xff);
                buf.push((key >> 8) & 0xff);
                if (key >= PldTable.StrMinNum && key <= PldTable.StrMaxNum ||
                    key >= PldTable.BytesMinNum && key <= PldTable.BytesMaxNum
                    ) {
                        let value = this.tables[key] as any;

                        if (key >= PldTable.StrMinNum && key <= PldTable.StrMaxNum) {
                            value = Buffer.from((value || "").toString());
                        } else {
                            if (!Buffer.isBuffer(value) && Array.isArray(value.data)) {
                                value = Buffer.from(value.data);
                            }
                        }

                        const len = value.length;
                        buf.push(len & 0xff);
                        buf.push((len >> 8) & 0xff); 
                        for (let i = 0; i < len; i++) {
                            buf.push(value[i]);            
                        }
                } else {
                        const value: number = this.tables[key] as number;
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
            const key: number = buf[idx++] + (buf[idx++] << 8);
            if (key >= PldTable.StrMinNum && key <= PldTable.StrMaxNum ||
                key >= PldTable.BytesMinNum && key <= PldTable.BytesMaxNum
                ) {
                const len = buf[idx++] + (buf[idx++] << 8);
                if (len > 0) {
                    const value = buf.subarray(idx, idx + len);
                    idx = idx + len;                    
                    if (key >= PldTable.StrMinNum && key <= PldTable.StrMaxNum)
                        this.tables[key] = value.toString();
                    else
                        this.tables[key] = value;
                }
            } else {
                const value: number = buf[idx++] + (buf[idx++] << 8);
                this.tables[key] = value;
            }
        }        
    }

    reset(){
        this.tables = {};
    }

}


PldTable.InitNames();