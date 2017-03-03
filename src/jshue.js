/**
 * jsHue
 * JavaScript library for Philips Hue.
 *
 * @module jshue
 * @version 0.3.0
 * @author John Peloquin
 * @copyright Copyright (c) 2013 John Peloquin. All rights reserved.
 */

/**
 * jsHue API class.
 *
 * @class jsHueAPI
 * @constructor
 * @param {Function} fetch fetch dependency
 * @param {Object} JSON JSON dependency
 * @return {Object} instance
 */
var jsHueAPI = function(fetch, JSON) {
    /**
     * Substitutes strings for URLs.
     *
     * Example: _sub('http://{host}/bar', { host: 'foo' }) returns 'http://foo/bar'.
     *
     * @method _sub
     * @private
     * @param {String} str input string
     * @param {Object} data key/value substitutions
     * @return {String} output string
     */
    var _sub = function(str, data) {
        return str.replace(/\{(\w+)\}/g, function(t, k) {
            return data[k] || t;
        });
    };

    /**
     * Concatenates strings for URLs.
     *
     * Example: _slash('foo', 'bar') returns 'foo/bar'.
     *
     * @method _slash
     * @private
     * @param {String} [part]* input strings
     * @return {String}  output string
     */
    var _slash = function() {
        return Array.prototype.slice.call(arguments, 0).join('/');
    };

    

    /**
     *
     * @method _requestJson
     * @private
     * @param {String} method GET, PUT, POST, or DELETE
     * @param {String} url request URL
     * @param {Object} data request data object to serialize for request JSON
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _requestJson = function(method, url, data) {

        if(data !== null) {
            data = JSON.stringify(data);
        }

        return fetch(url, {method, data}).then(blob => blob.json());
        
    };

    /**
     * Performs fetch request with JSON (no body).
     *
     * @method _requestJsonUrl
     * @private
     * @param {String} method GET, PUT, POST, or DELETE
     * @param {String} url request URL
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _requestJsonUrl = function(method, url) {
        return _requestJson(method, url);
    };

    /**
     * Performs fetch GET.
     *
     * @method _get
     * @private
     * @param {String} url request URL
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _get = _requestJsonUrl.bind(null, 'GET');

    /**
     * Performs fetch PUT.
     *
     * @method _put
     * @private
     * @param {String} url request URL
     * @param {Object} data request data object
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _put = _requestJson.bind(null, 'PUT');

    /**
     * Performs fetch POST.
     *
     * @method _post
     * @private
     * @param {String} url request URL
     * @param {Object} data request data object
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _post = _requestJson.bind(null, 'POST');

    /**
     * Performs fetch DELETE.
     *
     * @method _delete
     * @private
     * @param {String} url request URL
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _delete = _requestJsonUrl.bind(null, 'DELETE');

    /**
     * Creates a parametrized fetch request function.
     *
     * The given request URL generator function should generate a request URL from
     * a single input parameter. For example:
     *
     * function(id) { return 'http://path/to/resource/' + id; }
     *
     * The returned parametrized request function takes this same input parameter
     * plus the remaining parameters of the given request function. For example, a
     * parametrized _get or _delete will have the following signature:
     *
     * function(id, success, callback)
     *
     * A parametrized _put or _post will have the following signature:
     *
     * function(id, data, success, callback)
     *
     * These functions will make appropriate requests to the URLs generated from the
     * first input parameter.
     *
     * @method _parametrize
     * @private
     * @param {Function} method request function (_get, _put, _post, or _delete)
     * @param {Function} url request URL generator function
     * @return {Function} parametrized request function
     */
    var _parametrize = function(method, url) {
        return function(p) {
            return method.apply(null, [url(p)].concat(Array.prototype.slice.call(arguments, 1)));
        };
    };

    return {
        /* ================================================== */
        /* Portal API                                         */
        /* ================================================== */

        /**
         * Discovers local bridges.
         *
         * @method discover
         * @return {Boolean} true if request was sent, false otherwise
         */
        discover: _get.bind(null, 'https://www.meethue.com/api/nupnp'),
        /**
         * Creates bridge object (jsHueBridge).
         *
         * @method bridge
         * @param {String} ip ip address or hostname of bridge
         * @return {Object} bridge object
         */
        bridge: function(ip) {
            /**
             * @class jsHueBridge
             */
            var _bridgeUrl = _sub('http://{ip}/api', { ip: ip });
            return {
                /**
                 * Creates new user in bridge whitelist.
                 *
                 * @method createUser
                 * @param {String} type device type
                 * @return {Boolean} true if request was sent, false otherwise
                 */
                createUser: function(type) {
                    var data = {
                        devicetype: type
                    };
                    return _post(_bridgeUrl, data);
                },

                /**
                 * Creates user object (jsHueUser).
                 *
                 * @method user
                 * @param {String} username username
                 * @return {Object} user object
                 */
                user: function(username) {
                    /**
                     * @class jsHueUser
                     */
                    var _userUrl = _slash(_bridgeUrl, username),
                        _infoUrl = _slash(_userUrl, 'info'),
                        _configUrl = _slash(_userUrl, 'config'),
                        _lightsUrl = _slash(_userUrl, 'lights'),
                        _groupsUrl = _slash(_userUrl, 'groups'),
                        _schedulesUrl = _slash(_userUrl, 'schedules'),
                        _scenesUrl = _slash(_userUrl, 'scenes'),
                        _sensorsUrl = _slash(_userUrl, 'sensors'),
                        _rulesUrl = _slash(_userUrl, 'rules');

                    var _objectUrl = function(baseUrl) {
                        return function(id) {
                            return _slash(baseUrl, id);
                        };
                    };

                    var _lightUrl = _objectUrl(_lightsUrl),
                        _groupUrl = _objectUrl(_groupsUrl),
                        _scheduleUrl = _objectUrl(_schedulesUrl),
                        _sceneUrl = _objectUrl(_scenesUrl),
                        _sensorUrl = _objectUrl(_sensorsUrl),
                        _ruleUrl = _objectUrl(_rulesUrl);

                    return {
                        /* ================================================== */
                        /* Info API                                           */
                        /* ================================================== */

                        /**
                         * Gets bridge timezones.
                         *
                         * @method getTimezones
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getTimezones: _get.bind(null, _slash(_infoUrl, 'timezones')),

                        /* ================================================== */
                        /* Configuration API                                  */
                        /* ================================================== */

                        /**
                         * Creates current user in bridge whitelist.
                         *
                         * @method create
                         * @param {String} type device type
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        create: function(type) {
                            var data = {
                                username: username,
                                devicetype: type
                            };
                            return _post(_bridgeUrl, data);
                        },
                        /**
                         * Deletes user from bridge whitelist.
                         *
                         * @method deleteUser
                         * @param {String} username username
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        deleteUser: _parametrize(_delete, function(username) {
                            return _slash(_configUrl, 'whitelist', username);
                        }),
                        /**
                         * Gets bridge configuration.
                         *
                         * @method getConfig
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getConfig: _get.bind(null, _configUrl),
                        /**
                         * Sets bridge configuration.
                         *
                         * @method setConfig
                         * @param {Object} data config data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setConfig: _put.bind(null, _configUrl),
                        /**
                         * Gets bridge full state.
                         *
                         * @method getFullState
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getFullState: _get.bind(null, _userUrl),

                        /* ================================================== */
                        /* Lights API                                         */
                        /* ================================================== */

                        /**
                         * Gets lights.
                         *
                         * @method getLights
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getLights: _get.bind(null, _lightsUrl),
                        /**
                         * Gets new lights.
                         *
                         * @method getNewLights
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getNewLights: _get.bind(null, _slash(_lightsUrl, 'new')),
                        /**
                         * Searches for new lights.
                         *
                         * @method searchForNewLights
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        searchForNewLights: _post.bind(null, _lightsUrl, null),
                        /**
                         * Gets light attributes and state.
                         *
                         * @method getLight
                         * @param {Number} id light ID
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getLight: _parametrize(_get, _lightUrl),
                        /**
                         * Sets light attributes.
                         *
                         * @method setLight
                         * @param {Number} id light ID
                         * @param {Object} data attribute data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setLight: _parametrize(_put, _lightUrl),
                        /**
                         * Sets light state.
                         *
                         * @method setLightState
                         * @param {Number} id light ID
                         * @param {Object} data state data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setLightState: _parametrize(_put, function(id) {
                            return _slash(_lightUrl(id), 'state');
                        }),

                        /* ================================================== */
                        /* Groups API                                         */
                        /* ================================================== */

                        /**
                         * Gets groups.
                         *
                         * @method getGroups
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getGroups: _get.bind(null, _groupsUrl),
                        /**
                         * Creates a group.
                         *
                         * @method createGroup
                         * @param {Object} data group data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        createGroup: _post.bind(null, _groupsUrl),
                        /**
                         * Gets group attributes.
                         *
                         * @method getGroup
                         * @param {Number} id group ID
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getGroup: _parametrize(_get, _groupUrl),
                        /**
                         * Sets group attributes.
                         *
                         * @method setGroup
                         * @param {Number} id group ID
                         * @param {Object} data attribute data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setGroup: _parametrize(_put, _groupUrl),
                        /**
                         * Sets group state.
                         *
                         * @method setGroupState
                         * @param {Number} id group ID
                         * @param {Object} data state data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setGroupState: _parametrize(_put, function(id) {
                            return _slash(_groupUrl(id), 'action');
                        }),
                        /**
                         * Deletes a group.
                         *
                         * @method deleteGroup
                         * @param {Number} id group ID
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        deleteGroup: _parametrize(_delete, _groupUrl),

                        /* ================================================== */
                        /* Schedules API                                      */
                        /* ================================================== */

                        /**
                         * Gets schedules.
                         *
                         * @method getSchedules
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getSchedules: _get.bind(null, _schedulesUrl),
                        /**
                         * Creates a schedule.
                         *
                         * @method createSchedule
                         * @param {Object} data schedule data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        createSchedule: _post.bind(null, _schedulesUrl),
                        /**
                         * Gets schedule attributes.
                         *
                         * @method getSchedule
                         * @param {Number} id schedule ID
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getSchedule: _parametrize(_get, _scheduleUrl),
                        /**
                         * Sets schedule attributes.
                         *
                         * @method setSchedule
                         * @param {Number} id schedule ID
                         * @param {Object} data schedule data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setSchedule: _parametrize(_put, _scheduleUrl),
                        /**
                         * Deletes a schedule.
                         *
                         * @method deleteSchedule
                         * @param {Number} id schedule ID
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        deleteSchedule: _parametrize(_delete, _scheduleUrl),

                        /* ================================================== */
                        /* Scenes API                                         */
                        /* ================================================== */

                        /**
                         * Gets scenes.
                         *
                         * @method getScenes
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getScenes: _get.bind(null, _scenesUrl),
                        /**
                         * Creates or updates a scene.
                         *
                         * @method setScene
                         * @param {String} id scene ID
                         * @param {Object} data scene data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setScene: _parametrize(_put, _sceneUrl),
                        /**
                         * Modifies the state of a light in a scene.
                         *
                         * @method setSceneLightState
                         * @param {String} sceneId scene ID
                         * @param {Number} lightId light ID
                         * @param {Object} data scene light state data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setSceneLightState: function(sceneId, lightId, data, success, callback) {
                            return _put(_slash(_sceneUrl(sceneId), 'lights', lightId, 'state'), data, success, callback);
                        },

                        /* ================================================== */
                        /* Sensors API                                        */
                        /* ================================================== */
 
                        /**
                         * Gets sensors.
                         *
                         * @method getSensors
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getSensors: _get.bind(null, _sensorsUrl),
                        /**
                         * Creates a sensor.
                         *
                         * @method createSensor
                         * @param {Object} data sensor data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        createSensor: _post.bind(null, _sensorsUrl),
                        /**
                         * Searches for new sensors.
                         *
                         * @method searchForNewSensors
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        searchForNewSensors: _post.bind(null, _sensorsUrl, null),
                        /**
                         * Gets new sensors since last search.
                         *
                         * @method getNewSensors
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getNewSensors: _get.bind(null, _slash(_sensorsUrl, 'new')),
                        /**
                         * Gets sensor attributes and state.
                         *
                         * @method getSensor
                         * @param {Number} id sensor ID
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getSensor: _parametrize(_get, _sensorUrl),
                        /**
                         * Sets sensor attributes.
                         *
                         * @method setSensor
                         * @param {Number} id sensor ID
                         * @param {Object} data attribute data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setSensor: _parametrize(_put, _sensorUrl),
                        /**
                         * Sets sensor configuration.
                         *
                         * @method setSensorConfig
                         * @param {Number} id sensor ID
                         * @param {Object} data config data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setSensorConfig: _parametrize(_put, function(id) {
                            return _slash(_sensorUrl(id), 'config');
                        }),
                        /**
                         * Sets sensor state.
                         *
                         * @method setSensorState
                         * @param {Number} id sensor ID
                         * @param {Object} data state data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setSensorState: _parametrize(_put, function(id) {
                            return _slash(_sensorUrl(id), 'state');
                        }),
                        /**
                         * Deletes a sensor.
                         *
                         * May not be supported by the bridge.
                         *
                         * @method deleteSensor
                         * @param {Number} id sensor ID
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        deleteSensor: _parametrize(_delete, _sensorUrl),

                        /* ================================================== */
                        /* Rules API                                          */
                        /* ================================================== */

                        /**
                         * Gets rules.
                         *
                         * @method getRules
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getRules: _get.bind(null, _rulesUrl),
                        /**
                         * Creates a rule.
                         *
                         * @method createRule
                         * @param {Object} data rule data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        createRule: _post.bind(null, _rulesUrl),
                        /**
                         * Gets rule attributes.
                         *
                         * @method getRule
                         * @param {Number} id rule ID
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getRule: _parametrize(_get, _ruleUrl),
                        /**
                         * Sets rule attributes.
                         *
                         * @method setRule
                         * @param {Number} id rule ID
                         * @param {Object} data rule data
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setRule: _parametrize(_put, _ruleUrl),
                        /**
                         * Deletes a rule.
                         *
                         * @method deleteRule
                         * @param {Number} id rule ID
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        deleteRule: _parametrize(_delete, _ruleUrl)
                    };
                }
            };
        }
    };
};

if(typeof fetch !== 'undefined' && typeof JSON !== 'undefined') {
    /**
     * jsHue class.
     *
     * @class jsHue
     * @extends jsHueAPI
     * @constructor
     * @return {Object} instance
     */
    var jsHue = jsHueAPI.bind(null, fetch, JSON);
}
