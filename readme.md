Fork from https://github.com/maxogden/iwlist

# iwlist

parses iwlist output on linux computers. tested on raspberry pi running raspbian (debian)

@substack wrote this for [hacking into flying robots](https://github.com/substack/virus-copter/blob/master/lib/iw.js) but told me to publish it to github and npm because he was busy

## install

```javascript
npm install TheThingBox/iwlist
```

## instantiate

```javascript
var iw = require('iwlist')('wlan0')
```

## scan(callback)

returns list of nearby wireless networks sorted by signal strength (high to low)

## connect(essid, callback)

joins a wireless network by ESSID

## disconnect

disconnects from the current network. callback not implemented yet but it returns the spawned child process stream for `iwconfig`

note: this doesnt seem to work on raspbian

## associated(cb)

cb takes (err, associated) where associated is true if the computer is currently connected to a wireless access point

## online(cb)

tries to resolve google.com and calls the callback with (err). if there is no err it means you are online

## license

BSD LICENSED
