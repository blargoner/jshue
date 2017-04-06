# jsHue

A simple JavaScript library for Philips Hue.

Version 2.0.0

Copyright 2013 - 2017, John Peloquin and the jsHue contributors.

## Introduction

jsHue is a simple JavaScript wrapper library for the Philips Hue API with a sane
object interface and without unnecessary dependencies. It is primarily intended
for use in modern web browsers, but with injection of suitable dependencies it
could also be used in other environments.

The following Hue APIs are supported (v1.17):
- Bridge discovery
- Lights
- Groups
- Schedules
- Scenes
- Sensors
- Rules
- Configuration
- Resourcelinks
- Capabilities

jsHue uses ES6, JSON, promises, and the fetch API. (If you need to run jsHue in
an older environment, consider v0.3.0.)

## Getting Started

To get started, instantiate jsHue:

```js
var hue = jsHue();
```

Then you can discover local bridges:

```js
hue.discover().then(bridges => {
    if(bridges.length === 0) {
        console.log('No bridges found. :(');
    }
    else {
        bridges.forEach(b => console.log('Bridge found at IP address %s.', b.internalipaddress));
    }
}).catch(e => console.log('Error finding bridges', e));
```

jsHue performs requests asynchronously and provides a promise interface. A promise
is resolved with the API response data (API success or error), and is rejected if
the request fails or there is an error with JSON serialization/deserialization.
Note API response data may contain a mixture of API success and error responses
from the bridge. You are responsible for handling any errors.

Once you have a local bridge IP address, you can create a user on the bridge with
a bridge-generated username (we omit error handling below):

```js
var bridge = hue.bridge('192.168.1.2');

// create user account (requires link button to be pressed)
bridge.createUser('myApp#testdevice').then(data => {
    // extract bridge-generated username from returned data
    var username = data[0].success.username;

    console.log('New username:', username);

    // instantiate user object with username
    var user = bridge.user(username);
});
```

Once authenticated, you can do anything with the API, like turn on a light:

```js
user.setLightState(1, { on: true }).then(data => {
    // process response data, do other things
});
```

For more details, see the source code. jsHue's object interface maps directly to
the API, so it is very straightforward to use.

## Contributors

- John Peloquin
- Tom Brewe
