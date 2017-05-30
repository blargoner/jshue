# jsHue

A simple JavaScript library for Philips Hue.

Version 2.1.1

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

[Download jsHue](https://github.com/blargoner/jshue/releases) and include the source
file in your HTML:

```html
<script src="path/to/jshue.js"></script>
```

Then instantiate jsHue in your JS code:

```js
var hue = jsHue();
```

<details>
<summary>Alternatively, you can install jsHue with a package manager like npm
or yarn (click arrow to show details):</summary>

```sh
npm install --save jshue # or: yarn add jshue
```

Then you can import or require the module when using a bundler like webpack,
rollup, or browserify:

```js
import jsHue from 'jsHue';
var hue = jsHue();
```

Or:

```js
var jsHue = require('jsHue'),
    hue = jsHue();
```
</details>

---

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

Or set the color:

```js
user.setLightState(3, { bri: 128, hue: Math.round(Math.random() * 65000) }).then(data => {
    // process response data, do other things
});
```

For more details, see the source code. jsHue's object interface maps directly to
the API, so it is very straightforward to use.

## Experimental features
These features may be changed or removed entirely.

### Schedule command generator
jsHue provides a command generator which simplifies the creation of schedules.
The generator exposes the same interface as the user object above, but when an
API method is called no request is made to the bridge and the returned promise
resolves to an object describing the API request itself, suitable for use as
the command in a schedule.

For example, you can turn on light 1 at a specific time as follows:

```js
var user = jsHue().bridge('192.168.1.1').user('myUser'),
    generateCommand = user.scheduleCommandGenerator();

generateCommand.setLightState(1, { on: true })
    .then(command => user.createSchedule({
        name: 'My schedule',
        localtime: '2017-04-08T01:00:00',
        command
    }));
```

### Rule action generator
Similarly, there is an action generator which simplifies the creation of rules.

For example, you can turn on lights 1 and 2 at sunrise as follows:

```js
var user = jsHue().bridge('192.168.1.1').user('myUser'),
    generateAction = user.ruleActionGenerator();

Promise.all([
    generateAction.setLightState(1, { on: true }),
    generateAction.setLightState(2, { on: true })
]).then(actions => user.createRule({
    name: 'My rule',
    conditions: [{
        address: '/sensors/1/state/daylight',
        operator: 'eq',
        value: 'true'
    }],
    actions
}));
```

These features are considered experimental because the implementation is hacky.
There is nothing asynchronous about command or rule generation so promises are
unnecessary in principle; however, they made implementation trivial by allowing
reuse of an existing interface.

## Contributors

- John Peloquin
- Tom Brewe
