/**
 * jsHue
 * JavaScript library for Philips Hue.
 *
 * @module jshue
 * @version 0.1.0
 * @author John Peloquin
 * @copyright Copyright (c) 2013 John Peloquin. All rights reserved.
 */

/**
 * jsHue API class.
 *
 * @class jsHueAPI
 * @constructor
 * @param {Function} XMLHttpRequest XHR dependency
 * @param {Object} JSON JSON dependency
 * @return {Object} instance
 */
var jsHueAPI = function(XMLHttpRequest, JSON) {
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
            return data[k] ? data[k] : t;
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
     * Performs XHR request.
     *
     * The success callback receives the response text, and the failure callback
     * receives an error object of the following form:
     *
     * { type: 'xhr', code: ..., message: ... }
     *
     * @method _request
     * @private
     * @param {String} method GET, PUT, POST, or DELETE
     * @param {String} url request URL
     * @param {String} body request body
     * @param {Function} success success callback
     * @param {Function} failure failure callback
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _request = function(method, url, body, success, failure) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    success && success(xhr.responseText);
                }
                else {
                    failure && failure({ type: 'xhr', code: xhr.status, message: xhr.statusText });
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(body);
        return true;
    };

    /**
     * Performs XHR request with JSON.
     *
     * The success callback receives an object of parsed response JSON, and the
     * failure callback receives an error object of the following form:
     *
     * { type: 'json', message: ... }
     *
     * @method _requestJson
     * @private
     * @param {String} method GET, PUT, POST, or DELETE
     * @param {String} url request URL
     * @param {Object} data request data object to serialize for request JSON 
     * @param {Function} success success callback
     * @param {Function} failure failure callback
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _requestJson = function(method, url, data, success, failure) {
        var _success = function(data) {
            try {
                data = JSON.parse(data);
            }
            catch(e) {
                failure && failure({ type: 'json', message: e.message });
                return;
            }

            success && success(data);
        };

        if(data !== null) {
            try {
                data = JSON.stringify(data);
            }
            catch(e) {
                failure && failure({ type: 'json', message: e.message });
                return false;
            }
        }

        return _request(method, url, data, _success, failure);
    };

    /**
     * Performs XHR request with JSON (no body).
     *
     * @method _requestJsonUrl
     * @private
     * @param {String} method GET, PUT, POST, or DELETE
     * @param {String} url request URL
     * @param {Function} success success callback
     * @param {Function} failure failure callback
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _requestJsonUrl = function(method, url, success, failure) {
        return _requestJson(method, url, null, success, failure);
    };

    /**
     * Performs XHR GET.
     *
     * @method _get
     * @private
     * @param {String} url request URL
     * @param {Function} success success callback
     * @param {Function} failure failure callback
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _get = _requestJsonUrl.bind(null, 'GET');

    /**
     * Performs XHR PUT.
     *
     * @method _put
     * @private
     * @param {String} url request URL
     * @param {Object} data request data object
     * @param {Function} success success callback
     * @param {Function} failure failure callback
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _put = _requestJson.bind(null, 'PUT');

    /**
     * Performs XHR POST.
     *
     * @method _post
     * @private
     * @param {String} url request URL
     * @param {Object} data request data object
     * @param {Function} success success callback
     * @param {Function} failure failure callback
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _post = _requestJson.bind(null, 'POST');

    /**
     * Performs XHR DELETE.
     *
     * @method _delete
     * @private
     * @param {String} url request URL
     * @param {Function} success success callback
     * @param {Function} failure failure callback
     * @return {Boolean} true if request was sent, false otherwise
     */
    var _delete = _requestJsonUrl.bind(null, 'DELETE');

    /**
     * Creates a parametrized XHR request function.
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
         * @param {Function} success success callback
         * @param {Function} failure failure callback
         * @return {Boolean} true if request was sent, false otherwise
         */
        discover: _get.bind(null, 'http://www.meethue.com/api/nupnp'),
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
                        _configUrl = _slash(_userUrl, 'config'),
                        _lightsUrl = _slash(_userUrl, 'lights'),
                        _groupsUrl = _slash(_userUrl, 'groups'),
                        _schedulesUrl = _slash(_userUrl, 'schedules');

                    var _objectUrl = function(baseUrl) {
                        return function(id) {
                            return _slash(baseUrl, id);
                        };
                    };

                    var _lightUrl = _objectUrl(_lightsUrl),
                        _groupUrl = _objectUrl(_groupsUrl),
                        _scheduleUrl = _objectUrl(_schedulesUrl);

                    return {
                        /* ================================================== */
                        /* Configuration API                                  */
                        /* ================================================== */

                        /**
                         * Creates current user in bridge whitelist.
                         *
                         * @method create
                         * @param {String} type device type
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        create: function(type, success, failure) {
                            var data = {
                                username: username,
                                devicetype: type
                            };
                            return _post(_bridgeUrl, data, success, failure);
                        },
                        /**
                         * Deletes user from bridge whitelist.
                         *
                         * @method deleteUser
                         * @param {String} username username
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        deleteUser: _parametrize(_delete, function(username) {
                            return _slash(_configUrl, 'whitelist', username);
                        }),
                        /**
                         * Gets bridge configuration.
                         *
                         * @method getConfig
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getConfig: _get.bind(null, _configUrl),
                        /**
                         * Sets bridge configuration.
                         *
                         * @method setConfig
                         * @param {Object} data config data
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setConfig: _put.bind(null, _configUrl),
                        /**
                         * Gets bridge full state.
                         *
                         * @method getFullState
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
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
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getLights: _get.bind(null, _lightsUrl),
                        /**
                         * Gets new lights.
                         *
                         * @method getNewLights
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getNewLights: _get.bind(null, _slash(_lightsUrl, 'new')),
                        /**
                         * Searches for new lights.
                         *
                         * @method searchForNewLights
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        searchForNewLights: _post.bind(null, _lightsUrl, null),
                        /**
                         * Gets light attributes and state.
                         *
                         * @method getLight
                         * @param {Number} id light ID
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getLight: _parametrize(_get, _lightUrl),
                        /**
                         * Sets light attributes.
                         *
                         * @method setLight
                         * @param {Number} id light ID
                         * @param {Object} data attribute data 
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setLight: _parametrize(_put, _lightUrl),
                        /**
                         * Sets light state.
                         *
                         * @method setLightState
                         * @param {Number} id light ID
                         * @param {Object} data state data
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
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
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getGroups: _get.bind(null, _groupsUrl),
                        /**
                         * Gets group attributes.
                         *
                         * @method getGroup
                         * @param {Number} id group ID
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getGroup: _parametrize(_get, _groupUrl),
                        /**
                         * Sets group attributes.
                         *
                         * @method setGroup
                         * @param {Number} id group ID
                         * @param {Object} data attribute data
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setGroup: _parametrize(_put, _groupUrl),
                        /**
                         * Sets group state.
                         *
                         * @method setGroupState
                         * @param {Number} id group ID
                         * @param {Object} data state data
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setGroupState: _parametrize(_put, function(id) {
                            return _slash(_groupUrl(id), 'action');
                        }),

                        /* ================================================== */
                        /* Schedules API                                      */
                        /* ================================================== */

                        /**
                         * Gets schedules.
                         *
                         * @method getSchedules
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getSchedules: _get.bind(null, _schedulesUrl),
                        /**
                         * Creates a schedule.
                         *
                         * @method createSchedule
                         * @param {Object} data schedule data
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        createSchedule: _post.bind(null, _schedulesUrl),
                        /**
                         * Gets schedule attributes.
                         *
                         * @method getSchedule
                         * @param {Number} id schedule ID
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        getSchedule: _parametrize(_get, _scheduleUrl),
                        /**
                         * Sets schedule attributes.
                         *
                         * @method setSchedule
                         * @param {Number} id schedule ID
                         * @param {Object} data schedule data
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        setSchedule: _parametrize(_put, _scheduleUrl),
                        /**
                         * Deletes a schedule.
                         *
                         * @method deleteSchedule
                         * @param {Number} id schedule ID
                         * @param {Function} success success callback
                         * @param {Function} failure failure callback
                         * @return {Boolean} true if request was sent, false otherwise
                         */
                        deleteSchedule: _parametrize(_delete, _scheduleUrl)
                    };
                }
            };
        }
    };
};

if(typeof XMLHttpRequest !== 'undefined' && typeof JSON !== 'undefined') {
    /**
     * jsHue class.
     * 
     * @class jsHue 
     * @extends jsHueAPI
     * @constructor 
     * @return {Object} instance 
     */
    var jsHue = jsHueAPI.bind(null, XMLHttpRequest, JSON);
}
