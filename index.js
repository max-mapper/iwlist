// extracted with substacks blessing from https://github.com/substack/virus-copter/blob/master/lib/iw.js

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var EventEmitter = require('events').EventEmitter;
var http = require('http')
var dns = require('dns')

module.exports = function (iface) {
    return new IW(iface);
};

function IW (iface) {
    if (!(this instanceof IW)) return new IW(iface);
    this.iface = iface;
}

IW.prototype = new EventEmitter;

IW.prototype.associated = function(cb) {
    exec('iwconfig ' + this.iface, function(err, stdout, stderr) {
        if (err) return cb(err)
        var status = stdout.match(/Access Point: (.*)\n/)[1]
        if (status.match(/Not-Associated/)) return cb(false, false)
        cb(false, true)
    }))
}

IW.prototype.online = function(cb) {
  dns.lookup('www.google.com', function(err, addresses) {
    if (err) return cb(err)
    return cb(false)
  })
}

IW.prototype.disconnect = function() {
    return spawn('iwconfig', [ this.iface, 'essid', 'off' ]);
}

IW.prototype.scan = function (cb) {
    var ps = spawn('iwlist', [ this.iface, 'scan' ]);
    
    var line = '';
    ps.stdout.on('data', function ondata (buf) {
        for (var i = 0; i < buf.length; i++) {
            if (buf[i] === 10) {
                parseLine(line);
                line = '';
            }
            else line += String.fromCharCode(buf[i]);
        }
    });
    
    var stderr = '';
    ps.stderr.on('data', function (buf) { stderr += buf });
    
    ps.on('close', function () {
        if (code !== 0) cb('code = ' + code + '\n', stderr);
        else cb(null, ap);
    });
    
    var code;
    ps.on('exit', function (c) {
        code = c;
    });
    
    var ap = []
    var current = null;
    function parseLine (line) {
        var m;
        
        if (m = /^\s+Cell \d+ - Address: (\S+)/.exec(line)) {
            current = { address : m[1] };
            ap.push(current);
            return;
        }
        if (!current) return;
        
        if (m = /^\s+ESSID:"(.+)"/.exec(line)) {
            current.essid = m[1];
        }
        else if (m = /^\s+Encryption key:(.+)/.exec(line)) {
            current.encrypted = m[1] !== 'off';
        }
    }
};

IW.prototype.connect = function (ap, cb) {
    var self = this;
    if (typeof ap === 'string') ap = { essid : ap };
    
    spawn('iwconfig', [ self.iface, 'essid', ap.essid ]);
    var iv = setInterval(function (err, stdout, stderr) {
        exec('iwconfig ' + self.iface, function (err, stdout, stderr) {
            var m;
            if (m = /ESSID:"(.+)"/.exec(stdout)) {
                if (m[1] === ap.essid) {
                    clearInterval(iv);
                    clearTimeout(to);
                    cb(null);
                }
            }
        });
    }, 1000);
    
    var to = setTimeout(function () {
        clearInterval(iv);
        cb('connection to ' + ap + ' timed out');
    }, 20 * 1000);
};
