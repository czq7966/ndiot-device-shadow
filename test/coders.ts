import { IDeviceBusEvent, IDeviceBusEventData } from "../src/device/device.dts"
import { DeviceManager } from "../src/device/manager"

import "./mocha"
import assert = require('assert');
import { Debuger } from "../src/device";
import { PlfHead } from "../src/device/amd/coders/plf-json-dev/plf-head";
import { Cmd, CmdId, ICmd } from "../src/device/amd/coders/dev-bin-json/cmd";
import { PldTable } from "../src/device/amd/coders/dev-bin-json/pld-table";
import { PlfPayload } from "../src/device/amd/coders/plf-json-dev/plf-payload";
import { CmdHead } from "../src/device/amd/coders/dev-bin-json/cmd-head";

//美的编解码器
import * as MediaCoder from "../src/device/amd/coders/rfir/ac-media";

        

describe('编解码器', function () {
    describe('NDIOT终端协议:Payload', function () {
        const pldTable = new PldTable();
        pldTable.reset();
        it('Payload编码', function () {
            pldTable.tables[PldTable.Keys.dev_id] = "abcdefg";        
            pldTable.encode();
        });

        it('Payload解码', function () {
            pldTable.decode(pldTable.encode());
        });

    });

    describe('PlfHead', function () {
        const head = new PlfHead()
        head.reset();
        it('encode编码接口', function () {
            assert.equal(head.encode({entry:{id: "get"}}).head.cmd_id, CmdId.get, "指令编码失败");
        });

        it('decode解码接口', function () {
            const cmd = new CmdHead();
            cmd.head.cmd_id = CmdId.get;
            assert.equal(head.decode(cmd).entry.id, "get","指令解码失败");
        });

        it('encode_sid: 会话ID', function () {
            assert.equal(head.encode_sid(""), 0, "空串转换错误");
            assert.equal(head.encode_sid("1234567"), 1234567, "数字转换错误");
            assert.equal(head.encode_sid("0uththx1cnzughex"), head.encode_sid("10zughex"), "字符转换错误");
        });
        it('decode_sid: 会话ID', function () {
            assert.equal(head.decode_sid(0), undefined, "空串转换错误");
        });
    });
    describe('PlfPayload', function () {
        const payload = new PlfPayload()
        payload.reset();
        it('encode编码接口', function () {
            assert.equal(payload.encode({dev_vender: "ND"}).tables[60000], "ND", "编码接口失败");
        });
        it('decode解码接口', function () {
            const pldTable = new PldTable();
            pldTable.tables["60000"] = "ND";             
            assert.equal(payload.decode(pldTable)["dev_vender"], "ND", "解码接口失败");
        });        
    });    

    describe('美的空调解码器', function () {

        const cmd = new Cmd()
        //mode: fan
        // const code =  [68,78,0,0,17,0,0,0,0,0,0,0,222,0,130,1,85,236,126,1,76,17,129,17,5,2,86,6,33,2,26,2,24,2,94,6,25,2,118,6,1,2,31,2,28,2,30,2,29,2,113,6,7,2,27,2,1,2,58,2,3,2,148,6,15,2,20,2,8,2,15,2,34,2,110,6,0,2,118,6,2,2,31,2,29,2,116,6,4,2,115,6,6,2,52,2,253,1,121,6,255,1,154,6,221,1,117,6,2,2,141,6,235,1,113,6,26,2,91,6,27,2,59,2,229,1,119,6,30,2,29,2,2,2,31,2,29,2,30,2,30,2,27,2,32,2,29,2,31,2,27,2,2,2,116,6,24,2,93,6,27,2,89,6,60,2,0,2,30,2,55,2,230,1,119,6,31,2,27,2,3,2,29,2,31,2,37,2,23,2,29,2,31,2,27,2,22,2,95,6,24,2,119,6,0,2,33,2,27,2,92,6,29,2,89,6,31,2,148,20,64,17,129,17,5,2,114,6,25,2,33,2,7,2,144,6,251,1,116,6,4,2,54,2,232,1,57,2,1,2,143,6,234,1,29,2,32,2,53,2,6,2,113,6,253,1,60,2,255,1,34,2,26,2,119,6,0,2,117,6,7,2,26,2,30,2,112,6,7,2,86,6,24,2,61,2,254,1,93,6,27,2,117,6,3,2,116,6,4,2,113,6,253,1,121,6,254,1,143,6,7,2,2,2,26,2,91,6,30,2,29,2,30,2,55,2,5,2,28,2,32,2,27,2,1,2,85,2,232,1,29,2,32,2,114,6,6,2,111,6,254,1,120,6,0,2,59,2,0,2,58,2,1,2,116,6,4,2,55,2,5,2,27,2,53,2,33,2,253,1,36,2,2,2,56,2,5,2,113,6,255,255];
        //mode: dry
        const code = [68,78,0,0,17,0,0,0,0,0,0,0,198,0,130,1,85,236,126,1,138,17,49,17,53,2,56,6,54,2,231,1,53,2,56,6,54,2,55,6,54,2,229,1,25,2,2,2,58,2,53,6,55,2,228,1,59,2,226,1,61,2,49,6,29,2,254,1,52,2,234,1,52,2,58,6,32,2,77,6,52,2,232,1,33,2,75,6,54,2,232,1,55,2,230,1,26,2,3,2,27,2,82,6,58,2,53,6,56,2,52,6,56,2,54,6,57,2,52,6,27,2,81,6,58,2,53,6,57,2,52,6,57,2,227,1,59,2,225,1,50,2,235,1,31,2,254,1,52,2,232,1,22,2,6,2,56,2,230,1,56,2,227,1,58,2,52,6,57,2,227,1,57,2,51,6,59,2,226,1,61,2,224,1,52,2,58,6,52,2,57,6,53,2,57,6,52,2,233,1,52,2,57,6,32,2,252,1,24,2,85,6,54,2,56,6,23,2,131,20,140,17,57,17,46,2,56,6,55,2,230,1,55,2,54,6,54,2,55,6,56,2,229,1,26,2,1,2,58,2,52,6,58,2,227,1,58,2,226,1,50,2,59,6,51,2,232,1,53,2,233,1,23,2,87,6,53,2,56,6,53,2,232,1,24,2,85,6,24,2,4,2,56,2,228,1,26,2,3,2,28,2,81,6,57,2,52,6,58,2,52,6,27,2,81,6,59,2,52,6,57,2,52,6,58,2,52,6,57,2,52,6,108,2,176,1,59,2,226,1,59,2,224,1,51,2,234,1,52,2,233,1,52,2,232,1,55,2,229,1,56,2,227,1,59,2,52,6,57,2,228,1,59,2,50,6,59,2,226,1,60,2,224,1,49,2,60,6,30,2,77,6,52,2,59,6,51,2,233,1,255,255];
        it('指令解码', function () {
            assert.equal(cmd.decode(Buffer.from(code)), true, "指令解码出错");            
        });
        it('红外解码', function () {
            const coder = new MediaCoder.Coder();
            const data = cmd.payload.tables[PldTable.Keys.rfir_sniff_data] as Buffer;
            const bytess = coder.rfir_coder.decode(data)
            // coder.rfir_coder.dumpBuf(data, true)
            
            assert.equal(coder.pnt_table.decodeBytess(bytess), true, "红外解码失败");

            return;            
        });

        describe('物模型', function () {
            const coder = new MediaCoder.Coder();
            it('开机编码', function () {
                assert.equal(coder.plf_props.encode({power: "on"}, coder.pnt_table).getPower(), MediaCoder.TableConst.PowerOn, "开机编码出错");            
            });            
            it('开机解码', function () {
                coder.pnt_table.setPower(true)
                assert.equal(coder.plf_props.decode(coder.pnt_table, coder.plf_props.props).power, "on", "开机解码出错");            
            });   
            it('模式编码', function () {
                assert.equal(coder.plf_props.encode({mode: "cool"}, coder.pnt_table).getMode(), MediaCoder.TableConst.ModeCool, "模式编码出错");            
            });            
            it('模式解码', function () {
                coder.pnt_table.setMode(MediaCoder.TableConst.ModeCool)
                assert.equal(coder.plf_props.decode(coder.pnt_table, coder.plf_props.props).mode, "cool", "模式解码出错");            
            });   
            it('温度编码', function () {
                assert.equal(coder.plf_props.encode({temperature: 25}, coder.pnt_table).getTemp(), 25, "温度编码出错");            
            });            
            it('温度解码', function () {
                coder.pnt_table.setTemp(26)
                assert.equal(coder.plf_props.decode(coder.pnt_table, coder.plf_props.props).temperature, 26, "温度解码出错");            
            });                                 
        });
    });
});