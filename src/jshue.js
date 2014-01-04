/**
 * jsHue
 * JavaScript library for Philips Hue.
 *
 * @author John Peloquin
 * @copyright Copyright (c) 2013 John Peloquin. All rights reserved.
 */

var jsHueAPI = function(XMLHttpRequest, JSON) {
    /**
     * Substitutes strings for URLs.
     */
    var _sub = function(str, data) {
        return str.replace(/\{(\w+)\}/g, function(t, k) {
            return data[k] ? data[k] : t;
        });
    };

    /**
     * Concatenates strings for URLs.
     */
    var _slash = function() {
        return Array.prototype.slice.call(arguments, 0).join('/');
    };

    /**
     * Performs XHR request.
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
     */
    var _requestJsonUrl = function(method, url, success, failure) {
        return _requestJson(method, url, null, success, failure);
    };

    /**
     * Performs XHR GET, PUT, POST and DELETE requests.
     */
    var _get = _requestJsonUrl.bind(null, 'GET');
    var _put = _requestJson.bind(null, 'PUT');
    var _post = _requestJson.bind(null, 'POST');
    var _delete = _requestJsonUrl.bind(null, 'DELETE');

    /**
     * Creates a parametrized XHR request function.
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
         */
        discover: _get.bind(null, 'http://www.meethue.com/api/nupnp'),
        /**
         * Creates bridge object.
         */
        bridge: function(ip) {
            var _bridgeUrl = _sub('http://{ip}/api', { ip: ip });
            return {
                /**
                 * Creates user object.
                 */
                user: function(username) {
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
                         */
                        deleteUser: _parametrize(_delete, function(username) {
                            return _slash(_configUrl, 'whitelist', username);
                        }),
                        /**
                         * Gets bridge configuration.
                         */
                        getConfig: _get.bind(null, _configUrl),
                        /**
                         * Sets bridge configuration.
                         */
                        setConfig: _put.bind(null, _configUrl),
                        /**
                         * Gets bridge full state.
                         */
                        getFullState: _get.bind(null, _userUrl),

                        /* ================================================== */
                        /* Lights API                                         */
                        /* ================================================== */

                        /**
                         * Gets lights.
                         */
                        getLights: _get.bind(null, _lightsUrl),
                        /**
                         * Gets new lights.
                         */
                        getNewLights: _get.bind(null, _slash(_lightsUrl, 'new')),
                        /**
                         * Searches for new lights.
                         */
                        searchForNewLights: _post.bind(null, _lightsUrl, null),
                        /**
                         * Gets light attributes and state.
                         */
                        getLight: _parametrize(_get, _lightUrl),
                        /**
                         * Sets light attributes.
                         */
                        setLight: _parametrize(_put, _lightUrl),
                        /**
                         * Sets light state.
                         */
                        setLightState: _parametrize(_put, function(id) {
                            return _slash(_lightUrl(id), 'state');
                        }),

                        /* ================================================== */
                        /* Groups API                                         */
                        /* ================================================== */

                        /**
                         * Gets groups.
                         */
                        getGroups: _get.bind(null, _groupsUrl),
                        /**
                         * Gets group attributes.
                         */
                        getGroup: _parametrize(_get, _groupUrl),
                        /**
                         * Sets group attributes.
                         */
                        setGroup: _parametrize(_put, _groupUrl),
                        /**
                         * Sets group state.
                         */
                        setGroupState: _parametrize(_put, function(id) {
                            return _slash(_groupUrl(id), 'action');
                        }),

                        /* ================================================== */
                        /* Schedules API                                      */
                        /* ================================================== */

                        /**
                         * Gets schedules.
                         */
                        getSchedules: _get.bind(null, _schedulesUrl),
                        /**
                         * Creates a schedule.
                         */
                        createSchedule: _post.bind(null, _schedulesUrl),
                        /**
                         * Gets schedule attributes.
                         */
                        getSchedule: _parametrize(_get, _scheduleUrl),
                        /**
                         * Sets schedule attributes.
                         */
                        setSchedule: _parametrize(_put, _scheduleUrl),
                        /**
                         * Deletes a schedule.
                         */
                        deleteSchedule: _parametrize(_delete, _scheduleUrl)
                    };
                }
            };
        }
    };
};

if(typeof XMLHttpRequest !== 'undefined' && typeof JSON !== 'undefined') {
    jsHue = jsHueAPI.bind(null, XMLHttpRequest, JSON);
}
