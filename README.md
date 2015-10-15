# jsHue

A simple JavaScript library for Philips Hue.

Version 0.3.0.

Copyright (c) 2015 John Peloquin. All rights reserved.

## Introduction

jsHue is a simple JavaScript wrapper library for the Philips Hue API with a sane
object interface and without unnecessary dependencies. It is primarily intended
for use in modern web browsers supporting XHR and JSON, but with injection of
suitable dependencies it could also be used in other environments like Node.js.

The following Hue APIs are supported:
- Bridge discovery
- Lights
- Groups
- Schedules
- Scenes
- Sensors
- Rules
- Configuration
- Info

## Getting Started

To get started, instantiate jsHue:

```js
var hue = jsHue();
```

Then you can discover local bridges:

```js
hue.discover(
    function(bridges) {
        if(bridges.length === 0) {
            console.log('No bridges found. :(');
        }
        else {
            bridges.forEach(function(b) {
                console.log('Bridge found at IP address %s.', b.internalipaddress);
            });
        }
    },
    function(error) {
        console.error(error.message);
    }
);
```

jsHue performs requests asynchronously and provides a callback interface. The
failure callback is called if the XHR request fails, or if there is an error with
the JSON serialization or deserialization. All API success and error results are
returned in the success callback data. (This is because some API calls may return
aggregated API success and error results.)

Once you have a local bridge IP address, you can create a user on the bridge with
a bridge-generated username (we omit error callbacks below):

```js
var bridge = hue.bridge('192.168.1.2');

// create user account (requires link button to be pressed)
bridge.createUser('foo application', function(data) {
    // extract bridge-generated username from returned data
    var username = data[0].success.username;

    console.log('New username:', username);

    // instantiate user object with username
    var user = bridge.user(username);
});
```

Once authenticated, you can do anything with the API, like turn on a light:

```js
user.setLightState(1, { on: true }, function(data) { /* ... */ });
```

For more details, see the source code. jsHue's object interface maps directy to
the API, so it is very straightforward to use.
