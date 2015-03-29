# jsHue

A simple JavaScript library for Philips Hue.

Version 0.2.0.

Copyright (c) 2014 John Peloquin. All rights reserved.

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

```
var hue = jsHue();
```

Then you can discover local bridges:

```
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
a username (we omit success and error callbacks below):

```
var user = hue.bridge('192.168.1.2').user('foo');

// create user account (requires link button to be pressed)
user.create('foo application', ...);
```

Once authenticated, you can do anything with the API, like turn on a light:

```
user.setLightState(1, { on: true }, ...);
```

For more details, see the source code. jsHue's object interface maps directy to
the API, so it is very straightforward to use.

## Known Issues

- As of 2015-03-28, bridge discovery using ```hue.discover()``` as above does not work due to a [bug](http://www.developers.meethue.com/content/n-upnp-url-redirect-breaks-bridge-discovery-existing-applications) with the Philips N-UPnP API. Philips indicates that this bug should be fixed very soon. As a temporary workaround, you can change the URL from `https://www.meethue.com/api/nupnp` to `https://client-eastwood-dot-hue-prod-us.appspot.com/api/nupnp` in the jsHue source code. Thanks to [@megabytemb](https://github.com/megabytemb) for [reporting this](https://github.com/blargoner/jshue/pull/10) to me.
