import { IDeviceBusEvent, IDeviceBusEventData } from "../src/device/device.dts"
import { DeviceManager } from "../src/device/manager"

import "./mocha"
import assert = require('assert');
import { Debuger } from "../src/device";
import { PlfHead } from "../src/device/amd/coders/plf-json-dev/plf-head";


describe('编解码器', function () {
    describe('PlfHead', function () {
        const head = new PlfHead()
        it('encode_sid', function () {
            assert.equal(head.encode_sid(""), 0, "空串转换错误");
            assert.equal(head.encode_sid("1234567"), 1234567, "数字转换错误");
            assert.equal(head.encode_sid("0uththx1cnzughex"), head.encode_sid("10zughex"), "字符转换错误");
        });
        it('decode_sid', function () {
            assert.equal(head.decode_sid(0), undefined, "空串转换错误");
        });
    


    });
});