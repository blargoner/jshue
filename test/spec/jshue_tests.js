describe('jsHue', () => {

    var jsHue = fetch => jsHueAPI(fetch, Response, JSON, Promise);

    var fetchSpy = response => jasmine.createSpy('fetch', fetch)
                                    .and.callFake(() => Promise.resolve(new Response(JSON.stringify(response))));

    it('discovers bridges', done => {
        const UPNP_URL = 'https://www.meethue.com/api/nupnp';

        var response = [{"id":"0000000000000001","internalipaddress":"192.168.1.100"}],
            fetch = fetchSpy(response),
            hue = jsHue(fetch);

        hue.discover().then(data => {
            expect(fetch).toHaveBeenCalledWith(UPNP_URL, { method: 'GET', body: null });
            expect(data).toEqual(response);
            done();
        });
    });

    describe('jsHueBridge', () => {
        const BRIDGE_IP = '192.168.1.100',
                BRIDGE_URL = `http://${BRIDGE_IP}/api`;

        var jsHueBridge = fetch => jsHue(fetch).bridge(BRIDGE_IP);

        it('creates a new user', done => {
            var type = 'my_hue_app#iphone peter',
                body = {"devicetype": type},
                response = [{"success":{"username": "83b7780291a6ceffbe0bd049104df"}}],
                fetch = fetchSpy(response),
                bridge = jsHueBridge(fetch);

            bridge.createUser(type).then(data => {
                expect(fetch).toHaveBeenCalledWith(BRIDGE_URL, { method: 'POST', body: JSON.stringify(body) });
                expect(data).toEqual(response);
                done();
            });
        });

        describe('jsHueUser', () => {
            const USER = '83b7780291a6ceffbe0bd049104df',
                    USER_URL = `${BRIDGE_URL}/${USER}`;

            var jsHueUser = fetch => jsHueBridge(fetch).user(USER);

            describe('lights API', () => {
                const LIGHTS_URL = `${USER_URL}/lights`;

                it('gets all lights', done => {
                    var response = {
                            "1": {
                                "state": {
                                    "on": true,
                                    "bri": 144,
                                    "hue": 13088,
                                    "sat": 212,
                                    "xy": [0.5128,0.4147],
                                    "ct": 467,
                                    "alert": "none",
                                    "effect": "none",
                                    "colormode": "xy",
                                    "reachable": true
                                },
                                "type": "Extended color light",
                                "name": "Hue Lamp 1",
                                "modelid": "LCT001",
                                "swversion": "66009461",
                                "pointsymbol": {
                                    "1": "none",
                                    "2": "none",
                                    "3": "none",
                                    "4": "none",
                                    "5": "none",
                                    "6": "none",
                                    "7": "none",
                                    "8": "none"
                                }
                            },
                            "2": {
                                "state": {
                                    "on": false,
                                    "bri": 0,
                                    "hue": 0,
                                    "sat": 0,
                                    "xy": [0,0],
                                    "ct": 0,
                                    "alert": "none",
                                    "effect": "none",
                                    "colormode": "hs",
                                    "reachable": true
                                },
                                "type": "Extended color light",
                                "name": "Hue Lamp 2",
                                "modelid": "LCT001",
                                "swversion": "66009461",
                                "pointsymbol": {
                                    "1": "none",
                                    "2": "none",
                                    "3": "none",
                                    "4": "none",
                                    "5": "none",
                                    "6": "none",
                                    "7": "none",
                                    "8": "none"
                                }
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getLights().then(data => {
                        expect(fetch).toHaveBeenCalledWith(LIGHTS_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('searches for new lights', done => {
                    var response = [{"success": { "/lights": "Searching for new devices" }}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.searchForNewLights().then(data => {
                        expect(fetch).toHaveBeenCalledWith(LIGHTS_URL, { method: 'POST', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('searches for new lights with data', done => {
                    var body = {"deviceid":["45AF34","543636","34AFBE"]},
                        response = [{"success": { "/lights": "Searching for new devices" }}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.searchForNewLights(body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(LIGHTS_URL, { method: 'POST', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets new lights', done => {
                    var response = {
                            "7": {"name": "Hue Lamp 7"},
                            "8": {"name": "Hue Lamp 8"},
                            "lastscan": "2012-10-29T12:00:00"
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getNewLights().then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${LIGHTS_URL}/new`, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets light attributes and state', done => {
                    var id = 1,
                        response = {
                            "state": {
                                "hue": 50000,
                                "on": true,
                                "effect": "none",
                                "alert": "none",
                                "bri": 200,
                                "sat": 200,
                                "ct": 500,
                                "xy": [0.5, 0.5],
                                "reachable": true,
                                "colormode": "hs"
                            },
                            "type": "Living Colors",
                            "name": "LC 1",
                            "modelid": "LC0015",
                            "swversion": "1.0.3",   
                            "pointsymbol": {
                                "1": "none",
                                "2": "none",
                                "3": "none",
                                "4": "none",
                                "5": "none",
                                "6": "none",
                                "7": "none",
                                "8": "none"
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getLight(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${LIGHTS_URL}/${id}`, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets light attributes', done => {
                    var id = 1,
                        body = {"name":"Bedroom Light"},
                        response = [{"success":{"/lights/1/name":"Bedroom Light"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setLight(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${LIGHTS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets light state', done => {
                    var id = 1,
                        body = {
                            "hue": 50000,
                            "on": true,
                            "bri": 200
                        },
                        response = [
                            {"success":{"/lights/1/state/bri":200}},
                            {"success":{"/lights/1/state/on":true}},
                            {"success":{"/lights/1/state/hue":50000}}
                        ],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setLightState(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${LIGHTS_URL}/${id}/state`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('deletes a light', done => {
                    var id = 1,
                        response = [{"success": "/lights/1 deleted."}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.deleteLight(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${LIGHTS_URL}/${id}`, { method: 'DELETE', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });
            });

            describe('groups API', () => {
                const GROUPS_URL = `${USER_URL}/groups`;

                it('gets all groups', done => {
                    var response = {
                            "1": {
                                "name": "Group 1",
                                "lights": [
                                    "1",
                                    "2"
                                ],
                                "type": "LightGroup",
                                "action": {
                                    "on": true,
                                    "bri": 254,
                                    "hue": 10000,
                                    "sat": 254,
                                    "effect": "none",
                                    "xy": [
                                        0.5,
                                        0.5
                                    ],
                                    "ct": 250,
                                    "alert": "select",
                                    "colormode": "ct"
                                }
                            },
                            "2": {
                                "name": "Group 2",
                                "lights": [
                                    "3",
                                    "4",
                                    "5"
                                ],
                                "type": "LightGroup",
                                "action": {
                                    "on": true,
                                    "bri": 153,
                                    "hue": 4345,
                                    "sat": 254,
                                    "effect": "none",
                                    "xy": [
                                        0.5,
                                        0.5
                                    ],
                                    "ct": 250,
                                    "alert": "select",
                                    "colormode": "ct"
                                }
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getGroups().then(data => {
                        expect(fetch).toHaveBeenCalledWith(GROUPS_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('creates a group', done => {
                    var body = {
                            "name": "Living room",
                            "type": "Room",
                            "class": "Living room",
                            "lights": [
                                "3",
                                "4"
                            ]
                        },
                        response = [{"success":{"id":"1"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.createGroup(body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(GROUPS_URL, { method: 'POST', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets group attributes', done => {
                    var id = 1,
                        response = {
                            "action": {
                                "on": true,
                                "hue": 0,
                                "effect": "none",
                                "bri": 100,
                                "sat": 100,
                                "ct": 500,
                                "xy": [0.5, 0.5]
                            },
                            "lights": [
                                "1",
                                "2"
                            ],
                            "state": {
                                "any_on":true,
                                "all_on":true
                            },
                            "type":"Room",
                            "class":"Bedroom",
                            "name":"Master bedroom"
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getGroup(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${GROUPS_URL}/${id}`, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets group attributes', done => {
                    var id = 1,
                        body = {"name":"Bedroom","lights":["1"]},
                        response = [
                            {"success":{"/groups/1/lights":["1"]}},
                            {"success":{"/groups/1/name":"Bedroom"}}
                        ],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setGroup(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${GROUPS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets group state', done => {
                    var id = 1,
                        body = {
                            "on": true,
                            "hue": 2000,
                            "effect": "colorloop"
                        },
                        response = [
                            {"success":{ "address": "/groups/1/action/on", "value": true}},
                            {"success":{ "address": "/groups/1/action/effect", "value":"colorloop"}},
                            {"success":{ "address": "/groups/1/action/hue", "value":6000}}
                        ],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setGroupState(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${GROUPS_URL}/${id}/action`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('deletes a group', done => {
                    var id = 1,
                        response = [{"success": "/groups/1 deleted."}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.deleteGroup(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${GROUPS_URL}/${id}`, { method: 'DELETE', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });
            });

            describe('schedules API', () => {
                const SCHEDULES_URL = `${USER_URL}/schedules`;

                it('gets all schedules', done => {
                    var response = {
                            "1": {
                                "name": "Timer",
                                "description": "",
                                "command": {
                                    "address": "/api/83b7780291a6ceffbe0bd049104df/groups/0/action",
                                    "body": {
                                        "scene": "02b12e930-off-0"
                                    },
                                    "method": "PUT"
                                },
                                "time": "PT00:01:00",
                                "created": "2014-06-23T13:39:16",
                                "status": "disabled",
                                "autodelete": false,
                                "starttime": "2014-06-23T13:39:16"
                            },
                            "2": {
                                "name": "Alarm",
                                "description": "",
                                "command": {
                                    "address": "/api/83b7780291a6ceffbe0bd049104df/groups/0/action",
                                    "body": {
                                        "scene": "02b12e930-off-0"
                                    },
                                    "method": "PUT"
                                },
                                "localtime": "2014-06-23T19:52:00",
                                "time": "2014-06-23T13:52:00",
                                "created": "2014-06-23T13:38:57",
                                "status": "disabled",
                                "autodelete": false
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getSchedules().then(data => {
                        expect(fetch).toHaveBeenCalledWith(SCHEDULES_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('creates a schedule', done => {
                    var body = {
                            "name": "Wake up",
                            "description": "My wake up alarm",
                            "command": {
                                "address": "/api/83b7780291a6ceffbe0bd049104df/groups/1/action",
                                "method": "PUT",
                                "body": {
                                    "on": true
                                }
                            },
                            "localtime": "2015-06-30T14:24:40"
                        },
                        response = [{"success":{"id": "2"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.createSchedule(body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(SCHEDULES_URL, { method: 'POST', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets schedule attributes', done => {
                    var id = 1,
                        response = {
                            "name": "Wake up",
                            "description": "My wake up alarm",
                            "command": {
                                "address": "/api/83b7780291a6ceffbe0bd049104df/groups/1/action",
                                "method": "PUT",
                                "body": {
                                    "on": true
                                }
                            },
                            "time": "W124/T06:00:00"
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getSchedule(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SCHEDULES_URL}/${id}`, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets schedule attributes', done => {
                    var id = 1,
                        body = {"name":"Wake up"},
                        response = [{"success": {"/schedules/1/name": "Wake up"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setSchedule(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SCHEDULES_URL}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('deletes a schedule', done => {
                    var id = 1,
                        response = [{"success": "/schedules/1 deleted."}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.deleteSchedule(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SCHEDULES_URL}/${id}`, { method: 'DELETE', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('generates commands for schedules', done => {
                    var lightId = 1,
                        lightState = { on: true },
                        user = jsHueUser(fetch),
                        commands = user.scheduleCommandGenerator();

                    commands.setLightState(lightId, lightState).then(command => {
                        expect(command).toEqual({
                            address: `/api/${USER}/lights/${lightId}/state`,
                            method: 'PUT',
                            body: lightState
                        });
                        done();
                    });
                });
            });

            describe('scenes API', () => {
                const SCENES_URL = `${USER_URL}/scenes`;

                it('gets all scenes', done => {
                    var response = {
                            "4e1c6b20e-on-0": {
                                "name": "Kathy on 1449133269486",
                                "lights": ["2", "3"],
                                "owner": "83b7780291a6ceffbe0bd049104df",
                                "recycle": true,
                                "locked": false,
                                "appdata": {},
                                "picture": "",
                                "lastupdated": "2015-12-03T08:57:13",
                                "version": 1
                            },
                            "3T2SvsxvwteNNys": {
                                "name": "Cozy dinner",
                                "lights": ["1", "2"],
                                "owner": "83b7780291a6ceffbe0bd049104df",
                                "recycle": true,
                                "locked": false,
                                "appdata": {
                                    "version": 1,
                                    "data": "myAppData"
                                },
                                "picture": "",
                                "lastupdated": "2015-12-03T10:09:22",
                                "version": 2
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getScenes().then(data => {
                        expect(fetch).toHaveBeenCalledWith(SCENES_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('creates a scene', done => {
                    var body = {"name":"Romantic dinner", "lights":["1","2"], "recycle":true},
                        response = [{"success": {"id": "Abc123Def456Ghi"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.createScene(body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(SCENES_URL, { method: 'POST', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets scene attributes', done => {
                    var id = '74bc26d5f-on-0',
                        response = {
                            "name": "Cozy dinner",
                            "lights": ["1"],
                            "owner": "83b7780291a6ceffbe0bd049104df",
                            "recycle": true,
                            "locked": false,
                            "appdata": {},
                            "picture": "",
                            "lastupdated": "2015-12-03T10:09:22",
                            "version": 2,
                            "lightstates": {
                                "1": {
                                    "on": true,
                                    "bri": 237,
                                    "xy": [0.5806, 0.3903]
                                }
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getScene(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SCENES_URL}/${id}`, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets scene attributes', done => {
                    var id = '74bc26d5f-on-0',
                        body = {"name":"Cozy dinner", "lights":["3","2"], "storelightstate": true},
                        response = [
                            {"success": {"/scenes/74bc26d5f-on-0/name": "Cozy dinner"}},
                            {"success": {"/scenes/74bc26d5f-on-0/storelightstate": true}},
                            {"success": {"/scenes/74bc26d5f-on-0/lights": ["2", "3"]}}
                        ],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setScene(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SCENES_URL}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets scene light states', done => {
                    var sceneId = 'ab341ef24',
                        lightId = 1,
                        body = {"on":true,"ct":200},
                        response = [
                          {"success":{"address":"/scenes/ab341ef24/lights/1/state/on", "value":true}},
                          {"success":{"address":"/scenes/ab341ef24/lights/1/state/ct", "value":200}}
                        ],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setSceneLightState(sceneId, lightId, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SCENES_URL}/${sceneId}/lightstates/${lightId}`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('deletes a scene', done => {
                    var id = '3T2SvsxvwteNNys',
                        response = [{"success":"/scenes/3T2SvsxvwteNNys deleted"}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.deleteScene(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SCENES_URL}/${id}`, { method: 'DELETE', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });
            });

            describe('sensors API', () => {
                const SENSORS_URL = `${USER_URL}/sensors`;

                it('gets all sensors', done => {
                    var response = {
                            "1": {
                                "state": {
                                    "daylight": false,
                                    "lastupdated": "2014-06-27T07:38:51"
                                },
                                "config": {
                                    "on": true,
                                    "long": "none",
                                    "lat": "none",
                                    "sunriseoffset": 50,
                                    "sunsetoffset": 50
                                },
                                "name": "Daylight",
                                "type": "Daylight",
                                "modelid": "PHDL00",
                                "manufacturername": "Philips",
                                "swversion": "1.0"
                            },
                            "2": {
                                "state": {
                                    "buttonevent": 0,
                                    "lastupdated": "none"
                                },
                                "config": {
                                    "on": true
                                },
                                "name": "Tap Switch 2",
                                "type": "ZGPSwitch",
                                "modelid": "ZGPSWITCH",
                                "manufacturername": "Philips",
                                "uniqueid": "00:00:00:00:00:40:03:50-f2"
                            }

                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getSensors().then(data => {
                        expect(fetch).toHaveBeenCalledWith(SENSORS_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('creates a sensor', done => {
                    var body = {
                            "state": {
                                "presence": false
                            },
                            "name": "IP Camera living room",
                            "modelid": "IPSENSOR",
                            "swversion": "1.0",
                            "type": "CLIPPresence",
                            "uniqueid": "12345678",
                            "manufacturername": "TheManufacturer"
                        },
                        response = [{"success":{"id": "4"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.createSensor(body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(SENSORS_URL, { method: 'POST', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('searches for new sensors', done => {
                    var response = [{"success": {"/sensors": "Searching for new devices"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.searchForNewSensors().then(data => {
                        expect(fetch).toHaveBeenCalledWith(SENSORS_URL, { method: 'POST', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets new sensors', done => {
                    var response = {
                            "7": {"name": "Hue Tap 1"},
                            "8": {"name": " Button 3"},
                            "lastscan":"2013-05-22T10:24:00"
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getNewSensors().then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SENSORS_URL}/new`, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets sensor attributes and state', done => {
                    var id = 1,
                        response = {
                            "state":{
                                "buttonevent": 34,
                                "lastupdated": "2013-03-25T13:32:34",
                            },
                            "name": "Wall tap 1",
                            "modelid": "ZGPSWITCH",
                            "uniqueid": "01:23:45:67:89:AB-12",
                            "manufacturername": "Philips",
                            "swversion": "1.0",
                            "type": "ZGPSwitch"
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getSensor(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SENSORS_URL}/${id}`, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets sensor attributes', done => {
                    var id = 1,
                        body = {"name":"Bedroom Tap"},
                        response = [{"success":{"/sensors/1/name":"Bedroom Tap"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setSensor(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SENSORS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(body )});
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets sensor config', done => {
                    var id = 1,
                        body = {"on":true},
                        response = [{"success":{"/sensors/1/config/on":true}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setSensorConfig(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SENSORS_URL}/${id}/config`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets sensor state', done => {
                    var id = 1,
                        body = {"presence":false},
                        response = [{"success":{"/sensors/1/state/presence":false}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setSensorState(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SENSORS_URL}/${id}/state`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('deletes a sensor', done => {
                    var id = 1,
                        response = [{"success": "/sensors/1 deleted."}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.deleteSensor(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${SENSORS_URL}/${id}`, { method: 'DELETE', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });
            });

            describe('rules API', () => {
                const RULES_URL = `${USER_URL}/rules`;

                it('gets all rules', done => {
                    var response = {
                            "1": {
                                "name": "Wall Switch Rule",
                                "lasttriggered": "2013-10-17T01:23:20",
                                "creationtime": "2013-10-10T21:11:45",
                                "timestriggered": 27,
                                "owner": "83b7780291a6ceffbe0bd049104df",
                                "status": "enabled",
                                "conditions": [
                                    {
                                        "address": "/sensors/2/state/buttonevent",
                                        "operator": "eq",
                                        "value": "16"
                                    },
                                    {
                                        "address": "/sensors/2/state/lastupdated",
                                        "operator": "dx"
                                    }
                                ],
                                "actions": [
                                    {
                                        "address": "/groups/0/action",
                                        "method": "PUT",
                                        "body": {
                                            "scene": "S3"
                                        }
                                    }
                                ]
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getRules().then(data => {
                        expect(fetch).toHaveBeenCalledWith(RULES_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('creates a rule', done => {
                    var body = {
                            "name":"Wall Switch Rule",
                            "conditions":[
                                {"address":"/sensors/2/state/buttonevent","operator":"eq","value":"16"}
                            ],
                            "actions":[  
                                {"address":"/groups/0/action","method":"PUT", "body":{"scene":"S3"}}
                            ]
                        },
                        response = [{"success":{"id": "3"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.createRule(body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(RULES_URL, { method: 'POST', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets rule attributes', done => {
                    var id = 1,
                        response = {
                            "name": "Wall Switch Rule",
                            "owner": "83b7780291a6ceffbe0bd049104df",
                            "created": "2014-07-23T15:02:56",
                            "lasttriggered": "none",
                            "timestriggered": 0,
                            "status": "enabled",
                            "conditions": [
                                {
                                    "address": "/sensors/2/state/buttonevent",
                                    "operator": "eq",
                                    "value": "16"
                                },
                                {
                                    "address": "/sensors/2/state/lastupdated",
                                    "operator": "dx"
                                }
                            ],
                            "actions": [
                                {
                                    "address": "/groups/0/action",
                                    "method": "PUT",
                                    "body": {
                                        "scene": "S3"
                                    }
                                }
                            ]
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getRule(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${RULES_URL}/${id}`, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets rule attributes', done => {
                    var id = 1,
                        body = {
                            "actions": [
                                {
                                    "address": "/groups/0/action",
                                    "method": "PUT",
                                    "body": {
                                        "scene": "S3"
                                    }
                                }
                            ]
                        },
                        response = [
                            {
                                "success": {
                                    "/rules/1/actions": [
                                        {
                                            "address": "/groups/0/action",
                                            "method": "PUT",
                                            "body": {
                                                "scene": "S3"
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setRule(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${RULES_URL}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('deletes a rule', done => {
                    var id = 1,
                        response = [{"success": "/rules/1 deleted."}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.deleteRule(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${RULES_URL}/${id}`, { method: 'DELETE', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('generates actions for rules', done => {
                    var lightId = 1,
                        lightState = { on: true },
                        user = jsHueUser(fetch),
                        actions = user.ruleActionGenerator();

                    actions.setLightState(lightId, lightState).then(action => {
                        expect(action).toEqual({
                            address: `/lights/${lightId}/state`,
                            method: 'PUT',
                            body: lightState
                        });
                        done();
                    });
                });
            });

            describe('configuration API', () => {
                const CONFIG_URL = `${USER_URL}/config`;

                it('deletes a user', done => {
                    var id = '1234567890',
                        response = [{"success": "/config/whitelist/1234567890 deleted."}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.deleteUser(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${CONFIG_URL}/whitelist/${id}`, { method: 'DELETE', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets configuration', done => {
                    var response = {
                            "name": "Philips hue",
                            "zigbeechannel": 15,
                            "mac": "00:17:88:00:00:00",
                            "dhcp": true,
                            "ipaddress": "192.168.1.7",
                            "netmask": "255.255.255.0",
                            "gateway": "192.168.1.1",
                            "proxyaddress": "none",
                            "proxyport": 0,
                            "UTC": "2014-07-17T09:27:35",
                            "localtime": "2014-07-17T11:27:35",
                            "timezone": "Europe/Madrid",
                            "whitelist": {
                                "ffffffffe0341b1b376a2389376a2389": {
                                    "last use date": "2014-07-17T07:21:38",
                                    "create date": "2014-04-08T08:55:10",
                                    "name": "PhilipsHueAndroidApp#TCT ALCATEL ONE TOU"
                                },
                                "pAtwdCV8NZId25Gk": {
                                    "last use date": "2014-05-07T18:28:29",
                                    "create date": "2014-04-09T17:29:16",
                                    "name": "MyApplication"
                                },
                                "gDN3IaPYSYNPWa2H": {
                                    "last use date": "2014-05-07T09:15:21",
                                    "create date": "2014-05-07T09:14:38",
                                    "name": "iPhone Web 1"
                                }
                            },
                            "swversion": "01012917",
                            "apiversion": "1.3.0",
                            "swupdate": {
                                "updatestate": 2,
                                "checkforupdate": false,
                                "devicetypes": {
                                    "bridge": true,
                                    "lights": [
                                        "1",
                                        "2",
                                        "3"
                                    ]
                                },
                                "url": "",
                                "text": "010000000",
                                "notify": false
                            },
                            "linkbutton": false,
                            "portalservices": false,
                            "portalconnection": "connected",
                            "portalstate": {
                                "signedon": true,
                                "incoming": false,
                                "outgoing": true,
                                "communication": "disconnected"
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getConfig().then(data => {
                        expect(fetch).toHaveBeenCalledWith(CONFIG_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets configuration', done => {
                    var body = {"name":"My bridge"},
                        response = [{"success":{"/config/name":"My bridge"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setConfig(body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(CONFIG_URL, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets full state', done => {
                    var response = {
                            "lights": {
                                "1": {
                                    "state": {
                                        "on": false,
                                        "bri": 0,
                                        "hue": 0,
                                        "sat": 0,
                                        "xy": [0.0000, 0.0000],
                                        "ct": 0,
                                        "alert": "none",
                                        "effect": "none",
                                        "colormode": "hs",
                                        "reachable": true
                                    },
                                    "type": "Extended color light",
                                    "name": "Hue Lamp 1",
                                    "modelid": "LCT001",
                                    "swversion": "65003148",
                                    "pointsymbol": {
                                        "1": "none",
                                        "2": "none",
                                        "3": "none",
                                        "4": "none",
                                        "5": "none",
                                        "6": "none",
                                        "7": "none",
                                        "8": "none"
                                    }
                                },
                                "2": {
                                    "state": {
                                        "on": true,
                                        "bri": 254,
                                        "hue": 33536,
                                        "sat": 144,
                                        "xy": [0.3460, 0.3568],
                                        "ct": 201,
                                        "alert": "none",
                                        "effect": "none",
                                        "colormode": "hs",
                                        "reachable": true
                                    },
                                    "type": "Extended color light",
                                    "name": "Hue Lamp 2",
                                    "modelid": "LCT001",
                                    "swversion": "65003148",
                                    "pointsymbol": {
                                        "1": "none",
                                        "2": "none",
                                        "3": "none",
                                        "4": "none",
                                        "5": "none",
                                        "6": "none",
                                        "7": "none",
                                        "8": "none"
                                    }
                                }
                            },
                            "groups": {
                                "1": {
                                    "action": {
                                        "on": true,
                                        "bri": 254,
                                        "hue": 33536,
                                        "sat": 144,
                                        "xy": [0.3460, 0.3568],
                                        "ct": 201,
                                        "effect": "none",
                                        "colormode": "xy"
                                    },
                                    "lights": ["1", "2"],
                                    "name": "Group 1"
                                }
                            },
                            "config": {
                                "name": "Philips hue",
                                "mac": "00:00:88:00:bb:ee",
                                "dhcp": true,
                                "ipaddress": "192.168.1.74",
                                "netmask": "255.255.255.0",
                                "gateway": "192.168.1.254",
                                "proxyaddress": "",
                                "proxyport": 0,
                                "UTC": "2012-10-29T12:00:00",
                                "whitelist": {
                                    "1028d66426293e821ecfd9ef1a0731df": {
                                        "last use date": "2012-10-29T12:00:00",
                                        "create date": "2012-10-29T12:00:00",
                                        "name": "test user"
                                    }
                                },
                                "swversion": "01003372",
                                "swupdate": {
                                    "updatestate": 0,
                                    "url": "",
                                    "text": "",
                                    "notify": false
                                },
                                "linkbutton": false,
                                "portalservices": false
                            },
                            "schedules": {
                                "1": {
                                    "name": "schedule",
                                    "description": "",
                                    "command": {
                                        "address": "/api/<username>/groups/0/action",
                                        "body": {
                                            "on": true
                                        },
                                        "method": "PUT"
                                    },
                                    "time": "2012-10-29T12:00:00"
                                }
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getFullState().then(data => {
                        expect(fetch).toHaveBeenCalledWith(USER_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });
            });

            describe('resourcelinks API', () => {
                const LINKS_URL = `${USER_URL}/resourcelinks`;

                it('gets all resourcelinks', done => {
                    var response = {
                            "1": {
                                "name": "Sunrise",
                                "description": "Carla's wakeup experience",
                                "class": 1,
                                "owner": "83b7780291a6ceffbe0bd049104df",
                                "links": ["/schedules/2", "/schedules/3",
                                          "/scenes/ABCD", "/scenes/EFGH", "/groups/8"]
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getResourceLinks().then(data => {
                        expect(fetch).toHaveBeenCalledWith(LINKS_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('creates a resourcelink', done => {
                    var body = {
                            "name": "Sunrise",
                            "description": "Carla's wakeup experience",
                            "type":"Link",
                            "class": 1,
                            "owner": "83b7780291a6ceffbe0bd049104df",
                            "links": ["/schedules/2", "/schedules/3",
                                      "/scenes/ABCD", "/scenes/EFGH", "/groups/8"]
                        },
                        response = [{"success":{"id": "3"}}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.createResourceLink(body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(LINKS_URL, { method: 'POST', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('gets resourcelink attributes', done => {
                    var id = 1,
                        response = {
                            "name": "Sunrise",
                            "description": "Carla's wakeup experience",
                            "type":"Link",
                            "class": 1,
                            "owner": "83b7780291a6ceffbe0bd049104df",
                            "links": ["/schedules/2", "/schedules/3",
                                      "/scenes/ABCD", "/scences/EFGH", "/groups/8"]
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getResourceLink(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${LINKS_URL}/${id}`, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('sets resourcelink attributes', done => {
                    var id = 1,
                        body = {
                            "name": "Sunrise",
                            "description": "Carla's wakeup experience",
                        },
                        response = [
                            {"success": {"/resourcelinks/1/name": "Sunrise"}},
                            {"success": {"/resourcelinks/1/description": "Carla's wakeup experience"}}
                        ],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.setResourceLink(id, body).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${LINKS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
                        expect(data).toEqual(response);
                        done();
                    });
                });

                it('deletes a resourcelink', done => {
                    var id = 1,
                        response = [{"success": "/resourcelinks/1 deleted."}],
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.deleteResourceLink(id).then(data => {
                        expect(fetch).toHaveBeenCalledWith(`${LINKS_URL}/${id}`, { method: 'DELETE', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });
            });

            describe('capabilities API', () => {
                const CAPABILITIES_URL = `${USER_URL}/capabilities`;

                it('gets all capabilities', done => {
                    var response = {
                            "lights":{
                                "available": 10,
                            },
                            "sensors":{
                                "availble": 60,
                                "clip": {
                                    "available": 60,
                                },
                                "zll": {
                                    "available": 60,
                                },
                                "zgp": {
                                    "available": 60
                                }
                            },
                            "groups": {},
                            "scenes": {
                                "available": 100,
                                "lightstates": {
                                    "available": 1500
                                }
                            },
                            "rules": {},
                            "schedules": {},
                            "resourcelinks": {},
                            "whitelists": {},
                            "timezones": {
                                "values":[
                                    "Africa/Abidjan",
                                    "Africa/Accra",
                                     "Pacific/Wallis",
                                     "US/Pacific-New"
                                 ]
                            }
                        },
                        fetch = fetchSpy(response),
                        user = jsHueUser(fetch);

                    user.getCapabilities().then(data => {
                        expect(fetch).toHaveBeenCalledWith(CAPABILITIES_URL, { method: 'GET', body: null });
                        expect(data).toEqual(response);
                        done();
                    });
                });
            });

            describe('error handling', () => {
                it('propagates fetch errors through the promise chain', done => {
                    var message = 'fetch error',
                        fetch = fetchSpy({}).and.callFake(() => { throw new Error(message); }),
                        user = jsHueUser(fetch);

                    expect(() => {
                        user.getFullState().then(
                            () => {
                                fail('This should not be called');
                                done();
                            },
                            e => {
                                expect(e).toEqual(jasmine.any(Error));
                                expect(e.message).toBe(message);
                                done();
                            }
                        );
                    }).not.toThrow();
                });

                it('propagates json serialization errors through the promise chain', done => {
                    var circular = {};
                    circular.circular = circular;

                    var fetch = fetchSpy({}),
                        user = jsHueUser(fetch);

                    expect(() => {
                        user.setLight(1, circular).then(
                            () => {
                                fail('This should not be called');
                                done();
                            },
                            e => {
                                expect(e).toEqual(jasmine.any(Error));
                                done();
                            }
                        );
                    }).not.toThrow();
                });

                it('propagates json deserialization errors through the promise chain', done => {
                    var fetch = fetchSpy({}).and.callFake(() => Promise.resolve(new Response('{'))),
                        user = jsHueUser(fetch);

                    expect(() => {
                        user.getFullState().then(
                            () => {
                                fail('This should not be called');
                                done();
                            },
                            e => {
                                expect(e).toEqual(jasmine.any(Error));
                                done();
                            }
                        );
                    }).not.toThrow();
                });
            });
        });
    });
});
