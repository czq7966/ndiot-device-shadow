1、查询token
	沙箱环境：https://ucbetapi.101.com/v0.93/bearer_tokens
	正式环境：https://aqapi.101.com/v0.93/bearer_tokens
	请求体：
		{//沙箱
		    "login_name":"nderp",
		    "password":"80fba977d063a6f7262a8a9c95f61140"
		}
		{
		    //正式
		    "login_name":"nderp_bearer",
		    "password":"b998e647e1cd2d1987f960ef5aef47c3"
		}
	返回值：
		{
			"access_token":"F4138BF83405E3B1E27316E5447BB8FCD9236161D778DA8D1CB9FAE635647CA85C7D7E2C4C1BF6C371DCB8AB8D96F85A42002F7F633E28AA-00000000"
		}
2、查询记录 [POST]
 	沙箱环境：https://bcs-app-service-sandbox.sdp.101.com/v0.1//events/loading/system_loading_es_data_list
 	正式环境：https://bcs-app-service.sdp.101.com/v0.1/events/loading/system_loading_es_data_list
	请求参数：suid : "123456"//工号
	请求头：
		sdp-app-id: b4fb92a0-af7f-49c2-b270-8f62afac1133
		bcs-app-id: c683f16c236e44c1a35514319f3eaa41
		//token是查询token接口加上符号拼接成的
		Authorization：Bearer \"F4138BF83405E3B1255DF74A183ECE298235F53E5710E0CFA9189B8DB83502D9F770635FC6BB6DFE9971FF5D85B4B4B5DB32428BB0C136F1-00000000\"//token
	请求体：
		// 查询机器异常报警/机器操作日记 
		"form_id":"c683f16c236e44c19cdd17c524eb2b55",
		"orderby":"datetime_1684113178508_572 desc",
		"limit":"1"，
    		"filter":[
        		{
            		  "is_operator": false,
            		  "key": "select_1689231840204_448",
            		  "op": "eq",
            		  "value": "机器异常报警" //值为 机器异常报警/机器操作日记
        		},
		{
            		  "is_operator": false,
            		  "key": "input_1689231771369_423",
            		  "op": "eq",
            		  "value": "" //设备id
        		}
    		]

		// 机器清洁日记 
		"form_id":"c683f16c236e44c1b436c2e595125888",
		"orderby":"endTime desc",
		"limit":"1",
    		"filter":[
		{
            		  "is_operator": false,
            		  "key": "input_1689238656468_822",
            		  "op": "eq",
            		  "value": "" //设备id
        		}
    		]
	返回值：
		//查询机器异常报警/机器操作日记 
		{
		  "count":19,
		   //默认时间排序
		  "items":[
		    {
		      "input_1689231771369_423":""//设备id
		      "create_time":"2023-07-17T14:30:05.000+0800"//创建时间
		      "datetime_1684113178508_572" :"2023-07-17T14:30:05.000+0800"//timestamp
		    }
		  ]
		}

		//查询机器清洁日记 
		{
		  "count":19,
		   //默认时间排序
		  "items":[
		    {
		      "input_1689238656468_822":""//设备id
		      "create_time":"2023-07-17T14:30:05.000+0800"//创建时间
		      "endTime" :"2023-07-17T14:30:05.000+0800"//endTime
		    }
		  ]
		}
3、推送数据wiki
（1）推送机器基础信息
https://nd99u.site.101.com/bcs-sandbox/editor/index.html#/wiki?bcsAppId=c683f16c236e44c1a35514319f3eaa41&eventId=c683f16c236e44c183c57335ad1ba894&viewType=global_external_system&sdp-app-id=b4fb92a0-af7f-49c2-b270-8f62afac1133

（2）推送机器清洁日记
https://nd99u.site.101.com/bcs-sandbox/editor/index.html#/wiki?bcsAppId=c683f16c236e44c1a35514319f3eaa41&eventId=c683f16c236e44c198c4980c643825bf&viewType=global_external_system&sdp-app-id=b4fb92a0-af7f-49c2-b270-8f62afac1133

（3）推送机器异常报警记录
https://nd99u.site.101.com/bcs-sandbox/editor/index.html#/wiki?bcsAppId=c683f16c236e44c1a35514319f3eaa41&eventId=c683f16c236e44c1845a011cfbaae5d5&viewType=global_external_system&sdp-app-id=b4fb92a0-af7f-49c2-b270-8f62afac1133

（4）推送机器操作日记记录
https://nd99u.site.101.com/bcs-sandbox/editor/index.html#/wiki?bcsAppId=c683f16c236e44c1a35514319f3eaa41&eventId=c683f16c236e44c1ba872a49255b9b5a&viewType=global_external_system&sdp-app-id=b4fb92a0-af7f-49c2-b270-8f62afac1133