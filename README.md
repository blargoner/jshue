# jsHue

A simple JavaScript library for Philips Hue.

Version 1.0.0

Copyright (c) 2015 John Peloquin (original code). All rights reserved.
Copyright (c) 2017 Tom Brewe (fetch and Promise API changes)

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
hue.discover().then(bridges => {
    
    if(bridges.length === 0) {
        console.log('No bridges found. :(');
    }
    else {
        bridges.forEach(function(b) {
            console.log('Bridge found at IP address %s.', b.internalipaddress);
        });
    }
    
}
).catch((err) => {console.log('Error finding bridges', err)});
```

jsHue-promise performs requests asynchronously and provides a Promise interface. You can `catch` errors as usual, like in the example below.

Once you have a local bridge IP address, you can create a user on the bridge with a bridge-generated username (we omit error callbacks below):

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
user.setLightState(1, { on: true }).then( data => { /* ... */ });
```

For more details, see the source code. jsHue's object interface maps direclty to the API, so it is very straightforward to use.
