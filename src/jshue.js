/**
 * jsHue
 * JavaScript library for Philips Hue.
 *
 * @author John Peloquin
 * @copyright Copyright (c) 2013 John Peloquin. All rights reserved.
 */

var jsHue = (function() {
    /**
     * Makes XHR request.
     */
    var _request = function(method, url, body, success, failure) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    success && success(xhr.responseText);
                }
                else {
                    // TODO
                    failure && failure();
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(body);
        return true;
    };

    /**
     * Makes XHR request with JSON.
     */
    var _requestJson = function(method, url, data, success, failure) {
        var _success = function(data) {
            try {
                data = JSON.parse(data);
            }
            catch(e) {
                // TODO
                failure && failure();
            }

            success && success(data);
        };

        if(data !== null) {
            try {
                data = JSON.stringify(data);
            }
            catch(e) {
                // TODO
                failure && failure();
            }
        }

        return _request(method, url, data, _success, failure);
    };

    /**
     * Makes XHR request with JSON (no body).
     */
    var _requestJsonUrl = function(method, url, success, failure) {
        return _requestJson(method, url, null, success, failure);
    };

    /**
     * Makes XHR GET, POST, PUT, and DELETE requests.
     */
    var _get = _requestJsonUrl.bind(null, 'GET');
    var _put = _requestJson.bind(null, 'PUT');
    var _post = _requestJson.bind(null, 'POST');
    var _delete = _requestJsonUrl.bind(null, 'DELETE');

    /**
     * Constructs URL.
     */
    var _url = function() {
        return Array.prototype.slice.call(arguments, 0).join('/');
    };

    return {
        /**
         * Discovers local bridges.
         */
        discover: _get.bind(null, 'http://www.meethue.com/api/nupnp'),
        /**
         * Creates bridge object.
         */
        bridge: function(ip) {
            var bridgeUrl = _url('http:/', ip, 'api');
            return {
                /**
                 * Creates user object.
                 */
                user: function(username) {
                    var userUrl = _url(bridgeUrl, username);
                    return {
                        /**
                         * Creates current user in bridge whitelist.
                         */
                        create: function(type, success, failure) {
                            var data = {
                                username: username,
                                devicetype: type
                            };
                            return _post(bridgeUrl, data, success, failure);
                        },
                        /**
                         * Deletes user from bridge whitelist.
                         */
                        deleteUser: function(username, success, failure) {
                            return _delete(_url(userUrl, 'config', 'whitelist', username), success, failure);
                        },
                        /**
                         * Gets bridge configuration.
                         */
                        getConfig: _get.bind(null, _url(userUrl, 'config')),
                        /**
                         * Sets bridge configuration.
                         */
                        setConfig: _put.bind(null, _url(userUrl, 'config')),
                        /**
                         * Gets bridge full state.
                         */
                        getFullState: _get.bind(null, userUrl)

                        // TODO: lights
                        // TODO: groups
                        // TODO: schedules
                    };
                }
            };
        }
    };

}());
