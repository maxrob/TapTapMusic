if (typeof(Color) === "undefined") var Color = {};
if (typeof(Color.Space) === "undefined") Color.Space = {};

(function () { "use strict";

var useEval = false; // caches functions for quicker access.

var functions = {
    // holds generated cached conversion functions.
};

var shortcuts = {
    "HEX24>HSL": "HEX24>RGB>HSL",
    "HEX32>HSLA": "HEX32>RGBA>HSLA",
    "HEX24>CMYK": "HEX24>RGB>CMY>CMYK",
    "RGB>CMYK": "RGB>CMY>CMYK"
};

var root = Color.Space = function(color, route) {
    if (shortcuts[route]) { // shortcut available
        route = shortcuts[route];
    }
    var r = route.split(">");
    // check whether color is an [], if so, convert to {}
    if (typeof(color) === "object" && color[0] >= 0) { // array
        var type = r[0];
        var tmp = {};
        for(var i = 0; i < type.length; i ++) {
            var str = type.substr(i, 1);
            tmp[str] = color[i];
        }
        color = tmp;
    }
    if (functions[route]) { // cached function available
        return functions[route](color);
    }
    var f = "color";
    for (var pos = 1, key = r[0]; pos < r.length; pos ++) {
        if (pos > 1) { // recycle previous
            key = key.substr(key.indexOf("_") + 1);
        }
        key += (pos === 0 ? "" : "_") + r[pos];
        color = root[key](color);
        if (useEval) {
            f = "Color.Space."+key+"("+f+")";
        }
    }
    if (useEval) {
        functions[route] = eval("(function(color) { return "+f+" })");
    }
    return color;
};

// W3C - RGB + RGBA

root.RGB_W3 = function(o) {
    return "rgb(" + (o.R >> 0) + "," + (o.G >> 0) + "," + (o.B >> 0) + ")";
};

root.RGBA_W3 = function(o) {
    var alpha = typeof(o.A) === "number" ? o.A / 255 : 1;
    return "rgba(" + (o.R >> 0) + "," + (o.G >> 0) + "," + (o.B >> 0) + "," + alpha + ")";
};

root.W3_RGB = function(o) {
    var o = o.substr(4, o.length - 5).split(",");
    return {
        R: parseInt(o[0]),
        G: parseInt(o[1]),
        B: parseInt(o[2])
    }
};

root.W3_RGBA = function(o) {
    var o = o.substr(5, o.length - 6).split(",");
    return {
        R: parseInt(o[0]),
        G: parseInt(o[1]),
        B: parseInt(o[2]),
        A: parseFloat(o[3]) * 255
    }
};

// W3C - HSL + HSLA

root.HSL_W3 = function(o) {
    return "hsl(" + ((o.H + 0.5) >> 0) + "," + ((o.S + 0.5) >> 0) + "%," + ((o.L + 0.5) >> 0) + "%)";
};

root.HSLA_W3 = function(o) {
    var alpha = typeof(o.A) === "number" ? o.A / 255 : 1;
    return "hsla(" + ((o.H + 0.5) >> 0) + "," + ((o.S + 0.5) >> 0) + "%," + ((o.L + 0.5) >> 0) + "%," + alpha + ")";
};

root.W3_HSL = function(o) {
    var o = o.substr(4, o.length - 5).split(",");
    return {
        H: parseInt(o[0]),
        S: parseInt(o[1]),
        L: parseInt(o[2])
    }
};

root.W3_HSLA = function(o) {
    var o = o.substr(5, o.length - 6).split(",");
    return {
        H: parseInt(o[0]),
        S: parseInt(o[1]),
        L: parseInt(o[2]),
        A: parseFloat(o[3]) * 255
    }
};

// W3 HEX = "FFFFFF" | "FFFFFFFF"

root.W3_HEX =
root.W3_HEX24 = function (o) {
    if (o.substr(0, 1) === "#") o = o.substr(1);
    if (o.length === 3) o = o[0] + o[0] + o[1] + o[1] + o[2] + o[2];
    return parseInt("0x" + o);
};

root.W3_HEX32 = function (o) {
    if (o.substr(0, 1) === "#") o = o.substr(1);
    if (o.length === 6) {
        return parseInt("0xFF" + o);
    } else {
        return parseInt("0x" + o);
    }
};

// HEX = 0x000000 -> 0xFFFFFF

root.HEX_W3 =
root.HEX24_W3 = function (o, maxLength) {
    if (!maxLength) maxLength = 6;
    if (!o) o = 0;
    var z = o.toString(16);
    // when string is lesser than maxLength
    var n = z.length;
    while (n < maxLength) {
        z = "0" + z;
        n++;
    }
    // when string is greater than maxLength
    var n = z.length;
    while (n > maxLength) {
        z = z.substr(1);
        n--;
    }
    return "#" + z;
};

root.HEX32_W3 = function(o) {
    return root.HEX_W3(o, 8);
};

root.HEX_RGB =
root.HEX24_RGB = function (o) {
    return {
        R: (o >> 16),
        G: (o >> 8) & 0xFF,
        B: o & 0xFF
    };
};

// HEX32 = 0x00000000 -> 0xFFFFFFFF

root.HEX32_RGBA = function (o) {
    return {
        R: o >>> 16 & 0xFF,
        G: o >>> 8 & 0xFF,
        B: o & 0xFF,
        A: o >>> 24
    };
};

// RGBA = R: Red / G: Green / B: Blue / A: Alpha

root.RGBA_HEX32 = function (o) {
    return (o.A << 24 | o.R << 16 | o.G << 8 | o.B) >>> 0;
};

// RGB = R: Red / G: Green / B: Blue

root.RGB_HEX24 =
root.RGB_HEX = function (o) {
    if (o.R < 0) o.R = 0;
    if (o.G < 0) o.G = 0;
    if (o.B < 0) o.B = 0;
    if (o.R > 255) o.R = 255;
    if (o.G > 255) o.G = 255;
    if (o.B > 255) o.B = 255;
    return o.R << 16 | o.G << 8 | o.B;
};

root.RGB_CMY = function (o) {
    return {
        C: 1 - (o.R / 255),
        M: 1 - (o.G / 255),
        Y: 1 - (o.B / 255)
    };
};

root.RGBA_HSLA =
root.RGB_HSL = function (o) { // RGB from 0 to 1
    var _R = o.R / 255,
        _G = o.G / 255,
        _B = o.B / 255,
        min = Math.min(_R, _G, _B),
        max = Math.max(_R, _G, _B),
        D = max - min,
        H,
        S,
        L = (max + min) / 2;
    if (D === 0) { // No chroma
        H = 0;
        S = 0;
    } else { // Chromatic data
        if (L < 0.5) S = D / (max + min);
        else S = D / (2 - max - min);
        var DR = (((max - _R) / 6) + (D / 2)) / D;
        var DG = (((max - _G) / 6) + (D / 2)) / D;
        var DB = (((max - _B) / 6) + (D / 2)) / D;
        if (_R === max) H = DB - DG;
        else if (_G === max) H = (1 / 3) + DR - DB;
        else if (_B === max) H = (2 / 3) + DG - DR;
        if (H < 0) H += 1;
        if (H > 1) H -= 1;
    }
    return {
        H: H * 360,
        S: S * 100,
        L: L * 100,
        A: o.A
    };
};

root.RGBA_HSVA =
root.RGB_HSV = function (o) { //- RGB from 0 to 255
    var _R = o.R / 255,
        _G = o.G / 255,
        _B = o.B / 255,
        min = Math.min(_R, _G, _B),
        max = Math.max(_R, _G, _B),
        D = max - min,
        H,
        S,
        V = max;
    if (D === 0) { // No chroma
        H = 0;
        S = 0;
    } else { // Chromatic data
        S = D / max;
        var DR = (((max - _R) / 6) + (D / 2)) / D;
        var DG = (((max - _G) / 6) + (D / 2)) / D;
        var DB = (((max - _B) / 6) + (D / 2)) / D;
        if (_R === max) H = DB - DG;
        else if (_G === max) H = (1 / 3) + DR - DB;
        else if (_B === max) H = (2 / 3) + DG - DR;
        if (H < 0) H += 1;
        if (H > 1) H -= 1;
    }
    return {
        H: H * 360,
        S: S * 100,
        V: V * 100,
        A: o.A
    };
};

// CMY = C: Cyan / M: Magenta / Y: Yellow

root.CMY_RGB = function (o) {
    return {
        R: Math.max(0, (1 - o.C) * 255),
        G: Math.max(0, (1 - o.M) * 255),
        B: Math.max(0, (1 - o.Y) * 255)
    };
};

root.CMY_CMYK = function (o) {
    var C = o.C;
    var M = o.M;
    var Y = o.Y;
    var K = Math.min(Y, Math.min(M, Math.min(C, 1)));
    C = Math.round((C - K) / (1 - K) * 100);
    M = Math.round((M - K) / (1 - K) * 100);
    Y = Math.round((Y - K) / (1 - K) * 100);
    K = Math.round(K * 100);
    return {
        C: C,
        M: M,
        Y: Y,
        K: K
    };
};

// CMYK = C: Cyan / M: Magenta / Y: Yellow / K: Key (black)

root.CMYK_CMY = function (o) {
    return {
        C: (o.C * (1 - o.K) + o.K),
        M: (o.M * (1 - o.K) + o.K),
        Y: (o.Y * (1 - o.K) + o.K)
    };
};

// HSL (1978) = H: Hue / S: Saturation / L: Lightess
// en.wikipedia.org/wiki/HSL_and_HSV

root.HSLA_RGBA =
root.HSL_RGB = function (o) {
    var H = o.H / 360;
    var S = o.S / 100;
    var L = o.L / 100;
    var R, G, B;
    var temp1, temp2, temp3;
    if (S === 0) {
        R = G = B = L;
    } else {
        if (L < 0.5) temp2 = L * (1 + S);
        else temp2 = (L + S) - (S * L);
        temp1 = 2 * L - temp2;
        // calculate red
        temp3 = H + (1 / 3);
        if (temp3 < 0) temp3 += 1;
        if (temp3 > 1) temp3 -= 1;
        if ((6 * temp3) < 1) R = temp1 + (temp2 - temp1) * 6 * temp3;
        else if ((2 * temp3) < 1) R = temp2;
        else if ((3 * temp3) < 2) R = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
        else R = temp1;
        // calculate green
        temp3 = H;
        if (temp3 < 0) temp3 += 1;
        if (temp3 > 1) temp3 -= 1;
        if ((6 * temp3) < 1) G = temp1 + (temp2 - temp1) * 6 * temp3;
        else if ((2 * temp3) < 1) G = temp2;
        else if ((3 * temp3) < 2) G = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
        else G = temp1;
        // calculate blue
        temp3 = H - (1 / 3);
        if (temp3 < 0) temp3 += 1;
        if (temp3 > 1) temp3 -= 1;
        if ((6 * temp3) < 1) B = temp1 + (temp2 - temp1) * 6 * temp3;
        else if ((2 * temp3) < 1) B = temp2;
        else if ((3 * temp3) < 2) B = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
        else B = temp1;
    }
    return {
        R: R * 255,
        G: G * 255,
        B: B * 255,
        A: o.A
    };
};

// HSV (1978) = H: Hue / S: Saturation / V: Value
// en.wikipedia.org/wiki/HSL_and_HSV

root.HSVA_RGBA =
root.HSV_RGB = function (o) {
    var H = o.H / 360;
    var S = o.S / 100;
    var V = o.V / 100;
    var R, G, B, D, A, C;
    if (S === 0) {
        R = G = B = Math.round(V * 255);
    } else {
        if (H >= 1) H = 0;
        H = 6 * H;
        D = H - Math.floor(H);
        A = Math.round(255 * V * (1 - S));
        B = Math.round(255 * V * (1 - (S * D)));
        C = Math.round(255 * V * (1 - (S * (1 - D))));
        V = Math.round(255 * V);
        switch (Math.floor(H)) {
            case 0:
                R = V;
                G = C;
                B = A;
                break;
            case 1:
                R = B;
                G = V;
                B = A;
                break;
            case 2:
                R = A;
                G = V;
                B = C;
                break;
            case 3:
                R = A;
                G = B;
                B = V;
                break;
            case 4:
                R = C;
                G = A;
                B = V;
                break;
            case 5:
                R = V;
                G = A;
                B = B;
                break;
        }
    }
    return {
        R: R,
        G: G,
        B: B,
        A: o.A
    };
};

})();


/*
    -------------------------------------
    MIDI.audioDetect : 0.3
    -------------------------------------
    https://github.com/mudcube/MIDI.js
    -------------------------------------
    Probably, Maybe, No... Absolutely!
    -------------------------------------
    Test to see what types of <audio> MIME types are playable by the browser.
    -------------------------------------
*/

if (typeof(MIDI) === "undefined") var MIDI = {};

(function() { "use strict";

var supports = {};
var pending = 0;
var canPlayThrough = function (src) {
    pending ++;
    var audio = new Audio();
    var mime = src.split(";")[0];
    audio.id = "audio";
    audio.setAttribute("preload", "auto");
    audio.setAttribute("audiobuffer", true);
    audio.addEventListener("error", function() {
        supports[mime] = false;
        pending --;
    }, false);
    audio.addEventListener("canplaythrough", function() {
        supports[mime] = true;
        pending --;
    }, false);
    audio.src = "data:" + src;
    document.body.appendChild(audio);
};

MIDI.audioDetect = function(callback) {
    // check whether <audio> tag is supported
    if (typeof(Audio) === "undefined") return callback({});
    // check whether canPlayType is supported
    var audio = new Audio();
    if (typeof(audio.canPlayType) === "undefined") return callback(supports);
    // see what we can learn from the browser
    var vorbis = audio.canPlayType('audio/ogg; codecs="vorbis"');
    vorbis = (vorbis === "probably" || vorbis === "maybe");
    var mpeg = audio.canPlayType('audio/mpeg');
    mpeg = (mpeg === "probably" || mpeg === "maybe");
    // maybe nothing is supported
    if (!vorbis && !mpeg) {
        callback(supports);
        return;
    }
    // or maybe something is supported
    if (vorbis) canPlayThrough("audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=");
    if (mpeg) canPlayThrough("audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
    // lets find out!
    var time = (new Date()).getTime();
    var interval = window.setInterval(function() {
        var now = (new Date()).getTime();
        var maxExecution = now - time > 5000;
        if (!pending || maxExecution) {
            window.clearInterval(interval);
            callback(supports);
        }
    }, 1);
};

})();

/*
    -----------------------------------------------------------
    MIDI.loadPlugin : 0.1.2 : 01/22/2014
    -----------------------------------------------------------
    https://github.com/mudcube/MIDI.js
    -----------------------------------------------------------
    MIDI.loadPlugin({
        targetFormat: "mp3", // optionally can force to use MP3 (for instance on mobile networks)
        instrument: "acoustic_grand_piano", // or 1 (default)
        instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
        callback: function() { }
    });
*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Soundfont) === "undefined") MIDI.Soundfont = {};

(function() { "use strict";

var USE_JAZZMIDI = false; // Turn on to support JazzMIDI Plugin

MIDI.loadPlugin = function(conf) {
    if (typeof(conf) === "function") conf = {
        callback: conf
    };
    /// Get the instrument name.
    var instruments = conf.instruments || conf.instrument || "acoustic_grand_piano";
    if (typeof(instruments) !== "object") instruments = [ instruments ];
    ///
    for (var n = 0; n < instruments.length; n ++) {
        var instrument = instruments[n];
        if (typeof(instrument) === "number") {
            instruments[n] = MIDI.GeneralMIDI.byId[instrument];
        }
    };
    ///
    MIDI.soundfontUrl = conf.soundfontUrl || MIDI.soundfontUrl || "./soundfont/";
    /// Detect the best type of audio to use.
    MIDI.audioDetect(function(types) {
        var api = "";
        // use the most appropriate plugin if not specified
        if (apis[conf.api]) {
            api = conf.api;
        } else if (apis[window.location.hash.substr(1)]) {
            api = window.location.hash.substr(1);
        } else if (USE_JAZZMIDI && navigator.requestMIDIAccess) {
            api = "webmidi";
        } else if (window.webkitAudioContext || window.AudioContext) { // Chrome
            api = "webaudio";
        } else if (window.Audio) { // Firefox
            api = "audiotag";
        } else { // Internet Explorer
            api = "flash";
        }
        ///
        if (!connect[api]) return;
        // use audio/ogg when supported
        if (conf.targetFormat) {
            var filetype = conf.targetFormat;
        } else { // use best quality
            var filetype = types["audio/ogg"] ? "ogg" : "mp3";
        }
        // load the specified plugin
        MIDI.lang = api;
        MIDI.supports = types;
        connect[api](filetype, instruments, conf);
    });
};

///

var connect = {};

connect.webmidi = function(filetype, instruments, conf) {
    if (MIDI.loader) MIDI.loader.message("Web MIDI API...");
    MIDI.WebMIDI.connect(conf);
};

connect.flash = function(filetype, instruments, conf) {
    // fairly quick, but requires loading of individual MP3s (more http requests).
    if (MIDI.loader) MIDI.loader.message("Flash API...");
    DOMLoader.script.add({
        src: conf.soundManagerUrl || "./inc/SoundManager2/script/soundmanager2.js",
        verify: "SoundManager",
        callback: function () {
            MIDI.Flash.connect(instruments, conf);
        }
    });
};

connect.audiotag = function(filetype, instruments, conf) {
    if (MIDI.loader) MIDI.loader.message("HTML5 Audio API...");
    // works ok, kinda like a drunken tuna fish, across the board.
    var queue = createQueue({
        items: instruments,
        getNext: function(instrumentId) {
            DOMLoader.sendRequest({
                url: MIDI.soundfontUrl + instrumentId + "-" + filetype + ".js",
                onprogress: getPercent,
                onload: function (response) {
                    addSoundfont(response.responseText);
                    if (MIDI.loader) MIDI.loader.update(null, "Downloading", 100);
                    queue.getNext();
                }
            });
        },
        onComplete: function() {
            MIDI.AudioTag.connect(conf);
        }
    });
};

connect.webaudio = function(filetype, instruments, conf) {
    if (MIDI.loader) MIDI.loader.message("Web Audio API...");
    // works awesome! safari, chrome and firefox support.
    var queue = createQueue({
        items: instruments,
        getNext: function(instrumentId) {
            DOMLoader.sendRequest({
                url: MIDI.soundfontUrl + instrumentId + "-" + filetype + ".js",
                onprogress: getPercent,
                onload: function(response) {
                    addSoundfont(response.responseText);
                    if (MIDI.loader) MIDI.loader.update(null, "Downloading...", 100);
                    queue.getNext();
                }
            });
        },
        onComplete: function() {
            MIDI.WebAudio.connect(conf);
        }
    });
};

/// Helpers

var apis = {
    "webmidi": true,
    "webaudio": true,
    "audiotag": true,
    "flash": true
};

var addSoundfont = function(text) {
    var script = document.createElement("script");
    script.language = "javascript";
    script.type = "text/javascript";
    script.text = text;
    document.body.appendChild(script);
};

var getPercent = function(event) {
    if (!this.totalSize) {
        if (this.getResponseHeader("Content-Length-Raw")) {
            this.totalSize = parseInt(this.getResponseHeader("Content-Length-Raw"));
        } else {
            this.totalSize = event.total;
        }
    }
    ///
    var percent = this.totalSize ? Math.round(event.loaded / this.totalSize * 100) : "";
    if (MIDI.loader) MIDI.loader.update(null, "Downloading...", percent);
};

var createQueue = function(conf) {
    var self = {};
    self.queue = [];
    for (var key in conf.items) {
        if (conf.items.hasOwnProperty(key)) {
            self.queue.push(conf.items[key]);
        }
    }
    self.getNext = function() {
        if (!self.queue.length) return conf.onComplete();
        conf.getNext(self.queue.shift());
    };
    setTimeout(self.getNext, 1);
    return self;
};

})();

/*
    -------------------------------------
    MIDI.Player : 0.3
    -------------------------------------
    https://github.com/mudcube/MIDI.js
    -------------------------------------
    #jasmid
    -------------------------------------
*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Player) === "undefined") MIDI.Player = {};

(function() { "use strict";

var root = MIDI.Player;
root.callback = undefined; // your custom callback goes here!
root.currentTime = 0;
root.endTime = 0;
root.restart = 0;
root.playing = false;
root.timeWarp = 1;

//
root.start =
root.resume = function () {
    if (root.currentTime < -1) root.currentTime = -1;
    startAudio(root.currentTime);
};

root.pause = function () {
    var tmp = root.restart;
    stopAudio();
    root.restart = tmp;
};

root.stop = function () {
    stopAudio();
    root.restart = 0;
    root.currentTime = 0;
};

root.addListener = function(callback) {
    onMidiEvent = callback;
};

root.removeListener = function() {
    onMidiEvent = undefined;
};

root.clearAnimation = function() {
    if (root.interval)  {
        window.clearInterval(root.interval);
    }
};

root.setAnimation = function(config) {
    var callback = (typeof(config) === "function") ? config : config.callback;
    var interval = config.interval || 30;
    var currentTime = 0;
    var tOurTime = 0;
    var tTheirTime = 0;
    //
    root.clearAnimation();
    root.interval = window.setInterval(function () {
        if (root.endTime === 0) return;
        if (root.playing) {
            currentTime = (tTheirTime === root.currentTime) ? tOurTime - (new Date).getTime() : 0;
            if (root.currentTime === 0) {
                currentTime = 0;
            } else {
                currentTime = root.currentTime - currentTime;
            }
            if (tTheirTime !== root.currentTime) {
                tOurTime = (new Date).getTime();
                tTheirTime = root.currentTime;
            }
        } else { // paused
            currentTime = root.currentTime;
        }
        var endTime = root.endTime;
        var percent = currentTime / endTime;
        var total = currentTime / 1000;
        var minutes = total / 60;
        var seconds = total - (minutes * 60);
        var t1 = minutes * 60 + seconds;
        var t2 = (endTime / 1000);
        if (t2 - t1 < -1) return;
        callback({
            now: t1,
            end: t2,
            events: noteRegistrar
        });
    }, interval);
};

// helpers

root.loadMidiFile = function() { // reads midi into javascript array of events
    root.replayer = new Replayer(MidiFile(root.currentData), root.timeWarp);
    root.data = root.replayer.getData();
    root.endTime = getLength();
};

root.loadFile = function (file, callback) {
    root.stop();
    if (file.indexOf("base64,") !== -1) {
        var data = window.atob(file.split(",")[1]);
        root.currentData = data;
        root.loadMidiFile();
        if (callback) callback(data);
        return;
    }
    ///
    var fetch = new XMLHttpRequest();
    fetch.open('GET', file);
    fetch.overrideMimeType("text/plain; charset=x-user-defined");
    fetch.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var t = this.responseText || "";
            var ff = [];
            var mx = t.length;
            var scc = String.fromCharCode;
            for (var z = 0; z < mx; z++) {
                ff[z] = scc(t.charCodeAt(z) & 255);
            }
            var data = ff.join("");
            root.currentData = data;
            root.loadMidiFile();
            if (callback) callback(data);
        }
    };
    fetch.send();
};

// Playing the audio

var eventQueue = []; // hold events to be triggered
var queuedTime; //
var startTime = 0; // to measure time elapse
var noteRegistrar = {}; // get event for requested note
var onMidiEvent = undefined; // listener callback
var scheduleTracking = function (channel, note, currentTime, offset, message, velocity) {
    var interval = window.setTimeout(function () {
        var data = {
            channel: channel,
            note: note,
            now: currentTime,
            end: root.endTime,
            message: message,
            velocity: velocity
        };
        //
        if (message === 128) {
            delete noteRegistrar[note];
        } else {
            noteRegistrar[note] = data;
        }
        if (onMidiEvent) {
            onMidiEvent(data);
        }
        root.currentTime = currentTime;
        if (root.currentTime === queuedTime && queuedTime < root.endTime) { // grab next sequence
            startAudio(queuedTime, true);
        }
    }, currentTime - offset);
    return interval;
};

var getContext = function() {
    if (MIDI.lang === 'WebAudioAPI') {
        return MIDI.Player.ctx;
    } else if (!root.ctx) {
        root.ctx = { currentTime: 0 };
    }
    return root.ctx;
};

var getLength = function() {
    var data =  root.data;
    var length = data.length;
    var totalTime = 0.5;
    for (var n = 0; n < length; n++) {
        totalTime += data[n][1];
    }
    return totalTime;
};

var startAudio = function (currentTime, fromCache) {
    if (!root.replayer) return;
    if (!fromCache) {
        if (typeof (currentTime) === "undefined") currentTime = root.restart;
        if (root.playing) stopAudio();
        root.playing = true;
        root.data = root.replayer.getData();
        root.endTime = getLength();
    }
    var note;
    var offset = 0;
    var messages = 0;
    var data = root.data;
    var ctx = getContext();
    var length = data.length;
    //
    queuedTime = 0.5;
    startTime = ctx.currentTime;
    //
    for (var n = 0; n < length && messages < 100; n++) {
        queuedTime += data[n][1];
        if (queuedTime < currentTime) {
            offset = queuedTime;
            continue;
        }
        currentTime = queuedTime - offset;
        var event = data[n][0].event;
        if (event.type !== "channel") continue;
        var channel = event.channel;
        switch (event.subtype) {
            case 'noteOn':
                if (MIDI.channels[channel].mute) break;
                note = event.noteNumber - (root.MIDIOffset || 0);
                eventQueue.push({
                    event: event,
                    source: MIDI.noteOn(channel, event.noteNumber, event.velocity, currentTime / 1000 + ctx.currentTime),
                    interval: scheduleTracking(channel, note, queuedTime, offset, 144, event.velocity)
                });
                messages ++;
                break;
            case 'noteOff':
                if (MIDI.channels[channel].mute) break;
                note = event.noteNumber - (root.MIDIOffset || 0);
                eventQueue.push({
                    event: event,
                    source: MIDI.noteOff(channel, event.noteNumber, currentTime / 1000 + ctx.currentTime),
                    interval: scheduleTracking(channel, note, queuedTime, offset, 128)
                });
                break;
            default:
                break;
        }
    }
};

var stopAudio = function () {
    var ctx = getContext();
    root.playing = false;
    root.restart += (ctx.currentTime - startTime) * 1000;
    // stop the audio, and intervals
    while (eventQueue.length) {
        var o = eventQueue.pop();
        window.clearInterval(o.interval);
        if (!o.source) continue; // is not webaudio
        if (typeof(o.source) === "number") {
            window.clearTimeout(o.source);
        } else { // webaudio
            o.source.disconnect(0);
        }
    }
    // run callback to cancel any notes still playing
    for (var key in noteRegistrar) {
        var o = noteRegistrar[key]
        if (noteRegistrar[key].message === 144 && onMidiEvent) {
            onMidiEvent({
                channel: o.channel,
                note: o.note,
                now: o.now,
                end: o.end,
                message: 128,
                velocity: o.velocity
            });
        }
    }
    // reset noteRegistrar
    noteRegistrar = {};
};
})();

/*
    --------------------------------------------
    MIDI.Plugin : 0.3.2 : 2013/01/26
    --------------------------------------------
    https://github.com/mudcube/MIDI.js
    --------------------------------------------
    Inspired by javax.sound.midi (albeit a super simple version):
        http://docs.oracle.com/javase/6/docs/api/javax/sound/midi/package-summary.html
    --------------------------------------------
    Technologies:
        MIDI.WebMIDI
        MIDI.WebAudio
        MIDI.Flash
        MIDI.AudioTag
    --------------------------------------------
    Helpers:
        MIDI.GeneralMIDI
        MIDI.channels
        MIDI.keyToNote
        MIDI.noteToKey
*/

if (typeof (MIDI) === "undefined") var MIDI = {};

(function() { "use strict";

var setPlugin = function(root) {
    MIDI.api = root.api;
    MIDI.setVolume = root.setVolume;
    MIDI.programChange = root.programChange;
    MIDI.noteOn = root.noteOn;
    MIDI.noteOff = root.noteOff;
    MIDI.chordOn = root.chordOn;
    MIDI.chordOff = root.chordOff;
    MIDI.stopAllNotes = root.stopAllNotes;
    MIDI.getInput = root.getInput;
    MIDI.getOutputs = root.getOutputs;
};

/*
    --------------------------------------------
    Web MIDI API - Native Soundbank
    --------------------------------------------
    https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html
    --------------------------------------------
*/

(function () {
    var plugin = null;
    var output = null;
    var channels = [];
    var root = MIDI.WebMIDI = {
        api: "webmidi"
    };
    root.setVolume = function (channel, volume) { // set channel volume
        output.send([0xB0 + channel, 0x07, volume]);
    };

    root.programChange = function (channel, program) { // change channel instrument
        output.send([0xC0 + channel, program]);
    };

    root.noteOn = function (channel, note, velocity, delay) {
        output.send([0x90 + channel, note, velocity], delay * 1000);
    };

    root.noteOff = function (channel, note, delay) {
        output.send([0x80 + channel, note, 0], delay * 1000);
    };

    root.chordOn = function (channel, chord, velocity, delay) {
        for (var n = 0; n < chord.length; n ++) {
            var note = chord[n];
            output.send([0x90 + channel, note, velocity], delay * 1000);
        }
    };

    root.chordOff = function (channel, chord, delay) {
        for (var n = 0; n < chord.length; n ++) {
            var note = chord[n];
            output.send([0x80 + channel, note, 0], delay * 1000);
        }
    };

    root.stopAllNotes = function () {
        for (var channel = 0; channel < 16; channel ++) {
            output.send([0xB0 + channel, 0x7B, 0]);
        }
    };

    root.getInput = function () {
        return plugin.getInputs();
    };

    root.getOutputs = function () {
        return plugin.getOutputs();
    };

    root.connect = function (conf) {
        setPlugin(root);
        navigator.requestMIDIAccess().then(function (access) {
            plugin = access;
            output = plugin.outputs()[0];
            if (conf.callback) conf.callback();
        }, function (err) { // well at least we tried!
            if (window.AudioContext || window.webkitAudioContext) { // Chrome
                conf.api = "webaudio";
            } else if (window.Audio) { // Firefox
                conf.api = "audiotag";
            } else { // Internet Explorer
                conf.api = "flash";
            }
            MIDI.loadPlugin(conf);
        });
    };
})();

/*
    --------------------------------------------
    Web Audio API - OGG or MPEG Soundbank
    --------------------------------------------
    https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
    --------------------------------------------
*/

if (window.AudioContext || window.webkitAudioContext) (function () {

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var root = MIDI.WebAudio = {
        api: "webaudio"
    };
    var ctx;
    var sources = {};
    var masterVolume = 127;
    var audioBuffers = {};
    var audioLoader = function (instrument, urlList, index, bufferList, callback) {
        var synth = MIDI.GeneralMIDI.byName[instrument];
        var instrumentId = synth.number;
        var url = urlList[index];
        if (!MIDI.Soundfont[instrument][url]) { // missing soundfont
            return callback(instrument);
        }
        var base64 = MIDI.Soundfont[instrument][url].split(",")[1];
        var buffer = Base64Binary.decodeArrayBuffer(base64);
        ctx.decodeAudioData(buffer, function (buffer) {
            var msg = url;
            while (msg.length < 3) msg += "&nbsp;";
            if (typeof (MIDI.loader) !== "undefined") {
                MIDI.loader.update(null, synth.instrument + "<br>Processing: " + (index / 87 * 100 >> 0) + "%<br>" + msg);
            }
            buffer.id = url;
            bufferList[index] = buffer;
            //
            if (bufferList.length === urlList.length) {
                while (bufferList.length) {
                    buffer = bufferList.pop();
                    if (!buffer) continue;
                    var nodeId = MIDI.keyToNote[buffer.id];
                    audioBuffers[instrumentId + "" + nodeId] = buffer;
                }
                callback(instrument);
            }
        });
    };

    root.setVolume = function (channel, volume) {
        masterVolume = volume;
    };

    root.programChange = function (channel, program) {
        MIDI.channels[channel].instrument = program;
    };

    root.noteOn = function (channel, note, velocity, delay) {
        /// check whether the note exists
        if (!MIDI.channels[channel]) return;
        var instrument = MIDI.channels[channel].instrument;
        if (!audioBuffers[instrument + "" + note]) return;
        /// convert relative delay to absolute delay
        if (delay < ctx.currentTime) delay += ctx.currentTime;
        /// crate audio buffer
        var source = ctx.createBufferSource();
        sources[channel + "" + note] = source;
        source.buffer = audioBuffers[instrument + "" + note];
        source.connect(ctx.destination);
        ///
        if (ctx.createGain) { // firefox
            source.gainNode = ctx.createGain();
        } else { // chrome
            source.gainNode = ctx.createGainNode();
        }
        var value = (velocity / 127) * (masterVolume / 127) * 2 - 1;
        source.gainNode.connect(ctx.destination);
        source.gainNode.gain.value = Math.max(-1, value);
        source.connect(source.gainNode);
        if (source.noteOn) { // old api
            source.noteOn(delay || 0);
        } else { // new api
            source.start(delay || 0);
        }
        return source;
    };

    root.noteOff = function (channel, note, delay) {
        delay = delay || 0;
        if (delay < ctx.currentTime) delay += ctx.currentTime;
        var source = sources[channel + "" + note];
        if (!source) return;
        if (source.gainNode) {
            // @Miranet: "the values of 0.2 and 0.3 could ofcourse be used as
            // a 'release' parameter for ADSR like time settings."
            // add { "metadata": { release: 0.3 } } to soundfont files
            var gain = source.gainNode.gain;
            gain.linearRampToValueAtTime(gain.value, delay);
            gain.linearRampToValueAtTime(-1, delay + 0.2);
        }
        if (source.noteOff) { // old api
            source.noteOff(delay + 0.3);
        } else {
            source.stop(delay + 0.3);
        }
        ///
        delete sources[channel + "" + note];
    };

    root.chordOn = function (channel, chord, velocity, delay) {
        var ret = {}, note;
        for (var n = 0, length = chord.length; n < length; n++) {
            ret[note = chord[n]] = root.noteOn(channel, note, velocity, delay);
        }
        return ret;
    };

    root.chordOff = function (channel, chord, delay) {
        var ret = {}, note;
        for (var n = 0, length = chord.length; n < length; n++) {
            ret[note = chord[n]] = root.noteOff(channel, note, delay);
        }
        return ret;
    };

    root.stopAllNotes = function () {
        for (var source in sources) {
            var delay = 0;
            if (delay < ctx.currentTime) delay += ctx.currentTime;
            // @Miranet: "the values of 0.2 and 0.3 could ofcourse be used as
            // a 'release' parameter for ADSR like time settings."
            // add { "metadata": { release: 0.3 } } to soundfont files
            sources[source].gain.linearRampToValueAtTime(1, delay);
            sources[source].gain.linearRampToValueAtTime(0, delay + 0.2);
            sources[source].noteOff(delay + 0.3);
            delete sources[source];
        }
    };

    root.connect = function (conf) {
        setPlugin(root);
        //
        MIDI.Player.ctx = ctx = new AudioContext();
        ///
        var urlList = [];
        var keyToNote = MIDI.keyToNote;
        for (var key in keyToNote) urlList.push(key);
        var bufferList = [];
        var pending = {};
        var oncomplete = function(instrument) {
            delete pending[instrument];
            for (var key in pending) break;
            if (!key) conf.callback();
        };
        for (var instrument in MIDI.Soundfont) {
            pending[instrument] = true;
            for (var i = 0; i < urlList.length; i++) {
                audioLoader(instrument, urlList, i, bufferList, oncomplete);
            }
        }
    };
})();

/*
    --------------------------------------------
    AudioTag <audio> - OGG or MPEG Soundbank
    --------------------------------------------
    http://dev.w3.org/html5/spec/Overview.html#the-audio-element
    --------------------------------------------
*/

if (window.Audio) (function () {

    var root = MIDI.AudioTag = {
        api: "audiotag"
    };
    var note2id = {};
    var volume = 127; // floating point
    var channel_nid = -1; // current channel
    var channels = []; // the audio channels
    var channelInstrumentNoteIds = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls
    var notes = {}; // the piano keys
    for (var nid = 0; nid < 12; nid++) {
        channels[nid] = new Audio();
    }

    var playChannel = function (channel, note) {
        if (!MIDI.channels[channel]) return;
        var instrument = MIDI.channels[channel].instrument;
        var instrumentId = MIDI.GeneralMIDI.byId[instrument].id;
        var note = notes[note];
        if (!note) return;
        var instrumentNoteId = instrumentId + "" + note.id;
        var nid = (channel_nid + 1) % channels.length;
        var audio = channels[nid];
        channelInstrumentNoteIds[ nid ] = instrumentNoteId;
        audio.src = MIDI.Soundfont[instrumentId][note.id];
        audio.volume = volume / 127;
        audio.play();
        channel_nid = nid;
    };

    var stopChannel = function (channel, note) {
        if (!MIDI.channels[channel]) return;
        var instrument = MIDI.channels[channel].instrument;
        var instrumentId = MIDI.GeneralMIDI.byId[instrument].id;
        var note = notes[note];
        if (!note) return;
        var instrumentNoteId = instrumentId + "" + note.id;

        for(var i=0;i<channels.length;i++){
            var nid = (i + channel_nid + 1) % channels.length;
            var cId = channelInstrumentNoteIds[nid];

            if(cId && cId == instrumentNoteId){
                channels[nid].pause();
                channelInstrumentNoteIds[nid] = null;
                return;
            }
        }
    };

    root.programChange = function (channel, program) {
        MIDI.channels[channel].instrument = program;
    };

    root.setVolume = function (channel, n) {
        volume = n; //- should be channel specific volume
    };

    root.noteOn = function (channel, note, velocity, delay) {
        var id = note2id[note];
        if (!notes[id]) return;
        if (delay) {
            return window.setTimeout(function () {
                playChannel(channel, id);
            }, delay * 1000);
        } else {
            playChannel(channel, id);
        }
    };

    root.noteOff = function (channel, note, delay) {
        var id = note2id[note];
        if (!notes[id]) return;
        if (delay) {
            return setTimeout(function() {
                stopChannel(channel, id);
            }, delay * 1000)
        } else {
            stopChannel(channel, id);
        }
    };

    root.chordOn = function (channel, chord, velocity, delay) {
        for (var idx = 0; idx < chord.length; idx ++) {
            var n = chord[idx];
            var id = note2id[n];
            if (!notes[id]) continue;
            if (delay) {
                return window.setTimeout(function () {
                    playChannel(channel, id);
                }, delay * 1000);
            } else {
                playChannel(channel, id);
            }
        }
    };

    root.chordOff = function (channel, chord, delay) {
        for (var idx = 0; idx < chord.length; idx ++) {
            var n = chord[idx];
            var id = note2id[n];
            if (!notes[id]) continue;
            if (delay) {
                return window.setTimeout(function () {
                    stopChannel(channel, id);
                }, delay * 1000);
            } else {
                stopChannel(channel, id);
            }
        }
    };

    root.stopAllNotes = function () {
        for (var nid = 0, length = channels.length; nid < length; nid++) {
            channels[nid].pause();
        }
    };

    root.connect = function (conf) {
        for (var key in MIDI.keyToNote) {
            note2id[MIDI.keyToNote[key]] = key;
            notes[key] = {
                id: key
            };
        }
        setPlugin(root);
        ///
        if (conf.callback) conf.callback();
    };
})();

/*
    --------------------------------------------
    Flash - MP3 Soundbank
    --------------------------------------------
    http://www.schillmania.com/projects/soundmanager2/
    --------------------------------------------
*/

(function () {

    var root = MIDI.Flash = {
        api: "flash"
    };
    var noteReverse = {};
    var notes = {};

    root.programChange = function (channel, program) {
        MIDI.channels[channel].instrument = program;
    };

    root.setVolume = function (channel, note) {

    };

    root.noteOn = function (channel, note, velocity, delay) {
        if (!MIDI.channels[channel]) return;
        var instrument = MIDI.channels[channel].instrument;
        var id = MIDI.GeneralMIDI.byId[instrument].number;
        note = id + "" + noteReverse[note];
        if (!notes[note]) return;
        if (delay) {
            return window.setTimeout(function() {
                notes[note].play({ volume: velocity * 2 });
            }, delay * 1000);
        } else {
            notes[note].play({ volume: velocity * 2 });
        }
    };

    root.noteOff = function (channel, note, delay) {

    };

    root.chordOn = function (channel, chord, velocity, delay) {
        if (!MIDI.channels[channel]) return;
        var instrument = MIDI.channels[channel].instrument;
        var id = MIDI.GeneralMIDI.byId[instrument].number;
        for (var key in chord) {
            var n = chord[key];
            var note = id + "" + noteReverse[n];
            if (notes[note]) {
                notes[note].play({ volume: velocity * 2 });
            }
        }
    };

    root.chordOff = function (channel, chord, delay) {

    };

    root.stopAllNotes = function () {

    };

    root.connect = function (instruments, conf) {
        soundManager.flashVersion = 9;
        soundManager.useHTML5Audio = true;
        soundManager.url = conf.soundManagerSwfUrl || '../inc/SoundManager2/swf/';
        soundManager.useHighPerformance = true;
        soundManager.wmode = 'transparent';
        soundManager.flashPollingInterval = 1;
        soundManager.debugMode = false;
        soundManager.onload = function () {
            var createBuffer = function(instrument, id, onload) {
                var synth = MIDI.GeneralMIDI.byName[instrument];
                var instrumentId = synth.number;
                notes[instrumentId+""+id] = soundManager.createSound({
                    id: id,
                    url: MIDI.soundfontUrl + instrument + "-mp3/" + id + ".mp3",
                    multiShot: true,
                    autoLoad: true,
                    onload: onload
                });
            };
            var loaded = [];
            var samplesPerInstrument = 88;
            var samplesToLoad = instruments.length * samplesPerInstrument;

            for (var i = 0; i < instruments.length; i++) {
                var instrument = instruments[i];
                var onload = function () {
                    loaded.push(this.sID);
                    if (typeof (MIDI.loader) === "undefined") return;
                    MIDI.loader.update(null, "Processing: " + this.sID);
                };
                for (var j = 0; j < samplesPerInstrument; j++) {
                    var id = noteReverse[j + 21];
                    createBuffer(instrument, id, onload);
                }
            }
            ///
            setPlugin(root);
            //
            var interval = window.setInterval(function () {
                if (loaded.length < samplesToLoad) return;
                window.clearInterval(interval);
                if (conf.callback) conf.callback();
            }, 25);
        };
        soundManager.onerror = function () {

        };
        for (var key in MIDI.keyToNote) {
            noteReverse[MIDI.keyToNote[key]] = key;
        }
    };
})();

/*
    helper functions
*/

// instrument-tracker
MIDI.GeneralMIDI = (function (arr) {
    var clean = function(v) {
        return v.replace(/[^a-z0-9 ]/gi, "").replace(/[ ]/g, "_").toLowerCase();
    };
    var ret = {
        byName: {},
        byId: {},
        byCategory: {}
    };
    for (var key in arr) {
        var list = arr[key];
        for (var n = 0, length = list.length; n < length; n++) {
            var instrument = list[n];
            if (!instrument) continue;
            var num = parseInt(instrument.substr(0, instrument.indexOf(" ")), 10);
            instrument = instrument.replace(num + " ", "");
            ret.byId[--num] =
            ret.byName[clean(instrument)] =
            ret.byCategory[clean(key)] = {
                id: clean(instrument),
                instrument: instrument,
                number: num,
                category: key
            };
        }
    }
    return ret;
})({
    'Piano': ['1 Acoustic Grand Piano', '2 Bright Acoustic Piano', '3 Electric Grand Piano', '4 Honky-tonk Piano', '5 Electric Piano 1', '6 Electric Piano 2', '7 Harpsichord', '8 Clavinet'],
    'Chromatic Percussion': ['9 Celesta', '10 Glockenspiel', '11 Music Box', '12 Vibraphone', '13 Marimba', '14 Xylophone', '15 Tubular Bells', '16 Dulcimer'],
    'Organ': ['17 Drawbar Organ', '18 Percussive Organ', '19 Rock Organ', '20 Church Organ', '21 Reed Organ', '22 Accordion', '23 Harmonica', '24 Tango Accordion'],
    'Guitar': ['25 Acoustic Guitar (nylon)', '26 Acoustic Guitar (steel)', '27 Electric Guitar (jazz)', '28 Electric Guitar (clean)', '29 Electric Guitar (muted)', '30 Overdriven Guitar', '31 Distortion Guitar', '32 Guitar Harmonics'],
    'Bass': ['33 Acoustic Bass', '34 Electric Bass (finger)', '35 Electric Bass (pick)', '36 Fretless Bass', '37 Slap Bass 1', '38 Slap Bass 2', '39 Synth Bass 1', '40 Synth Bass 2'],
    'Strings': ['41 Violin', '42 Viola', '43 Cello', '44 Contrabass', '45 Tremolo Strings', '46 Pizzicato Strings', '47 Orchestral Harp', '48 Timpani'],
    'Ensemble': ['49 String Ensemble 1', '50 String Ensemble 2', '51 Synth Strings 1', '52 Synth Strings 2', '53 Choir Aahs', '54 Voice Oohs', '55 Synth Choir', '56 Orchestra Hit'],
    'Brass': ['57 Trumpet', '58 Trombone', '59 Tuba', '60 Muted Trumpet', '61 French Horn', '62 Brass Section', '63 Synth Brass 1', '64 Synth Brass 2'],
    'Reed': ['65 Soprano Sax', '66 Alto Sax', '67 Tenor Sax', '68 Baritone Sax', '69 Oboe', '70 English Horn', '71 Bassoon', '72 Clarinet'],
    'Pipe': ['73 Piccolo', '74 Flute', '75 Recorder', '76 Pan Flute', '77 Blown Bottle', '78 Shakuhachi', '79 Whistle', '80 Ocarina'],
    'Synth Lead': ['81 Lead 1 (square)', '82 Lead 2 (sawtooth)', '83 Lead 3 (calliope)', '84 Lead 4 (chiff)', '85 Lead 5 (charang)', '86 Lead 6 (voice)', '87 Lead 7 (fifths)', '88 Lead 8 (bass + lead)'],
    'Synth Pad': ['89 Pad 1 (new age)', '90 Pad 2 (warm)', '91 Pad 3 (polysynth)', '92 Pad 4 (choir)', '93 Pad 5 (bowed)', '94 Pad 6 (metallic)', '95 Pad 7 (halo)', '96 Pad 8 (sweep)'],
    'Synth Effects': ['97 FX 1 (rain)', '98 FX 2 (soundtrack)', '99 FX 3 (crystal)', '100 FX 4 (atmosphere)', '101 FX 5 (brightness)', '102 FX 6 (goblins)', '103 FX 7 (echoes)', '104 FX 8 (sci-fi)'],
    'Ethnic': ['105 Sitar', '106 Banjo', '107 Shamisen', '108 Koto', '109 Kalimba', '110 Bagpipe', '111 Fiddle', '112 Shanai'],
    'Percussive': ['113 Tinkle Bell', '114 Agogo', '115 Steel Drums', '116 Woodblock', '117 Taiko Drum', '118 Melodic Tom', '119 Synth Drum'],
    'Sound effects': ['120 Reverse Cymbal', '121 Guitar Fret Noise', '122 Breath Noise', '123 Seashore', '124 Bird Tweet', '125 Telephone Ring', '126 Helicopter', '127 Applause', '128 Gunshot']
});

// channel-tracker
MIDI.channels = (function () { // 0 - 15 channels
    var channels = {};
    for (var n = 0; n < 16; n++) {
        channels[n] = { // default values
            instrument: 0,
            // Acoustic Grand Piano
            mute: false,
            mono: false,
            omni: false,
            solo: false
        };
    }
    return channels;
})();

//
MIDI.pianoKeyOffset = 21;

// note conversions
MIDI.keyToNote = {}; // C8  == 108
MIDI.noteToKey = {}; // 108 ==  C8
(function () {
    var A0 = 0x15; // first note
    var C8 = 0x6C; // last note
    var number2key = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    for (var n = A0; n <= C8; n++) {
        var octave = (n - 12) / 12 >> 0;
        var name = number2key[n % 12] + octave;
        MIDI.keyToNote[name] = n;
        MIDI.noteToKey[n] = name;
    }
})();

})();

var invertObject = function(b) {
    if (b.length)
        for (var a = {}, c = 0; c < b.length; c++) a[b[c]] = c;
    else
        for (c in a = {}, b) a[b[c]] = c;
    return a
};

/*
    ------------------------------------------------------------
    MusicTheory.Synesthesia : 0.3.1 : 01/06/2012
    ------------------------------------------------------------
    Peacock:  “Instruments to perform color-music: Two centuries of technological experimentation,” Leonardo, 21 (1988), 397-406.
    Gerstner:  Karl Gerstner, The Forms of Color 1986
    Klein:  Colour-Music: The art of light, London: Crosby Lockwood and Son, 1927.
    Jameson:  “Visual music in a visual programming language,” IEEE Symposium on Visual Languages, 1999, 111-118.
    Helmholtz:  Treatise on Physiological Optics, New York: Dover Books, 1962
    Jones:  The art of light & color, New York: Van Nostrand Reinhold, 1972
    ------------------------------------------------------------
    Reference: http://rhythmiclight.com/archives/ideas/colorscales.html
    ------------------------------------------------------------
*/
"undefined" === typeof MusicTheory && (MusicTheory = {});
(function() {
    var b = MusicTheory;
    b.key2number = {
        A: 0,
        "A#": 1,
        Bb: 1,
        B: 2,
        C: 3,
        "C#": 4,
        Db: 4,
        D: 5,
        "D#": 6,
        Eb: 6,
        E: 7,
        F: 8,
        "F#": 9,
        Gb: 9,
        G: 10,
        "G#": 11,
        Ab: 11
    };
    b.number2float = {
        0: 0,
        1: 0.5,
        2: 1,
        3: 2,
        4: 2.5,
        5: 3,
        6: 3.5,
        7: 4,
        8: 5,
        9: 5.5,
        10: 6,
        11: 6.5,
        12: 7
    };
    b.number2key = invertObject(b.key2number);
    b.float2number = invertObject(b.number2float);
    b.getKeySignature = function(a) {
        var c = "A AB B C CD D DE E F FG G GA".split(" "),
            b = "FCGDAEB".split("");
        a = {
            Fb: -8,
            Cb: -7,
            Gb: -6,
            Db: -5,
            Ab: -4,
            Eb: -3,
            Bb: -2,
            F: -1,
            C: 0,
            G: 1,
            D: 2,
            A: 3,
            E: 4,
            B: 5,
            "F#": 6,
            "C#": 7,
            "G#": 8,
            "D#": 9,
            "A#": 10,
            "E#": 11,
            "B#": 12
        }[a];
        for (var b = 0 > a ? b.splice(7 + a, -a).reverse().join("") : b.splice(0, a).join(""), d = 0; d < c.length; d++) 1 < c[d].length && (-1 != b.indexOf(c[d][0]) || -1 != b.indexOf(c[d][1]) ? c[d] = 0 < a ? c[d][0] + "#" : c[d][1] + "b" : c[d] = c[d][0] + "#");
        Piano.keySignature = c
    };
    b.tempoFromTap = function(a) {
        function c(a) {
            for (var c = {
                    200: "Prestissimo",
                    168: "Presto",
                    140: "Vivace",
                    120: "Allegro",
                    112: "Allegretto",
                    101: "Moderato",
                    76: "Andante",
                    66: "Adagio",
                    60: "Larghetto",
                    40: "Lento",
                    0: "Larghissimo"
                }, b = 0, d = ""; 250 > b; b++)
                if (c[b] && (d = c[b]),
                    a < b) return d;
            return "Prestissimo"
        }
        if (a.tap) {
            var b = (new Date).getTime() - a.tap,
                d = 60 * (1 / (b / 1E3));
            Piano.tempo = d;
            console.log(c(d), d, b);
            document.getElementById("taptap").value = (d >> 0) + "bmp " + c(d)
        }
        a.tap = (new Date).getTime()
    };
    b.findChord = function(a) {
        a = {};
        var c = ["0", "3"],
            b = Piano.chords,
            d = {},
            k;
        for (k in b) {
            var m = {},
                g;
            for (g in b[k]) m[b[k][g]] = 1;
            d[k] = m
        }
        for (var f in d)
            for (k = 0, g = c.length; k < g; k++)
                if (isNaN(d[f][c[k]])) {
                    a[f] = 1;
                    break
                }
        c = [];
        for (f in d) a[f] || c.push(f);
        return document.getElementById("find").value = c
    };
    b.scaleInfo =
        function(a) {
            var b = "r b2 2 b3 3 4 b5 5 &#X266F;5 6 b7 7 8 b9 9 &#X266F;9 10 11 b12 12 &#X266F;12 13".split(" "),
                e = "",
                d = "",
                k = "",
                m = "",
                g = "",
                f;
            for (f in a) {
                0 < a[f] && (k += "-" + (a[f] - l));
                var l = a[f],
                    n = Piano.calculateNote(l) % 12,
                    n = Piano.keySignature[n],
                    m = m + (", " + MusicTheory.Solfege[n].syllable),
                    g = g + (", " + l),
                    e = e + (", " + n),
                    d = d + (", " + b[l])
            }
            console.log("<b>notes:</b> " + e.substr(2) + "<br><b>solfege:</b> " + m.substr(2) + "<br><b>intervals:</b> " + d.substr(2) + "<br><b>keys:</b> " + g.substr(2) + "<br><b>gaps:</b> " + k.substr(1))
        }
})();


"undefined" === typeof MusicTheory && (MusicTheory = {});
MusicTheory.Chords = {
    Major: [0, 4, 7],
    Majb5: [0, 4, 6],
    minor: [0, 3, 7],
    minb5: [0, 3, 6],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    aug: [0, 4, 8],
    augsus4: [0, 5, 8],
    tri: [0, 3, 6, 9],
    "6th": null,
    "6 ": [0, 4, 7, 9],
    "6sus4": [0, 5, 7, 9],
    "6add9": [0, 4, 7, 9, 14],
    m6: [0, 3, 7, 9],
    m6add9: [0, 3, 7, 9, 14],
    "7th": null,
    "7 ": [0, 4, 7, 10],
    "7sus4": [0, 5, 7, 10],
    "7#5": [0, 4, 8, 10],
    "7b5": [0, 4, 6, 10],
    "7#9": [0, 4, 7, 10, 15],
    "7b9": [0, 4, 7, 10, 13],
    "7#5#9": [0, 4, 8, 12, 14, 19],
    "7#5b9": [0, 4, 8, 12, 14, 17],
    "7b5b9": [0, 4, 6, 10, 12, 15],
    "7add11": [0, 4, 7, 10, 17],
    "7add13": [0, 4, 7, 10, 21],
    "7#11": [0, 4, 7, 10, 18],
    Maj7: [0, 4, 7, 11],
    Maj7b5: [0, 4, 6, 11],
    "Maj7#5": [0, 4, 8, 11],
    "Maj7#11": [0, 4, 7, 11, 18],
    Maj7add13: [0, 4, 7, 11, 21],
    m7: [0, 3, 7, 10],
    m7b5: [0, 3, 6, 10],
    m7b9: [0, 3, 7, 10, 13],
    m7add11: [0, 3, 7, 10, 17],
    m7add13: [0, 3, 7, 10, 21],
    "m-Maj7": [0, 3, 7, 11],
    "m-Maj7add11": [0, 3, 7, 11, 17],
    "m-Maj7add13": [0, 3, 7, 11, 21],
    "9th": null,
    "9 ": [0, 4, 7, 10, 14],
    "9sus4": [0, 5, 7, 10, 14],
    add9: [0, 4, 7, 14],
    "9#5": [0, 4, 8, 10, 14],
    "9b5": [0, 4, 6, 10, 14],
    "9#11": [0, 4, 7, 10, 14, 18],
    "9b13": [0, 4, 7, 10, 14, 20],
    Maj9: [0, 4, 7, 11, 14],
    Maj9sus4: [0, 5, 7, 11, 15],
    "Maj9#5": [0, 4, 8, 11, 14],
    "Maj9#11": [0,
        4, 7, 11, 14, 18
    ],
    m9: [0, 3, 7, 10, 14],
    madd9: [0, 3, 7, 14],
    m9b5: [0, 3, 6, 10, 14],
    "m9-Maj7": [0, 3, 7, 11, 14],
    "11th": null,
    "11 ": [0, 4, 7, 10, 14, 17],
    "11b9": [0, 4, 7, 10, 13, 17],
    Maj11: [0, 4, 7, 11, 14, 17],
    m11: [0, 3, 7, 10, 14, 17],
    "m-Maj11": [0, 3, 7, 11, 14, 17],
    "13th": null,
    "13 ": [0, 4, 7, 10, 14, 21],
    "13#9": [0, 4, 7, 10, 15, 21],
    "13b9": [0, 4, 7, 10, 13, 21],
    "13b5b9": [0, 4, 6, 10, 13, 21],
    Maj13: [0, 4, 7, 11, 14, 21],
    m13: [0, 3, 7, 10, 14, 21],
    "m-Maj13": [0, 3, 7, 11, 14, 21]
};


if (typeof(MusicTheory) === "undefined") var MusicTheory = {};
if (typeof(MusicTheory.Synesthesia) === "undefined") MusicTheory.Synesthesia = {};

(function(root) {
    root.data = {
        'Isaac Newton (1704)': {
            format: "HSL",
            ref: "Gerstner, p.167",
            english: ['red',null,'orange',null,'yellow','green',null,'blue',null,'indigo',null,'violet'],
            0: [ 0, 96, 51 ], // C
            1: [ 0, 0, 0 ], // C#
            2: [ 29, 94, 52 ], // D
            3: [ 0, 0, 0 ], // D#
            4: [ 60, 90, 60 ], // E
            5: [ 135, 76, 32 ], // F
            6: [ 0, 0, 0 ], // F#
            7: [ 248, 82, 28 ], // G
            8: [ 0, 0, 0 ], // G#
            9: [ 302, 88, 26 ], // A
            10: [ 0, 0, 0 ], // A#
            11: [ 325, 84, 46 ] // B
        },
        'Louis Bertrand Castel (1734)': {
            format: "HSL",
            ref: 'Peacock, p.400',
            english: ['blue','blue-green','green','olive green','yellow','yellow-orange','orange','red','crimson','violet','agate','indigo'],
            0: [ 248, 82, 28 ],
            1: [ 172, 68, 34 ],
            2: [ 135, 76, 32 ],
            3: [ 79, 59, 36 ],
            4: [ 60, 90, 60 ],
            5: [ 49, 90, 60 ],
            6: [ 29, 94, 52 ],
            7: [ 360, 96, 51 ],
            8: [ 1, 89, 33 ],
            9: [ 325, 84, 46 ],
            10: [ 273, 80, 27 ],
            11: [ 302, 88, 26 ]
        },
        'George Field (1816)': {
            format: "HSL",
            ref: 'Klein, p.69',
            english: ['blue',null,'purple',null,'red','orange',null,'yellow',null,'yellow green',null,'green'],
            0: [ 248, 82, 28 ],
            1: [ 0, 0, 0 ],
            2: [ 302, 88, 26 ],
            3: [ 0, 0, 0 ],
            4: [ 360, 96, 51 ],
            5: [ 29, 94, 52 ],
            6: [ 0, 0, 0 ],
            7: [ 60, 90, 60 ],
            8: [ 0, 0, 0 ],
            9: [ 79, 59, 36 ],
            10: [ 0, 0, 0 ],
            11: [ 135, 76, 32 ]
        },
        'D. D. Jameson (1844)': {
            format: "HSL",
            ref: 'Jameson, p.12',
            english: ['red','red-orange','orange','orange-yellow','yellow','green','green-blue','blue','blue-purple','purple','purple-violet','violet'],
            0: [ 360, 96, 51 ],
            1: [ 14, 91, 51 ],
            2: [ 29, 94, 52 ],
            3: [ 49, 90, 60 ],
            4: [ 60, 90, 60 ],
            5: [ 135, 76, 32 ],
            6: [ 172, 68, 34 ],
            7: [ 248, 82, 28 ],
            8: [ 273, 80, 27 ],
            9: [ 302, 88, 26 ],
            10: [ 313, 78, 37 ],
            11: [ 325, 84, 46 ]
        },
        'Theodor Seemann (1881)': {
            format: "HSL",
            ref: 'Klein, p.86',
            english: ['carmine','scarlet','orange','yellow-orange','yellow','green','green blue','blue','indigo','violet','brown','black'],
            0: [ 0, 58, 26 ],
            1: [ 360, 96, 51 ],
            2: [ 29, 94, 52 ],
            3: [ 49, 90, 60 ],
            4: [ 60, 90, 60 ],
            5: [ 135, 76, 32 ],
            6: [ 172, 68, 34 ],
            7: [ 248, 82, 28 ],
            8: [ 302, 88, 26 ],
            9: [ 325, 84, 46 ],
            10: [ 0, 58, 26 ],
            11: [ 0, 0, 3 ]
        },
        'A. Wallace Rimington (1893)': {
            format: "HSL",
            ref: 'Peacock, p.402',
            english: ['deep red','crimson','orange-crimson','orange','yellow','yellow-green','green','blueish green','blue-green','indigo','deep blue','violet'],
            0: [ 360, 96, 51 ],
            1: [ 1, 89, 33 ],
            2: [ 14, 91, 51 ],
            3: [ 29, 94, 52 ],
            4: [ 60, 90, 60 ],
            5: [ 79, 59, 36 ],
            6: [ 135, 76, 32 ],
            7: [ 163, 62, 40 ],
            8: [ 172, 68, 34 ],
            9: [ 302, 88, 26 ],
            10: [ 248, 82, 28 ],
            11: [ 325, 84, 46 ]
        },
        'Bainbridge Bishop (1893)': {
            format: "HSL",
            ref: 'Bishop, p.11',
            english: ['red','orange-red or scarlet','orange','gold or yellow-orange','yellow or green-gold','yellow-green','green','greenish-blue or aquamarine','blue','indigo or violet-blue','violet','violet-red','red'],
            0: [ 360, 96, 51 ],
            1: [ 1, 89, 33 ],
            2: [ 29, 94, 52 ],
            3: [ 50, 93, 52 ],
            4: [ 60, 90, 60 ],
            5: [ 73, 73, 55 ],
            6: [ 135, 76, 32 ],
            7: [ 163, 62, 40 ],
            8: [ 302, 88, 26 ],
            9: [ 325, 84, 46 ],
            10: [ 343, 79, 47 ],
            11: [ 360, 96, 51 ]
        },
        'H. von Helmholtz (1910)': {
            format: "HSL",
            ref: 'Helmholtz, p.22',
            english: ['yellow','green','greenish blue','cayan-blue','indigo blue','violet','end of red','red','red','red','red orange','orange'],
            0: [ 60, 90, 60 ],
            1: [ 135, 76, 32 ],
            2: [ 172, 68, 34 ],
            3: [ 211, 70, 37 ],
            4: [ 302, 88, 26 ],
            5: [ 325, 84, 46 ],
            6: [ 330, 84, 34 ],
            7: [ 360, 96, 51 ],
            8: [ 10, 91, 43 ],
            9: [ 10, 91, 43 ],
            10: [ 8, 93, 51 ],
            11: [ 28, 89, 50 ]
        },
        'Alexander Scriabin (1911)': {
            format: "HSL",
            ref: 'Jones, p.104',
            english: ['red','violet','yellow','steely with the glint of metal','pearly blue the shimmer of moonshine','dark red','bright blue','rosy orange','purple','green','steely with a glint of metal','pearly blue the shimmer of moonshine'],
            0: [ 360, 96, 51 ],
            1: [ 325, 84, 46 ],
            2: [ 60, 90, 60 ],
            3: [ 245, 21, 43 ],
            4: [ 211, 70, 37 ],
            5: [ 1, 89, 33 ],
            6: [ 248, 82, 28 ],
            7: [ 29, 94, 52 ],
            8: [ 302, 88, 26 ],
            9: [ 135, 76, 32 ],
            10: [ 245, 21, 43 ],
            11: [ 211, 70, 37 ]
        },
        'Adrian Bernard Klein (1930)': {
            format: "HSL",
            ref: 'Klein, p.209',
            english: ['dark red','red','red orange','orange','yellow','yellow green','green','blue-green','blue','blue violet','violet','dark violet'],
            0: [ 0, 91, 40 ],
            1: [ 360, 96, 51 ],
            2: [ 14, 91, 51 ],
            3: [ 29, 94, 52 ],
            4: [ 60, 90, 60 ],
            5: [ 73, 73, 55 ],
            6: [ 135, 76, 32 ],
            7: [ 172, 68, 34 ],
            8: [ 248, 82, 28 ],
            9: [ 292, 70, 31 ],
            10: [ 325, 84, 46 ],
            11: [ 330, 84, 34 ]
        },
        'August Aeppli (1940)': {
            format: "HSL",
            ref: 'Gerstner, p.169',
            english: ['red',null,'orange',null,'yellow',null,'green','blue-green',null,'ultramarine blue','violet','purple'],
            0: [ 0, 96, 51 ],
            1: [ 0, 0, 0 ],
            2: [ 29, 94, 52 ],
            3: [ 0, 0, 0 ],
            4: [ 60, 90, 60 ],
            5: [ 0, 0, 0 ],
            6: [ 135, 76, 32 ],
            7: [ 172, 68, 34 ],
            8: [ 0, 0, 0 ],
            9: [ 211, 70, 37 ],
            10: [ 273, 80, 27 ],
            11: [ 302, 88, 26 ]
        },
        'I. J. Belmont (1944)': {
            ref: 'Belmont, p.226',
            english: ['red','red-orange','orange','yellow-orange','yellow','yellow-green','green','blue-green','blue','blue-violet','violet','red-violet'],
            0: [ 360, 96, 51 ],
            1: [ 14, 91, 51 ],
            2: [ 29, 94, 52 ],
            3: [ 50, 93, 52 ],
            4: [ 60, 90, 60 ],
            5: [ 73, 73, 55 ],
            6: [ 135, 76, 32 ],
            7: [ 172, 68, 34 ],
            8: [ 248, 82, 28 ],
            9: [ 313, 78, 37 ],
            10: [ 325, 84, 46 ],
            11: [ 338, 85, 37 ]
        },
        'Steve Zieverink (2004)': {
            format: "HSL",
            ref: 'Cincinnati Contemporary Art Center',
            english: ['yellow-green','green','blue-green','blue','indigo','violet','ultra violet','infra red','red','orange','yellow-white','yellow'],
            0: [ 73, 73, 55 ],
            1: [ 135, 76, 32 ],
            2: [ 172, 68, 34 ],
            3: [ 248, 82, 28 ],
            4: [ 302, 88, 26 ],
            5: [ 325, 84, 46 ],
            6: [ 326, 79, 24 ],
            7: [ 1, 89, 33 ],
            8: [ 360, 96, 51 ],
            9: [ 29, 94, 52 ],
            10: [ 62, 78, 74 ],
            11: [ 60, 90, 60 ]
        },
        'Circle of Fifths (Johnston 2003)': {
            format: "RGB",
            ref: 'Joseph Johnston',
            english: ['yellow', 'blue', 'orange', 'teal', 'red', 'green', 'purple', 'light orange', 'light blue', 'dark orange', 'dark green', 'violet' ],
            0: [ 255, 255, 0 ],
            1: [ 50, 0, 255 ],
            2: [ 255, 150, 0 ],
            3: [ 0, 210, 180 ],
            4: [ 255, 0, 0 ],
            5: [ 130, 255, 0 ],
            6: [ 150, 0, 200 ],
            7: [ 255, 195, 0 ],
            8: [ 30, 130, 255 ],
            9: [ 255, 100, 0 ],
            10: [ 0, 200, 0 ],
            11: [ 225, 0, 225 ]
        },
        'Circle of Fifths (Wheatman 2002)': {
            format: "HEX",
            ref: "Stuart Wheatman", // http://www.valleysfamilychurch.org/
            english: [],
            data: ['#122400', '#2E002E', '#002914', '#470000', '#002142', '#2E2E00', '#290052', '#003D00', '#520029', '#003D3D', '#522900', '#000080', '#244700', '#570057', '#004D26', '#7A0000', '#003B75', '#4C4D00', '#47008F', '#006100', '#850042', '#005C5C', '#804000', '#0000C7', '#366B00', '#80007F', '#00753B', '#B80000', '#0057AD', '#6B6B00', '#6600CC', '#008A00', '#B8005C', '#007F80', '#B35900', '#2424FF', '#478F00', '#AD00AD', '#00994D', '#F00000', '#0073E6', '#8F8F00', '#8A14FF', '#00AD00', '#EB0075', '#00A3A3', '#E07000', '#6B6BFF', '#5CB800', '#DB00DB', '#00C261', '#FF5757', '#3399FF', '#ADAD00', '#B56BFF', '#00D600', '#FF57AB', '#00C7C7', '#FF9124', '#9999FF', '#6EDB00', '#FF29FF', '#00E070', '#FF9999', '#7ABDFF', '#D1D100', '#D1A3FF', '#00FA00', '#FFA3D1', '#00E5E6', '#FFC285', '#C2C2FF', '#80FF00', '#FFA8FF', '#00E070', '#FFCCCC', '#C2E0FF', '#F0F000', '#EBD6FF', '#ADFFAD', '#FFD6EB', '#8AFFFF', '#FFEBD6', '#EBEBFF', '#E0FFC2', '#FFEBFF', '#E5FFF2', '#FFF5F5']      }
    };

    root.map = function(type) {
        var data = {};
        var blend = function(a, b) {
            return [ // blend two colors and round results
                (a[0] * 0.5 + b[0] * 0.5 + 0.5) >> 0,
                (a[1] * 0.5 + b[1] * 0.5 + 0.5) >> 0,
                (a[2] * 0.5 + b[2] * 0.5 + 0.5) >> 0
            ];
        };
        var syn = root.data;
        var colors = syn[type] || syn["D. D. Jameson (1844)"];
        for (var note = 0; note <= 88; note ++) { // creates mapping for 88 notes
            if (colors.data) {
                data[note] = {
                    hsl: colors.data[note],
                    hex: colors.data[note]
                }
            } else { // array
                var clr = colors[(note + 9) % 12];
                var isRGB = colors.format === "RGB";
                if (isRGB) clr = Color.Space(clr, "RGB>HSL");
                var H = Math.round(isRGB ? clr.H : clr[0]);
                var S = Math.round(isRGB ? clr.S : clr[1]);
                var L = Math.round(isRGB ? clr.L : clr[2]);
                if (H == S && S == L) clr = blend(parray, colors[(note + 10) % 12]);
                var amount = L / 10;
                var octave = note / 12 >> 0;
                var octaveLum = L + amount * octave - 3 * amount; // map luminance to octave
                data[note] = {
///                 hsl: 'hsla(' + H + ',' + S + '%,' + octaveLum + '%, 1)',
//                  hex: Color.Space({H:H, S:S, L:octaveLum}, "HSL>RGB>HEX>W3")
                    hsl: 'hsla(' + H + ',' + S + '%,' + L + '%, 1)',
                    hex: Color.Space({H:H, S:S, L:L}, "HSL>RGB>HEX>W3")
                };
                var parray = clr;
            }
        }
        return data;
    };

})(MusicTheory.Synesthesia);



"undefined" === typeof MusicTheory && (MusicTheory = {});
MusicTheory.Scales = {
    Aeolian: [0, 2, 3, 5, 7, 8, 10],
    Altered: [0, 1, 3, 4, 6, 8, 10],
    "Altered b7": [0, 1, 3, 4, 6, 8, 9],
    Arabian: [0, 2, 4, 5, 6, 8, 10],
    Augmented: [0, 3, 4, 7, 8, 11],
    Balinese: [0, 1, 3, 7, 8],
    Blues: [0, 3, 5, 6, 7, 10],
    Byzantine: [0, 1, 4, 5, 7, 8, 11],
    Chinese: [0, 4, 6, 7, 11],
    "Chinese Mongolian": [0, 2, 4, 7, 9],
    Chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    "Diminished (H-W)": [0, 1, 3, 4, 6, 7, 9, 10],
    "Diminished (W-H)": [0, 2, 3, 5, 6, 8, 9, 11],
    Dorian: [0, 2, 3, 5, 7, 9, 10],
    "Dorian b2": [0, 1, 3, 5, 7, 9, 10],
    "Dorian #4": [0, 2, 3, 6, 7, 9, 10],
    "Double Harmonic": [0, 1, 4, 5, 7, 8, 11],
    Enigmatic: [0, 1, 4, 6, 8, 10, 11],
    Egyptian: [0, 2, 5, 7, 10],
    "Eight Tone Spanish": [0, 1, 4, 5, 6, 8, 10],
    "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
    Hindu: [0, 2, 4, 5, 7, 8, 10],
    "Hirajoshi (Japanese)": [0, 2, 3, 7, 8],
    "Hungarian Major": [0, 3, 4, 6, 7, 9, 10],
    "Hungarian Minor": [0, 2, 3, 6, 7, 8, 11],
    Ichikosucho: [0, 2, 4, 5, 6, 7, 9, 11],
    Ionian: [0, 2, 4, 5, 7, 9, 11],
    "Ionian Aug": [0, 2, 4, 5, 8, 9, 11],
    "Iwato (Japanese)": [0, 1, 5, 6, 10],
    Kumoi: [0, 2, 3, 7, 9],
    "Leading Whole Tone": [0, 2, 4, 6, 8, 10, 11],
    Locrian: [0, 1, 3, 5, 6, 8, 10],
    "Locrian 2": [0, 2, 3, 5, 6, 8, 10],
    "Locrian 6": [0, 1, 3, 5, 6,
        9, 10
    ],
    Lydian: [0, 2, 4, 6, 7, 9, 11],
    "Lydian Aug": [0, 2, 4, 6, 8, 9, 11],
    "Lydian b7": [0, 2, 4, 6, 7, 9, 10],
    "Lydian #9": [0, 3, 4, 6, 7, 9, 11],
    "Lydian Diminished": [0, 2, 3, 6, 7, 9, 11],
    "Lydian Minor": [0, 2, 4, 6, 7, 8, 10],
    "Marva (Indian)": [0, 1, 4, 6, 7, 9, 11],
    "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
    Mixolydian: [0, 2, 4, 5, 7, 9, 10],
    "Mixolydian b6": [0, 2, 4, 5, 7, 8, 10],
    Mohammedan: [0, 2, 3, 5, 7, 8, 11],
    "Neopolitan Major": [0, 1, 3, 5, 7, 9, 11],
    "Neopolitan Minor": [0, 1, 3, 5, 7, 8, 10],
    Oriental: [0, 1, 4, 5, 6, 9, 10],
    Overtone: [0, 2, 4, 6, 7, 9, 10],
    "Pelog (Balinese)": [0, 1, 3, 7, 10],
    "Pentatonic Major": [0,
        2, 4, 7, 9
    ],
    "Pentatonic Minor": [0, 3, 5, 7, 10],
    Persian: [0, 1, 4, 5, 6, 8, 11],
    Phrygian: [0, 1, 3, 5, 7, 8, 10],
    Prometheus: [0, 2, 4, 6, 9, 10],
    "Prometheus Neopolitan": [0, 1, 4, 6, 9, 10],
    "Purvi Theta": [0, 1, 4, 6, 7, 8, 11],
    Romanian: [0, 2, 3, 6, 7, 9, 10],
    "Six Tone Symmetrical": [0, 1, 4, 5, 8, 9],
    "Todi (Indian)": [0, 1, 3, 6, 7, 8, 11],
    "Whole Tone": [0, 2, 4, 6, 8, 10]
};
MusicTheory.Solfege = {
    C: {
        poppins: "Doe \u2014 a deer, a female deer.",
        syllable: "Do",
        anglicized: "/do\u028a/"
    },
    "C#": {
        syllable: "Di",
        anglicized: "/di\u02d0/"
    },
    Db: {
        syllable: "Ra",
        anglicized: "/r\u0251\u02d0/"
    },
    D: {
        poppins: "Ray \u2014 a drop of golden sun.",
        syllable: "Re",
        anglicized: "/re\u026a/"
    },
    "D#": {
        syllable: "Ri",
        anglicized: "/ri\u02d0/"
    },
    Eb: {
        syllable: "Me",
        anglicized: "/me\u026a/"
    },
    E: {
        poppins: "Me \u2014 a name I call myself.",
        syllable: "Mi",
        anglicized: "/mi\u02d0/"
    },
    F: {
        poppins: "Far \u2014 a long long way to run.",
        syllable: "Fa",
        anglicized: "/f\u0251\u02d0/"
    },
    "F#": {
        syllable: "Fi",
        anglicized: "/fi\u02d0/"
    },
    Gb: {
        syllable: "Se",
        anglicized: "/se\u026a/"
    },
    G: {
        poppins: "Sew \u2014 a needle pulling thread.",
        syllable: "So",
        anglicized: "/so\u028a/"
    },
    "G#": {
        syllable: "Si",
        anglicized: "/si\u02d0/"
    },
    Ab: {
        syllable: "Le",
        anglicized: "/le\u026a/"
    },
    A: {
        poppins: "La \u2014 a note to follow so.",
        syllable: "La",
        anglicized: "/l\u0251\u02d0/"
    },
    "A#": {
        syllable: "Li",
        anglicized: "/li\u02d0/"
    },
    Bb: {
        syllable: "Te",
        anglicized: "/te\u026a/"
    },
    B: {
        poppins: "Tea \u2014 a drink with jam and bread.",
        syllable: "Ti",
        anglicized: "/ti\u02d0/"
    }
};

(function(b) {
    b.btoa || (b.btoa = function(a) {
        a = escape(a);
        var b = "",
            e, d, k = "",
            m, g, f = "",
            l = 0;
        do e = a.charCodeAt(l++), d = a.charCodeAt(l++), k = a.charCodeAt(l++), m = e >> 2, e = (e & 3) << 4 | d >> 4, g = (d & 15) << 2 | k >> 6, f = k & 63, isNaN(d) ? g = f = 64 : isNaN(k) && (f = 64), b = b + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(m) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(e) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(g) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(f);
        while (l < a.length);
        return b
    });
    b.atob || (b.atob = function(a) {
        var b = "",
            e, d, k = "",
            m, g = "",
            f = 0;
        /[^A-Za-z0-9\+\/\=]/g.exec(a) && alert("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding.");
        a = a.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(f++)), d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(f++)), m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(f++)),
            g = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(f++)), e = e << 2 | d >> 4, d = (d & 15) << 4 | m >> 2, k = (m & 3) << 6 | g, b += String.fromCharCode(e), 64 != m && (b += String.fromCharCode(d)), 64 != g && (b += String.fromCharCode(k)); while (f < a.length);
        return unescape(b)
    })
})(this);


if ("undefined" === typeof DOM) var DOM = {};
(function() {
    DOM.dimensions = function() {
        document.body && (document.body.scrollHeight || (document.body.scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)), window.innerWidth && window.innerHeight || (document.body && document.body.offsetWidth ? (window.innerWidth = document.body.offsetWidth, window.innerHeight = document.body.offsetHeight) : "CSS1Compat" === document.compatMode && (document.documentElement && document.documentElement.offsetWidth) && (window.innerWidth = document.documentElement.offsetWidth,
            window.innerHeight = document.documentElement.offsetHeight)))
    }
})();

if ("undefined" === typeof JSON) var JSON = {};
(function() {
    function b(a) {
        return 10 > a ? "0" + a : a
    }

    function a(a) {
        d.lastIndex = 0;
        return d.test(a) ? '"' + a.replace(d, function(a) {
            var b = g[a];
            return "string" === typeof b ? b : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + a + '"'
    }

    function c(b, d) {
        var e, g, p, s, t = k,
            v, w = d[b];
        w && ("object" === typeof w && "function" === typeof w.toJSON) && (w = w.toJSON(b));
        "function" === typeof f && (w = f.call(d, b, w));
        switch (typeof w) {
            case "string":
                return a(w);
            case "number":
                return isFinite(w) ? String(w) : "null";
            case "boolean":
            case "null":
                return String(w);
            case "object":
                if (!w) return "null";
                k += m;
                v = [];
                if ("[object Array]" === Object.prototype.toString.apply(w)) {
                    s = w.length;
                    for (e = 0; e < s; e += 1) v[e] = c(e, w) || "null";
                    p = 0 === v.length ? "[]" : k ? "[\n" + k + v.join(",\n" + k) + "\n" + t + "]" : "[" + v.join(",") + "]";
                    k = t;
                    return p
                }
                if (f && "object" === typeof f)
                    for (s = f.length, e = 0; e < s; e += 1) "string" === typeof f[e] && (g = f[e], (p = c(g, w)) && v.push(a(g) + (k ? ": " : ":") + p));
                else
                    for (g in w) Object.prototype.hasOwnProperty.call(w, g) && (p = c(g, w)) && v.push(a(g) + (k ? ": " : ":") + p);
                p = 0 === v.length ? "{}" : k ? "{\n" + k + v.join(",\n" +
                    k) + "\n" + t + "}" : "{" + v.join(",") + "}";
                k = t;
                return p
        }
    }
    "function" !== typeof Date.prototype.toJSON && (Date.prototype.toJSON = function(a) {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + b(this.getUTCMonth() + 1) + "-" + b(this.getUTCDate()) + "T" + b(this.getUTCHours()) + ":" + b(this.getUTCMinutes()) + ":" + b(this.getUTCSeconds()) + "Z" : null
    }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(a) {
        return this.valueOf()
    });
    var e = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        d = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        k, m, g = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        },
        f;
    "function" !== typeof JSON.stringify && (JSON.stringify = function(a, b, d) {
        var e;
        m = k = "";
        if ("number" === typeof d)
            for (e = 0; e < d; e += 1) m += " ";
        else "string" === typeof d && (m = d);
        if ((f = b) && "function" !== typeof b && ("object" !== typeof b || "number" !== typeof b.length)) throw Error("JSON.stringify");
        return c("", {
            "": a
        })
    });
    "function" !== typeof JSON.parse && (JSON.parse = function(a, b) {
        function d(a, c) {
            var e, k, f = a[c];
            if (f && "object" === typeof f)
                for (e in f) Object.prototype.hasOwnProperty.call(f, e) && (k = d(f, e), void 0 !== k ? f[e] = k : delete f[e]);
            return b.call(a, c, f)
        }
        var c;
        a = String(a);
        e.lastIndex = 0;
        e.test(a) && (a = a.replace(e, function(a) {
            return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }));
        if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return c = eval("(" + a + ")"), "function" === typeof b ? d({
            "": c
        }, "") : c;
        throw new SyntaxError("JSON.parse");
    })
})();


window.requestAnimationFrame || (window.requestAnimationFrame = function() {
    return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(b, a) {
        window.setTimeout(b, 1E3 / 60)
    }
}());

String.prototype.replaceAll = function(b, a) {
    if ("object" == typeof b) {
        for (var c = this, e = 0; e < b.length; e++) c = c.split(b[e]).join(a[e]);
        return c
    }
    return this.split(b).join(a)
};

String.prototype.trim = function(b) {
    return this.replace(/^\s+|\s+$/g, "")
};

String.prototype.ucfirst = function(b) {
    return this[0].toUpperCase() + this.substr(1)
};

String.prototype.ucwords = function(b) {
    return this.replace(/^(.)|\s(.)/g, function(a) {
        return a.toUpperCase()
    })
};

String.prototype.addslashes = function() {
    return this.replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0")
};

String.prototype.stripslashes = function() {
    return this.replace(/\0/g, "0").replace(/\\([\\'"])/g, "$1")
};

String.format = function(b) {
    var a = Array.prototype.slice.call(arguments, 1, arguments.length);
    return b.replace(/\{(\d+)\}/g, function(b, e) {
        return a[e]
    })
};

String.prototype.basename = function() {
    return this.replace(/\\/g, "/").replace(/.*\//, "")
};

if ("undefined" === typeof widgets) var widgets = {};
(function() {
    var b = {
        "text/css": "string",
        "text/html": "string",
        "text/plain": "string"
    };
    widgets.FileSaver = function(a) {
        "undefined" === typeof a && (a = {});
        var c = a.jsDir || "./inc/",
            e = this;
        this.html5 = "function" === typeof ArrayBuffer;
        this.boot = function() {
            var b = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder,
                d = window.btoa && window.atob,
                g = [];
            g.push({
                src: c + "File/jszip.js",
                verify: "JSZip"
            });
            d || g.push({
                src: c + "Polyfill/Base64.js",
                verify: ["atob", "btoa"]
            });
            b || g.push({
                src: c + "Polyfill/BlobBuilder.js",
                verify: "BlobBuilder"
            });
            e.html5 ? g.push({
                src: c + "File/FileSaver.js",
                verify: "saveAs"
            }) : g.push({
                src: c + "File/downloadify.js",
                verify: ["Downloadify", "swfobject"]
            });
            DOMLoader.script.add({
                srcs: g,
                callback: function() {
                    if (a.onready) a.onready(e)
                }
            });
            return this
        };
        this.download = function(a) {
            if ("function" === typeof saveAs && "function" === typeof BlobBuilder && a.getData) {
                var c = a.getData(),
                    e = a.name,
                    f = a.mime,
                    l = a.charset;
                a = a.extension;
                var n = "";
                if ("string" === typeof c) {
                    if ("data:" === c.substr(0, 5)) {
                        var r = c.substr(5).split(","),
                            c = r[1],
                            f = r[0].split(";")[0];
                        a || (a = f.split("/")[1]);
                        b[r[0]] || (n = "binary")
                    }
                } else n = "binary", f = "application/zip", a = "zip", c = d(c);
                e || (e = "download");
                f || (f = "text/plain");
                a || (a = "txt");
                n || (n = b[f] || "binary");
                r = new BlobBuilder;
                if ("string" === n) r.append(c), l && (f += ";charset=" + l);
                else {
                    for (var c = atob(c), l = new ArrayBuffer(c.length), n = new Uint8Array(l), q = 0; q < c.length; q++) n[q] = c.charCodeAt(q);
                    r.append(l)
                }
                f = r.getBlob(f);
                saveAs(f, e + "." + a)
            }
        };
        this.button = function(a) {
            var b = a.parent || document.body,
                g = a.id,
                f = a.fileName,
                l = a.fileType,
                n = a.getData,
                r = "fake" ===
                a.format,
                q = document.createElement("span"),
                p = document.createElement("span");
            p.id = g;
            p.style.position = "absolute";
            q.style.cssText = "width: inherit; height: inherit;";
            q.className = "downloadify-container";
            q.appendChild(p);
            var s = document.createElement("span");
            s.style.cssText = "width: inherit; height: inherit;";
            s.className = "downloadify";
            a.src ? (p = new Image, p.src = a.src, s.appendChild(p)) : s.innerHTML = a.title ? a.title : f + "." + l;
            q.appendChild(s);
            b.appendChild(q);
            setTimeout(function() {
                var p = b.offsetWidth,
                    v = b.offsetHeight;
                q.style.width = p + "px";
                q.style.height = v + "px";
                var w = document.getElementById(g);
                e.html5 || r ? Event.add(s, "click", function() {
                    if (r) return n();
                    e.download({
                        name: f,
                        extension: l,
                        getData: n
                    })
                }) : (Event.add(w, "mousedown", Event.stop), Downloadify.create(g, {
                    filename: function() {
                        return f + "." + l
                    },
                    data: function() {
                        var a = n();
                        return "string" === typeof a ? a : d(a)
                    },
                    downloadImage: c + "File/downloadify.png",
                    swf: c + "File/downloadify.swf",
                    transparent: !0,
                    append: !1,
                    width: p,
                    height: v,
                    dataType: a.format
                }))
            }, 1)
        };
        var d = function(a) {
            function c(a,
                d) {
                var e = a.data,
                    f = {}; - 1 !== e.indexOf("base64") && (e = e.split(";"), b[e[0].substr(5)] && (f.binary = !1), f.base64 = !0, e = e[1].substr(7));
                d.add(a.name, e, f)
            }
            var d = new JSZip;
            if ("undefined" === typeof a.length)
                if (a.data && a.name) a = [a];
                else {
                    for (var e in a)
                        for (var l = a[e], n = d.folder(e), r = 0, q = l.length; r < q; r++) c(l[r], n);
                    return d.generate()
                }
            r = 0;
            for (q = a.length; r < q; r++) c(a[r], d);
            return d.generate()
        };
        return this.boot()
    }
})();


/*
    ----------------------------------------------------
    Loader.js : 0.4.2 : 2012/11/09
    ----------------------------------------------------
    https://github.com/mudcube/Loader.js
    ----------------------------------------------------
    /// Simple setup.
    var loader = new widgets.Loader;

    /// More complex setup.
    var loader = new widgets.Loader({
        id: "loader",
        bars: 12,
        radius: 0,
        lineWidth: 20,
        lineHeight: 70,
        timeout: 30, // maximum timeout in seconds.
        background: "rgba(0,0,0,0.5)",
        container: document.body,
        oncomplete: function() {
            // call function once loader has completed
        },
        onstart: function() {
            // call function once loader has started
        }
    });

    /// Add a new message to the queue.
    var loaderId = loader.add({
        message: "test",
        getProgress: function() { // sends progress to loader.js
            return progress; // value between 1-100
        }
    });

    /// Remove a specific loader message.
    loader.remove(loaderId);

    /// Recenter the loader within container (run onresize)
    loader.center();

    /// Stop all loader instances.
    loader.stop();
*/

if (typeof (widgets) === "undefined") var widgets = {};

(function() { "use strict";

var PI = Math.PI;
var noCanvas = !document.createElement("canvas").getContext;
var fadeOutSpeed = 400;
var defaultConfig = {
    id: "loader",
    bars: 12,
    radius: 0,
    lineWidth: 20,
    lineHeight: 70,
    timeout: 0,
    display: true
};

widgets.Loader = function (configure) {
    if (noCanvas) return;
    var that = this;
    if (typeof (configure) === "string") configure = { message: configure };
    if (typeof (configure) === "boolean") configure = { display: false };
    if (typeof (configure) === "undefined") configure = {};
    configure.container = configure.container || document.body;
    if (!configure.container) return;

    /// Mixin the default configurations.
    for (var key in defaultConfig) {
        if (typeof (configure[key]) === "undefined") {
            configure[key] = defaultConfig[key];
        }
    }

    /// Setup element
    var canvas = document.getElementById(configure.id);
    if (!canvas) {
        var div = document.createElement("div");
        var span = document.createElement("span");
        span.className = "message";
        div.appendChild(span);
        div.className = defaultConfig.id;
        div.style.cssText = transitionCSS("opacity", fadeOutSpeed);
        this.span = span;
        this.div = div;
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.id = configure.id;
        canvas.style.cssText = "opacity: 1; position: absolute; z-index: 10000;";
        div.appendChild(canvas);
        configure.container.appendChild(div);
    } else {
        this.span = canvas.parentNode.getElementsByTagName("span")[0];
    }

    /// Configure
    var delay = configure.delay;
    var bars = configure.bars;
    var radius = configure.radius;
    var max = configure.lineHeight + 20;
    var size = max * 2 + configure.radius * 2;
    var windowSize = getWindowSize(configure.container);
    var width = windowSize.width - size;
    var height = windowSize.height - size;
    var deviceRatio = window.devicePixelRatio || 1;
    ///
    canvas.width = size * deviceRatio;
    canvas.height = size  * deviceRatio;
    ///
    var iteration = 0;
    var ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

    /// Public functions.
    this.messages = {};
    this.message = function (message, onstart) {
        if (!this.interval) return this.start(onstart, message);
        return this.add({
            message: message,
            onstart: onstart
        });
    };

    this.update = function(id, message, percent) {
        if (!id) for (var id in this.messages);
        if (!id) return this.message(message);
        var item = this.messages[id];
        item.message = message;
        if (typeof(percent) === "number") item.span.innerHTML = percent + "%";
        if (message.substr(-3) === "...") { // animated dots
            item._message = message.substr(0, message.length - 3);
            item.messageAnimate = [".&nbsp;&nbsp;", "..&nbsp;", "..."].reverse();
        } else { // normal
            item._message = message;
            item.messageAnimate = false;
        }
        ///
        item.element.innerHTML = message;
    };

    this.add = function (conf) {
        if (typeof(conf) === "string") conf = { message: conf };
        var background = configure.background ? configure.background : "rgba(0,0,0,0.65)";
        this.span.style.cssText = "background: " + background + ";";
        this.div.style.cssText = transitionCSS("opacity", fadeOutSpeed);
        if (this.stopPropagation) {
            this.div.style.cssText += "background: rgba(0,0,0,0.25);";
        } else {
            this.div.style.cssText += "pointer-events: none;";
        }
        ///
        canvas.parentNode.style.opacity = 1;
        canvas.parentNode.style.display = "block";
        if (configure.background) this.div.style.background = configure.backgrond;
        ///
        var timestamp = (new Date()).getTime();
        var seed = Math.abs(timestamp * Math.random() >> 0);
        var message = conf.message;
        ///
        var container = document.createElement("div");
        container.style.cssText = transitionCSS("opacity", 500);
        var span = document.createElement("span");
        span.style.cssText = "float: right; width: 50px;";
        var node = document.createElement("span");
        node.innerHTML = message;
        ///
        container.appendChild(node);
        container.appendChild(span);
        ///
        var item = this.messages[seed] = {
            seed: seed,
            container: container,
            element: node,
            span: span,
            message: message,
            timeout: (conf.timeout || configure.timeout) * 1000,
            timestamp: timestamp,
            getProgress: conf.getProgress
        };
        this.span.appendChild(container);
        this.span.style.display = "block";
        this.update(item.seed, message);
        /// Escape event loop.
        if (conf.onstart) {
            window.setTimeout(conf.onstart, 50);
        }
        ///
        this.center();
        ///
        if (!this.interval) {
            if (!conf.delay) renderAnimation();
            window.clearInterval(this.interval);
            this.interval = window.setInterval(renderAnimation, 30);
        }
        /// Return identifier.
        return seed;
    };

    this.remove = function (seed) {
        iteration += 0.07;
        var timestamp = (new Date()).getTime();
        if (typeof(seed) === "object") seed = seed.join(":");
        if (seed) seed = ":" + seed + ":";
        /// Remove element.
        for (var key in this.messages) {
            var item = this.messages[key];
            if (!seed || seed.indexOf(":" + item.seed + ":") !== -1) {
                delete this.messages[item.seed];
                item.container.style.color = "#99ff88";
                removeChild(item);
                if (item.getProgress) item.span.innerHTML = "100%";
            }
        }
    };

    this.start = function (onstart, message) {
        if (!(message || configure.message)) return;
        return this.add({
            message: message || configure.message,
            onstart: onstart
        });
    };

    this.stop = function () {
        this.remove();
        window.clearInterval(this.interval);
        delete this.interval;
        if (configure.oncomplete) configure.oncomplete();
        if (canvas && canvas.style) {
            div.style.cssText += "pointer-events: none;";
            window.setTimeout(function() {
                that.div.style.opacity = 0;
            }, 1);
            window.setTimeout(function () {
                if (that.interval) return;
                that.stopPropagation = false;
                canvas.parentNode.style.display = "none";
                ctx.clearRect(0, 0, size, size);
            }, fadeOutSpeed * 1000);
        }
    };

    this.center = function() {
        var windowSize = getWindowSize(configure.container);
        var width = windowSize.width - size;
        var height = windowSize.height - size;
        /// Center the animation within the content.
        canvas.style.left = (width / 2) + "px";
        canvas.style.top = (height / 2) + "px";
        canvas.style.width = (size) + "px";
        canvas.style.height = (size) + "px";
        that.span.style.top = (height / 2 + size - 10) + "px";
    };

    var style = document.createElement("style");
    style.innerHTML = '\
.loader { color: #fff; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; opacity: 0; display: none; }\
.loader span.message { font-family: monospace; font-size: 14px; margin: auto; opacity: 1; display: none; border-radius: 10px; padding: 0px; width: 300px; text-align: center; position: absolute; z-index: 10000; left: 0; right: 0; }\
.loader span.message div { border-bottom: 1px solid #222; padding: 5px 10px; clear: both; text-align: left; opacity: 1; }\
.loader span.message div:last-child { border-bottom: none; }\
';
    document.head.appendChild(style);
    /// Private functions.
    var removeChild = function(item) {
        window.setTimeout(function() { // timeout in case within same event loop.
            item.container.style.opacity = 0;
        }, 1);
        window.setTimeout(function() { // wait for opacity=0 before removing the element.
            item.container.parentNode.removeChild(item.container);
        }, 250);
    };
    var renderAnimation = function () {
        var timestamp = (new Date()).getTime();
        for (var key in that.messages) {
            var item = that.messages[key];
            var nid = iteration / 0.07 >> 0;
            if (nid % 5 === 0 && item.getProgress) {
                if (item.timeout && item.timestamp && timestamp - item.timestamp > item.timeout) {
                    that.remove(item.seed);
                    continue;
                }
                var progress = item.getProgress();
                if (progress >= 100) {
                    that.remove(item.seed);
                    continue;
                }
                item.span.innerHTML = (progress >> 0) + "%";
            }
            if (nid % 10 === 0) {
                if (item.messageAnimate) {
                        var length = item.messageAnimate.length;
                        var n = nid / 10 % length;
                        var text = item._message + item.messageAnimate[n];
                        item.element.innerHTML = text;
                }
            }
        }
        if (!key) {
            that.stop();
        }
        //
        ctx.save();
        ctx.clearRect(0, 0, size * deviceRatio, size * deviceRatio);
        ctx.scale(deviceRatio, deviceRatio);
        ctx.translate(size / 2, size / 2);
        var hues = 360 - 360 / bars;
        for (var i = 0; i < bars; i++) {
            var angle = (i / bars * 2 * PI) + iteration;
            ctx.save();
            ctx.translate(radius * Math.sin(-angle), radius * Math.cos(-angle));
            ctx.rotate(angle);
            // round-rect properties
            var x = -configure.lineWidth / 2;
            var y = 0;
            var width = configure.lineWidth;
            var height = configure.lineHeight;
            var curve = width / 2;
            // round-rect path
            ctx.beginPath();
            ctx.moveTo(x + curve, y);
            ctx.lineTo(x + width - curve, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + curve);
            ctx.lineTo(x + width, y + height - curve);
            ctx.quadraticCurveTo(x + width, y + height, x + width - curve, y + height);
            ctx.lineTo(x + curve, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - curve);
            ctx.lineTo(x, y + curve);
            ctx.quadraticCurveTo(x, y, x + curve, y);
            // round-rect fill
            var hue = ((i / (bars - 1)) * hues);
            ctx.fillStyle = "hsla(" + hue + ", 100%, 50%, 0.85)";
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
        iteration += 0.07;
    };
    //
    if (configure.display === false) return this;
    //
    this.start();
    //
    return this;
};

////

var transitionCSS = function(type, ms) {
    return '\
        -webkit-transition-property: '+type+';\
        -webkit-transition-duration: '+ms+'ms;\
        -moz-transition-property: '+type+';\
        -moz-transition-duration: '+ms+'ms;\
        -o-transition-property: '+type+';\
        -o-transition-duration: '+ms+'ms;\
        -ms-transition-property: '+type+';\
        -ms-transition-duration: '+ms+'ms;';
};

var getWindowSize = function (element) {
    if (window.innerWidth && window.innerHeight) {
        var width = window.innerWidth;
        var height = window.innerHeight;
    } else if (document.compatMode === "CSS1Compat" && document.documentElement && document.documentElement.offsetWidth) {
        var width = document.documentElement.offsetWidth;
        var height = document.documentElement.offsetHeight;
    } else if (document.body && document.body.offsetWidth) {
        var width = document.body.offsetWidth;
        var height = document.body.offsetHeight;
    }
    if (element) {
        var width = element.offsetWidth;
    }
    return {
        width: width,
        height: height
    };
};
})();



"undefined" === typeof DOMLoader && (DOMLoader = {});
DOMLoader.script = function() {
    this.loaded = {};
    this.loading = {};
    return this
};

DOMLoader.script.prototype.add = function(b) {
    var a = this;
    "string" === typeof b && (b = {
        src: b
    });
    var c = b.srcs;
    "undefined" === typeof c && (c = [{
        src: b.src,
        verify: b.verify
    }]);
    var e = document.getElementsByTagName("head")[0],
        d = function(b, d) {
            if (!(a.loaded[b.src] || d && "undefined" === typeof window[d])) {
                a.loaded[b.src] = !0;
                if (a.loading[b.src]) a.loading[b.src]();
                delete a.loading[b.src];
                b.callback && b.callback();
                "undefined" !== typeof l && l()
            }
        },
        k = [],
        m = function(c) {
            "string" === typeof c && (c = {
                src: c,
                verify: b.verify
            });
            if (/([\w\d.])$/.test(c.verify))
                if (c.test =
                    c.verify, "object" === typeof c.test)
                    for (var f in c.test) k.push(c.test[f]);
                else k.push(c.test);
            a.loaded[c.src] || (f = document.createElement("script"), f.onreadystatechange = function() {
                "loaded" !== this.readyState && "complete" !== this.readyState || d(c)
            }, f.onload = function() {
                d(c)
            }, f.onerror = function() {}, f.setAttribute("type", "text/javascript"), f.setAttribute("src", c.src), e.appendChild(f), a.loading[c.src] = function() {})
        },
        g = function(a) {
            if (a) d(a, a.test);
            else
                for (var e = 0; e < c.length; e++) d(c[e], c[e].test);
            for (var f = !0,
                    e = 0; e < k.length; e++) {
                var l = k[e];
                if (l && -1 !== l.indexOf(".")) {
                    var l = l.split("."),
                        m = window[l[0]];
                    "undefined" !== typeof m && (2 === l.length ? "undefined" === typeof m[l[1]] && (f = !1) : 3 === l.length && "undefined" === typeof m[l[1]][l[2]] && (f = !1))
                } else "undefined" === typeof window[l] && (f = !1)
            }!b.strictOrder && f ? b.callback && b.callback() : setTimeout(function() {
                g(a)
            }, 10)
        };
    if (b.strictOrder) {
        var f = -1,
            l = function() {
                f++;
                if (c[f]) {
                    var d = c[f],
                        e = d.src;
                    a.loading[e] ? a.loading[e] = function() {
                        d.callback && d.callback();
                        l()
                    } : a.loaded[e] ? l() : (m(d),
                        g(d))
                } else b.callback && b.callback()
            };
        l()
    } else {
        for (f = 0; f < c.length; f++) m(c[f]);
        g()
    }
};

DOMLoader.script = new DOMLoader.script;
"undefined" === typeof DOMLoader && (DOMLoader = {});
if (typeof (XMLHttpRequest) === "undefined") {
    var XMLHttpRequest;
    (function () { // find equivalent for IE
        var factories = [
        function () {
            return new ActiveXObject("Msxml2.XMLHTTP")
        }, function () {
            return new ActiveXObject("Msxml3.XMLHTTP")
        }, function () {
            return new ActiveXObject("Microsoft.XMLHTTP")
        }];
        for (var i = 0; i < factories.length; i++) {
            try {
                factories[i]();
            } catch (e) {
                continue;
            }
            break;
        }
        XMLHttpRequest = factories[i];
    })();
}

if (typeof ((new XMLHttpRequest()).responseText) === "undefined") {
    // http://stackoverflow.com/questions/1919972/how-do-i-access-xhr-responsebody-for-binary-data-from-javascript-in-ie
    var IEBinaryToArray_ByteStr_Script =
    "<!-- IEBinaryToArray_ByteStr -->\r\n"+
    "<script type='text/vbscript'>\r\n"+
    "Function IEBinaryToArray_ByteStr(Binary)\r\n"+
    "   IEBinaryToArray_ByteStr = CStr(Binary)\r\n"+
    "End Function\r\n"+
    "Function IEBinaryToArray_ByteStr_Last(Binary)\r\n"+
    "   Dim lastIndex\r\n"+
    "   lastIndex = LenB(Binary)\r\n"+
    "   if lastIndex mod 2 Then\r\n"+
    "       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n"+
    "   Else\r\n"+
    "       IEBinaryToArray_ByteStr_Last = "+'""'+"\r\n"+
    "   End If\r\n"+
    "End Function\r\n"+
    "</script>\r\n";

    // inject VBScript
    document.write(IEBinaryToArray_ByteStr_Script);

    DOMLoader.sendRequest = function(conf) {
        // helper to convert from responseBody to a "responseText" like thing
        function getResponseText(binary) {
            var byteMapping = {};
            for (var i = 0; i < 256; i++) {
                for (var j = 0; j < 256; j++) {
                    byteMapping[String.fromCharCode(i + j * 256)] = String.fromCharCode(i) + String.fromCharCode(j);
                }
            }
            // call into VBScript utility fns
            var rawBytes = IEBinaryToArray_ByteStr(binary);
            var lastChr = IEBinaryToArray_ByteStr_Last(binary);
            return rawBytes.replace(/[\s\S]/g, function (match) {
                return byteMapping[match];
            }) + lastChr;
        };
        //
        var req = XMLHttpRequest();
        req.open("GET", conf.url, true);
        if (conf.responseType) req.responseType = conf.responseType;
        if (conf.onerror) req.onerror = conf.onerror;
        if (conf.onprogress) req.onprogress = conf.onprogress;
        req.onreadystatechange = function (event) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    req.responseText = getResponseText(req.responseBody);
                } else {
                    req = false;
                }
                if (conf.onload) conf.onload(req);
            }
        };
        req.setRequestHeader("Accept-Charset", "x-user-defined");
        req.send(null);
        return req;
    }
} else {
    DOMLoader.sendRequest = function(conf) {
        var req = new XMLHttpRequest();
        req.open(conf.data ? "POST" : "GET", conf.url, true);
        if (req.overrideMimeType) req.overrideMimeType("text/plain; charset=x-user-defined");
        if (conf.data) req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        if (conf.responseType) req.responseType = conf.responseType;
        if (conf.onerror) req.onerror = conf.onerror;
        if (conf.onprogress) req.onprogress = conf.onprogress;
        req.onreadystatechange = function (event) {
            if (req.readyState === 4) {
                if (req.status !== 200 && req.status != 304) {
                    if (conf.onerror) conf.onerror(event, false);
                    return;
                }
                if (conf.onload) {
                    conf.onload(req);
                }
            }
        };
        req.send(conf.data);
        return req;
    };
}


if ("undefined" === typeof Event) var Event = {};
if ("undefined" === typeof eventjs) var eventjs = Event;
Event = function(b) {
    b.modifyEventListener = !0;
    b.modifySelectors = !0;
    b.add = function(a, b, d, e) {
        return c(a, b, d, e, "add")
    };
    b.remove = function(a, b, d, e) {
        return c(a, b, d, e, "remove")
    };
    b.stop = function(a) {
        a.stopPropagation && a.stopPropagation();
        a.cancelBubble = !0;
        a.bubble = 0
    };
    b.prevent = function(a) {
        a.preventDefault && a.preventDefault();
        a.returnValue = !1
    };
    b.cancel = function(a) {
        b.stop(a);
        b.prevent(a)
    };
    b.supports = function(a, b) {
        "string" === typeof a && (b = a, a = window);
        b = "on" + b;
        if (b in a) return !0;
        a.setAttribute || (a = document.createElement("div"));
        if (a.setAttribute && a.removeAttribute) {
            a.setAttribute(b, "");
            var d = "function" === typeof a[b];
            "undefined" !== typeof a[b] && (a[b] = null);
            a.removeAttribute(b);
            return d
        }
    };
    var a = function(b) {
            if (!b || "object" !== typeof b) return b;
            var d = new b.constructor,
                c;
            for (c in b) d[c] = b[c] && "object" === typeof b[c] ? a(b[c]) : b[c];
            return d
        },
        c = function(g, q, p, s, t, v) {
            s = s || {};
            if (g && q && p)
                if ("string" === typeof g && "ready" === q) var w = (new Date).getTime(),
                    F = s.timeout,
                    B = window.setInterval(function() {
                        (new Date).getTime() - w > F && window.clearInterval(B);
                        document.querySelector(g) && (window.clearInterval(B), setTimeout(p, 1))
                    }, s.interval || 1E3 / 60);
                else {
                    if ("string" === typeof g) {
                        g = document.querySelectorAll(g);
                        if (0 === g.length) return d("Missing target on listener!");
                        1 === g.length && (g = g[0])
                    }
                    var x = {};
                    if (0 < g.length && g !== window) {
                        for (var u = 0, y = g.length; u < y; u++)(v = c(g[u], q, p, a(s), t)) && (x[u] = v);
                        return e(x)
                    }
                    q.indexOf && -1 !== q.indexOf(" ") && (q = q.split(" "));
                    q.indexOf && -1 !== q.indexOf(",") && (q = q.split(","));
                    if ("string" !== typeof q) {
                        if ("number" === typeof q.length)
                            for (u = 0,
                                y = q.length; u < y; u++)(v = c(g, q[u], p, a(s), t)) && (x[q[u]] = v);
                        else
                            for (u in q)(v = "function" === typeof q[u] ? c(g, u, q[u], a(s), t) : c(g, u, q[u].listener, a(q[u]), t)) && (x[u] = v);
                        return e(x)
                    }
                    if ("function" !== typeof p) return d("Listener is not a function!");
                    x = s.useCapture || !1;
                    u = k(q) + f(g) + "." + f(p) + "." + (x ? 1 : 0);
                    if (b.Gesture && b.Gesture._gestureHandlers[q])
                        if ("remove" === t) {
                            if (!m[u]) return;
                            m[u].remove();
                            delete m[u]
                        } else {
                            if ("add" === t) {
                                if (m[u]) return m[u];
                                if (s.useCall && !b.modifyEventListener) {
                                    var z = p;
                                    p = function(a, b) {
                                        for (var d in b) a[d] =
                                            b[d];
                                        return z.call(g, a)
                                    }
                                }
                                s.gesture = q;
                                s.target = g;
                                s.listener = p;
                                s.fromOverwrite = v;
                                m[u] = b.proxy[q](s)
                            }
                        } else if (q = k(q), "remove" === t) {
                        if (!m[u]) return;
                        g[n](q, p, x);
                        delete m[u]
                    } else if ("add" === t) {
                        if (m[u]) return m[u];
                        g[l](q, p, x);
                        m[u] = {
                            type: q,
                            target: g,
                            listener: p,
                            remove: function() {
                                b.remove(g, q, p, s)
                            }
                        }
                    }
                    return m[u]
                }
        },
        e = function(a) {
            return {
                remove: function() {
                    for (var b in a) a[b].remove()
                },
                add: function() {
                    for (var b in a) a[b].add()
                }
            }
        },
        d = function(a) {
            "undefined" !== typeof console && "undefined" !== typeof console.error && console.error(a)
        },
        k = function() {
            var a = {};
            return function(d) {
                b.pointerType || (window.navigator.msPointerEnabled ? (b.pointerType = "mspointer", a = {
                    mousedown: "MSPointerDown",
                    mousemove: "MSPointerMove",
                    mouseup: "MSPointerUp"
                }) : b.supports("touchstart") ? (b.pointerType = "touch", a = {
                    mousedown: "touchstart",
                    mouseup: "touchend",
                    mousemove: "touchmove"
                }) : b.pointerType = "mouse");
                a[d] && (d = a[d]);
                return document.addEventListener ? d : "on" + d
            }
        }(),
        m = {},
        g = 0,
        f = function(a) {
            if (a === window) return "#window";
            if (a === document) return "#document";
            if (!a) return d("Missing target on listener!");
            a.uniqueID || (a.uniqueID = "id" + g++);
            return a.uniqueID
        },
        l = document.addEventListener ? "addEventListener" : "attachEvent",
        n = document.removeEventListener ? "removeEventListener" : "detachEvent";
    b.createPointerEvent = function(a, d, c) {
        var e = d.gesture,
            f = d.target,
            g = a.changedTouches || b.proxy.getCoords(a);
        if (g.length) {
            var l = g[0];
            d.pointers = c ? [] : g;
            d.pageX = l.pageX;
            d.pageY = l.pageY;
            d.x = d.pageX;
            d.y = d.pageY
        }
        c = document.createEvent("Event");
        c.initEvent(e, !0, !0);
        c.originalEvent = a;
        for (var k in d) "target" !== k && (c[k] = d[k]);
        f.dispatchEvent(c)
    };
    b.modifyEventListener && window.HTMLElement && function() {
        var a = function(a) {
            var d = function(d) {
                var e = d + "EventListener",
                    f = a[e];
                a[e] = function(a, e, g) {
                    if (b.Gesture && b.Gesture._gestureHandlers[a]) {
                        var l = g;
                        "object" === typeof g ? l.useCall = !0 : l = {
                            useCall: !0,
                            useCapture: g
                        };
                        c(this, a, e, l, d, !0);
                        f.call(this, a, e, g)
                    } else f.call(this, k(a), e, g)
                }
            };
            d("add");
            d("remove")
        };
        navigator.userAgent.match(/Firefox/) ? (a(HTMLDivElement.prototype), a(HTMLCanvasElement.prototype)) : a(HTMLElement.prototype);
        a(document);
        a(window)
    }();
    b.modifySelectors &&
        function() {
            var a = NodeList.prototype;
            a.removeEventListener = function(a, b, d) {
                for (var c = 0, e = this.length; c < e; c++) this[c].removeEventListener(a, b, d)
            };
            a.addEventListener = function(a, b, d) {
                for (var c = 0, e = this.length; c < e; c++) this[c].addEventListener(a, b, d)
            }
        }();
    return b
}(Event);

"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    b.pointerSetup = function(a, b) {
        a.doc = a.target.ownerDocument || a.target;
        a.minFingers = a.minFingers || a.fingers || 1;
        a.maxFingers = a.maxFingers || a.fingers || Infinity;
        a.position = a.position || "relative";
        delete a.fingers;
        b = b || {};
        b.gesture = a.gesture;
        b.target = a.target;
        b.pointerType = Event.pointerType;
        Event.modifyEventListener && a.fromOverwrite && (a.listener = Event.createPointerEvent);
        var e = 0,
            d = 0 === b.gesture.indexOf("pointer") && Event.modifyEventListener ? "pointer" : "mouse";
        b.listener = a.listener;
        b.proxy =
            function(d) {
                b.defaultListener = a.listener;
                a.listener = d;
                d(a.event, b)
            };
        b.attach = function() {
            a.onPointerDown && Event.add(a.target, d + "down", a.onPointerDown);
            a.onPointerMove && Event.add(a.doc, d + "move", a.onPointerMove);
            a.onPointerUp && Event.add(a.doc, d + "up", a.onPointerUp)
        };
        b.remove = function() {
            a.onPointerDown && Event.remove(a.target, d + "down", a.onPointerDown);
            a.onPointerMove && Event.remove(a.doc, d + "move", a.onPointerMove);
            a.onPointerUp && Event.remove(a.doc, d + "up", a.onPointerUp);
            b.reset()
        };
        b.pause = function(b) {
            !a.onPointerMove ||
                b && !b.move || Event.remove(a.doc, d + "move", a.onPointerMove);
            !a.onPointerUp || b && !b.up || Event.remove(a.doc, d + "up", a.onPointerUp);
            e = a.fingers;
            a.fingers = 0
        };
        b.resume = function(b) {
            !a.onPointerMove || b && !b.move || Event.add(a.doc, d + "move", a.onPointerMove);
            !a.onPointerUp || b && !b.up || Event.add(a.doc, d + "up", a.onPointerUp);
            a.fingers = e
        };
        b.reset = function() {
            delete a.tracker;
            a.fingers = 0
        };
        return b
    };
    b.pointerStart = function(a, c, e) {
        var d = function(a, b) {
            var d = e.bbox,
                c = m[b] = {};
            switch (e.position) {
                case "absolute":
                    c.offsetX = 0;
                    c.offsetY =
                        0;
                    break;
                case "difference":
                    c.offsetX = a.pageX;
                    c.offsetY = a.pageY;
                    break;
                case "move":
                    c.offsetX = a.pageX - d.x1;
                    c.offsetY = a.pageY - d.y1;
                    break;
                default:
                    c.offsetX = d.x1, c.offsetY = d.y1
            }
            if ("relative" === e.position) var f = (a.pageX + d.scrollLeft - c.offsetX) * d.scaleX,
                d = (a.pageY + d.scrollTop - c.offsetY) * d.scaleY;
            else f = a.pageX - c.offsetX, d = a.pageY - c.offsetY;
            c.rotation = 0;
            c.scale = 1;
            c.startTime = c.moveTime = (new Date).getTime();
            c.move = {
                x: f,
                y: d
            };
            c.start = {
                x: f,
                y: d
            };
            e.fingers++
        };
        e.event = a;
        c.defaultListener && (e.listener = c.defaultListener,
            delete c.defaultListener);
        var k = !e.fingers,
            m = e.tracker;
        a = a.changedTouches || b.getCoords(a);
        for (var g = a.length, f = 0; f < g; f++) {
            var l = a[f],
                n = l.identifier || Infinity;
            if (e.fingers) {
                if (e.fingers >= e.maxFingers) {
                    d = [];
                    for (n in e.tracker) d.push(n);
                    c.identifier = d.join(",");
                    return k
                }
                var r = 0,
                    q;
                for (q in m) {
                    if (m[q].up) {
                        delete m[q];
                        d(l, n);
                        e.cancel = !0;
                        break
                    }
                    r++
                }
                m[n] || d(l, n)
            } else m = e.tracker = {}, c.bbox = e.bbox = b.getBoundingBox(e.target), e.fingers = 0, e.cancel = !1, d(l, n)
        }
        d = [];
        for (n in e.tracker) d.push(n);
        c.identifier = d.join(",");
        return k
    };
    b.pointerEnd = function(a, b, e, d) {
        var k = a.touches || [],
            m = k.length;
        a = {};
        for (var g = 0; g < m; g++) {
            var f = k[g].identifier;
            a[f || Infinity] = !0
        }
        for (f in e.tracker) k = e.tracker[f], a[f] || k.up || (d && d({
            pageX: k.pageX,
            pageY: k.pageY,
            changedTouches: [{
                pageX: k.pageX,
                pageY: k.pageY,
                identifier: "Infinity" === f ? Infinity : f
            }]
        }, "up"), k.up = !0, e.fingers--);
        if (0 !== e.fingers) return !1;
        d = [];
        e.gestureFingers = 0;
        for (f in e.tracker) e.gestureFingers++, d.push(f);
        b.identifier = d.join(",");
        return !0
    };
    b.getCoords = function(a) {
        b.getCoords = "undefined" !==
            typeof a.pageX ? function(a) {
                return Array({
                    type: "mouse",
                    x: a.pageX,
                    y: a.pageY,
                    pageX: a.pageX,
                    pageY: a.pageY,
                    identifier: Infinity
                })
            } : function(a) {
                a = a || window.event;
                return Array({
                    type: "mouse",
                    x: a.clientX + document.documentElement.scrollLeft,
                    y: a.clientY + document.documentElement.scrollTop,
                    pageX: a.clientX + document.documentElement.scrollLeft,
                    pageY: a.clientY + document.documentElement.scrollTop,
                    identifier: Infinity
                })
            };
        return b.getCoords(a)
    };
    b.getCoord = function(a) {
        if ("ontouchstart" in window) {
            var c = 0,
                e = 0;
            b.getCoord = function(a) {
                a =
                    a.changedTouches;
                return a.length ? {
                    x: c = a[0].pageX,
                    y: e = a[0].pageY
                } : {
                    x: c,
                    y: e
                }
            }
        } else b.getCoord = "undefined" !== typeof a.pageX && "undefined" !== typeof a.pageY ? function(a) {
            return {
                x: a.pageX,
                y: a.pageY
            }
        } : function(a) {
            a = a || window.event;
            return {
                x: a.clientX + document.documentElement.scrollLeft,
                y: a.clientY + document.documentElement.scrollTop
            }
        };
        return b.getCoord(a)
    };
    b.getBoundingBox = function(a) {
        if (a === window || a === document) a = document.body;
        var b = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            scrollLeft: 0,
            scrollTop: 0
        };
        a === document.body ? (b.height =
            window.innerHeight, b.width = window.innerWidth) : (b.height = a.offsetHeight, b.width = a.offsetWidth);
        b.scaleX = a.width / b.width || 1;
        b.scaleY = a.height / b.height || 1;
        for (var e = a; null !== e;) b.x1 += e.offsetLeft, b.y1 += e.offsetTop, e = e.offsetParent;
        for (e = a.parentNode; null !== e && e !== document.body && void 0 !== e.scrollTop;) b.scrollLeft += e.scrollLeft, b.scrollTop += e.scrollTop, e = e.parentNode;
        b.x2 = b.x1 + b.width;
        b.y2 = b.y1 + b.height;
        return b
    };
    (function() {
        var a = navigator.userAgent.toLowerCase(),
            c = -1 !== a.indexOf("macintosh"),
            e = c && -1 !==
            a.indexOf("khtml") ? {
                91: !0,
                93: !0
            } : c && -1 !== a.indexOf("firefox") ? {
                224: !0
            } : {
                17: !0
            };
        b.isMetaKey = function(a) {
            return !!e[a.keyCode]
        };
        b.metaTracker = function(a) {
            e[a.keyCode] && (b.metaKey = "keydown" === a.type)
        }
    })();
    return b
}(Event.proxy);


"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    b.click = function(a) {
        a.maxFingers = a.maxFingers || a.fingers || 1;
        var c;
        a.onPointerDown = function(d) {
            b.pointerStart(d, e, a) && (Event.add(a.doc, "mousemove", a.onPointerMove).listener(d), Event.add(a.doc, "mouseup", a.onPointerUp))
        };
        a.onPointerMove = function(a) {
            c = a
        };
        a.onPointerUp = function(d) {
            if (b.pointerEnd(d, e, a) && (Event.remove(a.doc, "mousemove", a.onPointerMove), Event.remove(a.doc, "mouseup", a.onPointerUp), !(c.cancelBubble && 1 < ++c.bubble))) {
                var k = (c.changedTouches || b.getCoords(c))[0];
                d = a.bbox;
                var m = b.getBoundingBox(a.target);
                if ("relative" === a.position) var g = (k.pageX + d.scrollLeft - d.x1) * d.scaleX,
                    k = (k.pageY + d.scrollTop - d.y1) * d.scaleY;
                else g = k.pageX - d.x1, k = k.pageY - d.y1;
                0 < g && (g < d.width && 0 < k && k < d.height && d.scrollTop === m.scrollTop) && a.listener(c, e)
            }
        };
        var e = b.pointerSetup(a);
        e.state = "click";
        Event.add(a.target, "mousedown", a.onPointerDown);
        return e
    };
    Event.Gesture = Event.Gesture || {};
    Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
    Event.Gesture._gestureHandlers.click = b.click;
    return b
}(Event.proxy);

"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    b.dbltap = b.dblclick = function(a) {
        a.maxFingers = a.maxFingers || a.fingers || 1;
        var c, e, d, k, m;
        a.onPointerDown = function(f) {
            var l = f.changedTouches || b.getCoords(f);
            c && !e ? (m = l[0], e = (new Date).getTime() - c) : (k = l[0], c = (new Date).getTime(), e = 0, clearTimeout(d), d = setTimeout(function() {
                c = 0
            }, 700));
            b.pointerStart(f, g, a) && (Event.add(a.doc, "mousemove", a.onPointerMove).listener(f), Event.add(a.doc, "mouseup", a.onPointerUp))
        };
        a.onPointerMove = function(f) {
            c && !e && (m = (f.changedTouches || b.getCoords(f))[0]);
            f = a.bbox;
            if ("relative" === a.position) var g = (m.pageX + f.scrollLeft - f.x1) * f.scaleX,
                n = (m.pageY + f.scrollTop - f.y1) * f.scaleY;
            else g = m.pageX - f.x1, n = m.pageY - f.y1;
            0 < g && g < f.width && 0 < n && n < f.height && 25 >= Math.abs(m.pageX - k.pageX) && 25 >= Math.abs(m.pageY - k.pageY) || (Event.remove(a.doc, "mousemove", a.onPointerMove), clearTimeout(d), c = e = 0)
        };
        a.onPointerUp = function(f) {
            b.pointerEnd(f, g, a) && (Event.remove(a.doc, "mousemove", a.onPointerMove), Event.remove(a.doc, "mouseup", a.onPointerUp));
            c && e && (700 >= e && !(f.cancelBubble && 1 < ++f.bubble) &&
                (g.state = a.gesture, a.listener(f, g)), clearTimeout(d), c = e = 0)
        };
        var g = b.pointerSetup(a);
        g.state = "dblclick";
        Event.add(a.target, "mousedown", a.onPointerDown);
        return g
    };
    Event.Gesture = Event.Gesture || {};
    Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
    Event.Gesture._gestureHandlers.dbltap = b.dbltap;
    Event.Gesture._gestureHandlers.dblclick = b.dblclick;
    return b
}(Event.proxy);

"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    b.dragElement = function(a, c) {
        b.drag({
            event: c,
            target: a,
            position: "move",
            listener: function(b, d) {
                a.style.left = d.x + "px";
                a.style.top = d.y + "px";
                Event.prevent(b)
            }
        })
    };
    b.drag = function(a) {
        a.gesture = "drag";
        a.onPointerDown = function(e) {
            b.pointerStart(e, c, a) && !a.monitor && (Event.add(a.doc, "mousemove", a.onPointerMove), Event.add(a.doc, "mouseup", a.onPointerUp));
            a.onPointerMove(e, "down")
        };
        a.onPointerMove = function(e, d) {
            if (!a.tracker) return a.onPointerDown(e);
            for (var k = a.bbox, m = e.changedTouches ||
                    b.getCoords(e), g = m.length, f = 0; f < g; f++) {
                var l = m[f],
                    n = l.identifier || Infinity,
                    r = a.tracker[n];
                r && (r.pageX = l.pageX, r.pageY = l.pageY, c.state = d || "move", c.identifier = n, c.start = r.start, c.fingers = a.fingers, "relative" === a.position ? (c.x = (r.pageX + k.scrollLeft - r.offsetX) * k.scaleX, c.y = (r.pageY + k.scrollTop - r.offsetY) * k.scaleY) : (c.x = r.pageX - r.offsetX, c.y = r.pageY - r.offsetY), a.listener(e, c))
            }
        };
        a.onPointerUp = function(e) {
            b.pointerEnd(e, c, a, a.onPointerMove) && !a.monitor && (Event.remove(a.doc, "mousemove", a.onPointerMove),
                Event.remove(a.doc, "mouseup", a.onPointerUp))
        };
        var c = b.pointerSetup(a);
        if (a.event) a.onPointerDown(a.event);
        else Event.add(a.target, "mousedown", a.onPointerDown), a.monitor && (Event.add(a.doc, "mousemove", a.onPointerMove), Event.add(a.doc, "mouseup", a.onPointerUp));
        return c
    };
    Event.Gesture = Event.Gesture || {};
    Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
    Event.Gesture._gestureHandlers.drag = b.drag;
    return b
}(Event.proxy);

"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    var a = Math.PI / 180;
    b.gesture = function(c) {
        c.minFingers = c.minFingers || c.fingers || 2;
        c.onPointerDown = function(a) {
            var k = c.fingers;
            b.pointerStart(a, e, c) && (Event.add(c.doc, "mousemove", c.onPointerMove), Event.add(c.doc, "mouseup", c.onPointerUp));
            if (c.fingers === c.minFingers && k !== c.fingers) {
                e.fingers = c.minFingers;
                e.scale = 1;
                e.rotation = 0;
                e.state = "start";
                var k = "",
                    m;
                for (m in c.tracker) k += m;
                e.identifier = parseInt(k);
                c.listener(a, e)
            }
        };
        c.onPointerMove = function(d, k) {
            for (var m = c.bbox, g = c.tracker,
                    f = d.changedTouches || b.getCoords(d), l = f.length, n = 0; n < l; n++) {
                var r = f[n],
                    q = r.identifier || Infinity,
                    p = g[q];
                p && ("relative" === c.position ? (p.move.x = (r.pageX + m.scrollLeft - m.x1) * m.scaleX, p.move.y = (r.pageY + m.scrollTop - m.y1) * m.scaleY) : (p.move.x = r.pageX - m.x1, p.move.y = r.pageY - m.y1))
            }
            if (!(c.fingers < c.minFingers)) {
                var f = [],
                    s = p = n = m = 0,
                    l = 0;
                for (q in g) r = g[q], r.up || (p += r.move.x, s += r.move.y, l++);
                p /= l;
                s /= l;
                for (q in g)
                    if (r = g[q], !r.up) {
                        l = r.start;
                        if (!l.distance) {
                            var t = l.x - p,
                                v = l.y - s;
                            l.distance = Math.sqrt(t * t + v * v);
                            l.angle = Math.atan2(t,
                                v) / a
                        }
                        var t = r.move.x - p,
                            v = r.move.y - s,
                            w = Math.sqrt(t * t + v * v),
                            m = m + w / l.distance,
                            t = Math.atan2(t, v) / a,
                            l = (l.angle - t + 360) % 360 - 180;
                        r.DEG2 = r.DEG1;
                        r.DEG1 = 0 < l ? l : -l;
                        "undefined" !== typeof r.DEG2 && (r.rotation = 0 < l ? r.rotation + (r.DEG1 - r.DEG2) : r.rotation - (r.DEG1 - r.DEG2), n += r.rotation);
                        f.push(r.move)
                    }
                e.touches = f;
                e.fingers = c.fingers;
                e.scale = m / c.fingers;
                e.rotation = n / c.fingers;
                e.state = "change";
                c.listener(d, e)
            }
        };
        c.onPointerUp = function(a) {
            var k = c.fingers;
            b.pointerEnd(a, e, c) && (Event.remove(c.doc, "mousemove", c.onPointerMove), Event.remove(c.doc,
                "mouseup", c.onPointerUp));
            k === c.minFingers && c.fingers < c.minFingers && (e.fingers = c.fingers, e.state = "end", c.listener(a, e))
        };
        var e = b.pointerSetup(c);
        Event.add(c.target, "mousedown", c.onPointerDown);
        return e
    };
    Event.Gesture = Event.Gesture || {};
    Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
    Event.Gesture._gestureHandlers.gesture = b.gesture;
    return b
}(Event.proxy);


"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    b.pointerdown = b.pointermove = b.pointerup = function(a) {
        if (!a.target.isPointerEmitter) {
            var c = !0;
            a.onPointerDown = function(b) {
                c = !1;
                e.gesture = "pointerdown";
                a.listener(b, e)
            };
            a.onPointerMove = function(b) {
                e.gesture = "pointermove";
                a.listener(b, e, c)
            };
            a.onPointerUp = function(b) {
                c = !0;
                e.gesture = "pointerup";
                a.listener(b, e, !0)
            };
            var e = b.pointerSetup(a);
            Event.add(a.target, "mousedown", a.onPointerDown);
            Event.add(a.target, "mousemove", a.onPointerMove);
            Event.add(a.doc, "mouseup", a.onPointerUp);
            a.target.isPointerEmitter = !0;
            return e
        }
    };
    Event.Gesture = Event.Gesture || {};
    Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
    Event.Gesture._gestureHandlers.pointerdown = b.pointerdown;
    Event.Gesture._gestureHandlers.pointermove = b.pointermove;
    Event.Gesture._gestureHandlers.pointerup = b.pointerup;
    return b
}(Event.proxy);


"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    b.shake = function(a) {
        var b = {
                gesture: "devicemotion",
                acceleration: {},
                accelerationIncludingGravity: {},
                target: a.target,
                listener: a.listener,
                remove: function() {
                    window.removeEventListener("devicemotion", m, !1)
                }
            },
            e = (new Date).getTime(),
            d = {
                x: 0,
                y: 0,
                z: 0
            },
            k = {
                x: {
                    count: 0,
                    value: 0
                },
                y: {
                    count: 0,
                    value: 0
                },
                z: {
                    count: 0,
                    value: 0
                }
            },
            m = function(g) {
                var f = g.accelerationIncludingGravity;
                d.x = 0.8 * d.x + (1 - 0.8) * f.x;
                d.y = 0.8 * d.y + (1 - 0.8) * f.y;
                d.z = 0.8 * d.z + (1 - 0.8) * f.z;
                b.accelerationIncludingGravity = d;
                b.acceleration.x =
                    f.x - d.x;
                b.acceleration.y = f.y - d.y;
                b.acceleration.z = f.z - d.z;
                if ("devicemotion" === a.gesture) a.listener(g, b);
                else
                    for (var f = (new Date).getTime(), l = 0; 3 > l; l++) {
                        var n = "xyz" [l],
                            m = b.acceleration[n],
                            n = k[n],
                            q = Math.abs(m);
                        !(1E3 > f - e) && 4 < q && (m = f * m / q, q = Math.abs(m + n.value), n.value && 200 > q ? (n.value = m, n.count++, 3 === n.count && (a.listener(g, b), e = f, n.value = 0, n.count = 0)) : (n.value = m, n.count = 1))
                    }
            };
        if (window.addEventListener) return window.addEventListener("devicemotion", m, !1), b
    };
    Event.Gesture = Event.Gesture || {};
    Event.Gesture._gestureHandlers =
        Event.Gesture._gestureHandlers || {};
    Event.Gesture._gestureHandlers.shake = b.shake;
    return b
}(Event.proxy);


"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    var a = Math.PI / 180;
    b.swipe = function(c) {
        c.snap = c.snap || 90;
        c.threshold = c.threshold || 1;
        c.onPointerDown = function(a) {
            b.pointerStart(a, e, c) && (Event.add(c.doc, "mousemove", c.onPointerMove).listener(a), Event.add(c.doc, "mouseup", c.onPointerUp))
        };
        c.onPointerMove = function(a) {
            a = a.changedTouches || b.getCoords(a);
            for (var e = a.length, m = 0; m < e; m++) {
                var g = a[m],
                    f = c.tracker[g.identifier || Infinity];
                f && (f.move.x = g.pageX, f.move.y = g.pageY, f.moveTime = (new Date).getTime())
            }
        };
        c.onPointerUp = function(d) {
            if (b.pointerEnd(d,
                    e, c)) {
                Event.remove(c.doc, "mousemove", c.onPointerMove);
                Event.remove(c.doc, "mouseup", c.onPointerUp);
                var k, m, g, f, l = {
                        x: 0,
                        y: 0
                    },
                    n = 0,
                    r = 0,
                    q = 0,
                    p;
                for (p in c.tracker) {
                    var s = c.tracker[p];
                    f = s.move.x - s.start.x;
                    var t = s.move.y - s.start.y,
                        n = n + s.move.x,
                        r = r + s.move.y;
                    l.x += s.start.x;
                    l.y += s.start.y;
                    q++;
                    m = Math.sqrt(f * f + t * t);
                    s = s.moveTime - s.startTime;
                    f = Math.atan2(f, t) / a + 180;
                    m = s ? m / s : 0;
                    if ("undefined" === typeof g) g = f, k = m;
                    else if (20 >= Math.abs(f - g)) g = (g + f) / 2, k = (k + m) / 2;
                    else return
                }
                k > c.threshold && (l.x /= q, l.y /= q, e.start = l, e.x = n / q,
                    e.y = r / q, e.angle = -(((g / c.snap + 0.5 >> 0) * c.snap || 360) - 360), e.velocity = k, e.fingers = c.gestureFingers, e.state = "swipe", c.listener(d, e))
            }
        };
        var e = b.pointerSetup(c);
        Event.add(c.target, "mousedown", c.onPointerDown);
        return e
    };
    Event.Gesture = Event.Gesture || {};
    Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
    Event.Gesture._gestureHandlers.swipe = b.swipe;
    return b
}(Event.proxy);


"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    b.tap = b.longpress = function(a) {
        a.delay = a.delay || 500;
        a.timeout = a.timeout || 250;
        var c, e;
        a.onPointerDown = function(k) {
            b.pointerStart(k, d, a) && (c = (new Date).getTime(), Event.add(a.doc, "mousemove", a.onPointerMove).listener(k), Event.add(a.doc, "mouseup", a.onPointerUp), "longpress" === a.gesture && (e = setTimeout(function() {
                if (!(k.cancelBubble && 1 < ++k.bubble)) {
                    var b = 0,
                        c;
                    for (c in a.tracker) {
                        if (!0 === a.tracker[c].end || a.cancel) return;
                        b++
                    }
                    d.state = "start";
                    d.fingers = b;
                    a.listener(k, d)
                }
            }, a.delay)))
        };
        a.onPointerMove = function(d) {
            var c = a.bbox;
            d = d.changedTouches || b.getCoords(d);
            for (var e = d.length, f = 0; f < e; f++) {
                var l = d[f],
                    n = a.tracker[l.identifier || Infinity];
                if (n) {
                    if ("relative" === a.position) var r = (l.pageX + c.scrollLeft - c.x1) * c.scaleX,
                        l = (l.pageY + c.scrollTop - c.y1) * c.scaleY;
                    else r = l.pageX - c.x1, l = l.pageY - c.y1;
                    if (!(0 < r && r < c.width && 0 < l && l < c.height && 25 >= Math.abs(r - n.start.x) && 25 >= Math.abs(l - n.start.y))) {
                        Event.remove(a.doc, "mousemove", a.onPointerMove);
                        a.cancel = !0;
                        break
                    }
                }
            }
        };
        a.onPointerUp = function(k) {
            b.pointerEnd(k,
                d, a) && (clearTimeout(e), Event.remove(a.doc, "mousemove", a.onPointerMove), Event.remove(a.doc, "mouseup", a.onPointerUp), k.cancelBubble && 1 < ++k.bubble || ("longpress" === a.gesture ? "start" === d.state && (d.state = "end", a.listener(k, d)) : a.cancel || (new Date).getTime() - c > a.timeout || (d.state = "tap", d.fingers = a.gestureFingers, a.listener(k, d))))
        };
        var d = b.pointerSetup(a);
        Event.add(a.target, "mousedown", a.onPointerDown);
        return d
    };
    Event.Gesture = Event.Gesture || {};
    Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
    Event.Gesture._gestureHandlers.tap = b.tap;
    Event.Gesture._gestureHandlers.longpress = b.longpress;
    return b
}(Event.proxy);


"undefined" === typeof Event && (Event = {});
"undefined" === typeof Event.proxy && (Event.proxy = {});
Event.proxy = function(b) {
    b.wheel = function(a) {
        var b, e = a.timeout || 150,
            d = 0,
            k = {
                gesture: "wheel",
                state: "start",
                wheelDelta: 0,
                target: a.target,
                listener: a.listener,
                remove: function() {
                    a.target[f](l, m, !1)
                }
            },
            m = function(f) {
                f = f || window.event;
                k.state = d++ ? "change" : "start";
                k.wheelDelta = f.detail ? -20 * f.detail : f.wheelDelta;
                a.listener(f, k);
                clearTimeout(b);
                b = setTimeout(function() {
                    d = 0;
                    k.state = "end";
                    k.wheelDelta = 0;
                    a.listener(f, k)
                }, e)
            },
            g = document.addEventListener ? "addEventListener" : "attachEvent",
            f = document.removeEventListener ?
            "removeEventListener" : "detachEvent",
            l = Event.supports("mousewheel") ? "mousewheel" : "DOMMouseScroll";
        a.target[g](l, m, !1);
        return k
    };
    Event.Gesture = Event.Gesture || {};
    Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
    Event.Gesture._gestureHandlers.wheel = b.wheel;
    return b
}(Event.proxy);

function Stream(b) {
    function a() {
        var a = b.charCodeAt(c);
        c += 1;
        return a
    }
    var c = 0;
    return {
        eof: function() {
            return c >= b.length
        },
        read: function(a) {
            var d = b.substr(c, a);
            c += a;
            return d
        },
        readInt32: function() {
            var a = (b.charCodeAt(c) << 24) + (b.charCodeAt(c + 1) << 16) + (b.charCodeAt(c + 2) << 8) + b.charCodeAt(c + 3);
            c += 4;
            return a
        },
        readInt16: function() {
            var a = (b.charCodeAt(c) << 8) + b.charCodeAt(c + 1);
            c += 2;
            return a
        },
        readInt8: a,
        readVarInt: function() {
            for (var b = 0;;) {
                var d = a();
                if (d & 128) b += d & 127, b <<= 7;
                else return b + d
            }
        }
    }
}

function MidiFile(b) {
    function a(a) {
        var b = a.read(4),
            d = a.readInt32();
        return {
            id: b,
            length: d,
            data: a.read(d)
        }
    }

    function c(a) {
        var b = {};
        b.deltaTime = a.readVarInt();
        var d = a.readInt8();
        if (240 == (d & 240))
            if (255 == d) {
                b.type = "meta";
                var d = a.readInt8(),
                    c = a.readVarInt();
                switch (d) {
                    case 0:
                        b.subtype = "sequenceNumber";
                        if (2 != c) throw "Expected length for sequenceNumber event is 2, got " + c;
                        b.number = a.readInt16();
                        return b;
                    case 1:
                        return b.subtype = "text", b.text = a.read(c), b;
                    case 2:
                        return b.subtype = "copyrightNotice", b.text = a.read(c),
                            b;
                    case 3:
                        return b.subtype = "trackName", b.text = a.read(c), b;
                    case 4:
                        return b.subtype = "instrumentName", b.text = a.read(c), b;
                    case 5:
                        return b.subtype = "lyrics", b.text = a.read(c), b;
                    case 6:
                        return b.subtype = "marker", b.text = a.read(c), b;
                    case 7:
                        return b.subtype = "cuePoint", b.text = a.read(c), b;
                    case 32:
                        b.subtype = "midiChannelPrefix";
                        if (1 != c) throw "Expected length for midiChannelPrefix event is 1, got " + c;
                        b.channel = a.readInt8();
                        return b;
                    case 47:
                        b.subtype = "endOfTrack";
                        if (0 != c) throw "Expected length for endOfTrack event is 0, got " +
                            c;
                        return b;
                    case 81:
                        b.subtype = "setTempo";
                        if (3 != c) throw "Expected length for setTempo event is 3, got " + c;
                        b.microsecondsPerBeat = (a.readInt8() << 16) + (a.readInt8() << 8) + a.readInt8();
                        return b;
                    case 84:
                        b.subtype = "smpteOffset";
                        if (5 != c) throw "Expected length for smpteOffset event is 5, got " + c;
                        d = a.readInt8();
                        b.frameRate = {
                            0: 24,
                            32: 25,
                            64: 29,
                            96: 30
                        }[d & 96];
                        b.hour = d & 31;
                        b.min = a.readInt8();
                        b.sec = a.readInt8();
                        b.frame = a.readInt8();
                        b.subframe = a.readInt8();
                        return b;
                    case 88:
                        b.subtype = "timeSignature";
                        if (4 != c) throw "Expected length for timeSignature event is 4, got " +
                            c;
                        b.numerator = a.readInt8();
                        b.denominator = Math.pow(2, a.readInt8());
                        b.metronome = a.readInt8();
                        b.thirtyseconds = a.readInt8();
                        return b;
                    case 89:
                        b.subtype = "keySignature";
                        if (2 != c) throw "Expected length for keySignature event is 2, got " + c;
                        b.key = a.readInt8();
                        b.scale = a.readInt8();
                        return b;
                    case 127:
                        return b.subtype = "sequencerSpecific", b.data = a.read(c), b;
                    default:
                        return b.subtype = "unknown", b.data = a.read(c), b
                }
            } else {
                if (240 == d) return b.type = "sysEx", c = a.readVarInt(), b.data = a.read(c), b;
                if (247 == d) return b.type = "dividedSysEx",
                    c = a.readVarInt(), b.data = a.read(c), b;
                throw "Unrecognised MIDI event type byte: " + d;
            } else {
            0 == (d & 128) ? (c = d, d = e) : (c = a.readInt8(), e = d);
            var g = d >> 4;
            b.channel = d & 15;
            b.type = "channel";
            switch (g) {
                case 8:
                    return b.subtype = "noteOff", b.noteNumber = c, b.velocity = a.readInt8(), b;
                case 9:
                    return b.noteNumber = c, b.velocity = a.readInt8(), b.subtype = 0 == b.velocity ? "noteOff" : "noteOn", b;
                case 10:
                    return b.subtype = "noteAftertouch", b.noteNumber = c, b.amount = a.readInt8(), b;
                case 11:
                    return b.subtype = "controller", b.controllerType = c, b.value =
                        a.readInt8(), b;
                case 12:
                    return b.subtype = "programChange", b.programNumber = c, b;
                case 13:
                    return b.subtype = "channelAftertouch", b.amount = c, b;
                case 14:
                    return b.subtype = "pitchBend", b.value = c + (a.readInt8() << 7), b;
                default:
                    throw "Unrecognised MIDI event type: " + g;
            }
        }
    }
    var e;
    stream = Stream(b);
    b = a(stream);
    if ("MThd" != b.id || 6 != b.length) throw "Bad .mid file - header not found";
    var d = Stream(b.data);
    b = d.readInt16();
    var k = d.readInt16(),
        d = d.readInt16();
    if (d & 32768) throw "Expressing time division in SMTPE frames is not supported yet";
    ticksPerBeat = d;
    b = {
        formatType: b,
        trackCount: k,
        ticksPerBeat: ticksPerBeat
    };
    k = [];
    for (d = 0; d < b.trackCount; d++) {
        k[d] = [];
        var m = a(stream);
        if ("MTrk" != m.id) throw "Unexpected chunk - expected MTrk, got " + m.id;
        for (m = Stream(m.data); !m.eof();) {
            var g = c(m);
            k[d].push(g)
        }
    }
    return {
        header: b,
        tracks: k
    }
}

var clone = function (obj) {
    if (!obj || typeof (obj) !== 'object') return obj;
    var temp = new obj.constructor();
    for (var key in obj) {
        if (!obj[key] || typeof (obj[key]) !== 'object') {
            temp[key] = obj[key];
        } else { // clone sub-object
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
};

function Replayer(b, a, c, e) {
        function d() {
            for (var a = null, d = null, c = null, e = 0; e < k.length; e++) null != k[e].ticksToNextEvent && (null == a || k[e].ticksToNextEvent < a) && (a = k[e].ticksToNextEvent, d = e, c = k[e].nextEventIndex);
            if (null != d) {
                var f = b.tracks[d][c];
                k[d].ticksToNextEvent = b.tracks[d][c + 1] ? k[d].ticksToNextEvent + b.tracks[d][c + 1].deltaTime : null;
                k[d].nextEventIndex += 1;
                for (e = 0; e < k.length; e++) null != k[e].ticksToNextEvent && (k[e].ticksToNextEvent -= a);
                return {
                    ticksToEvent: a,
                    event: f,
                    track: d
                }
            }
            return null
        }
        var k = [],
            m = e ? e : 120,
            g = e ? !0 : !1,
            f = b.header.ticksPerBeat;
        for (c = 0; c < b.tracks.length; c++) k[c] = {
            nextEventIndex: 0,
            ticksToNextEvent: b.tracks[c].length ? b.tracks[c][0].deltaTime : null
        };
        var l, n = [];
        (function() {
            if (l = d())
                for (; l;) {
                    g || ("meta" != l.event.type || "setTempo" != l.event.subtype) || (m = 6E7 / l.event.microsecondsPerBeat);
                    var b = 0,
                        b = 0;
                    0 < l.ticksToEvent && (b = l.ticksToEvent / f, b /= m / 60);
                    n.push([l, 1E3 * b * a || 0]);
                    l = d()
                }
        })();
        return {
            getData: function() {
                return clone(n)
            }
        }
    }
    (function(b) {
        function a(a) {
            return String.fromCharCode.apply(null, a)
        }

        function c(a, b) {
            if (b)
                for (; a.length / 2 < b;) a = "0" + a;
            for (var d = [], c = a.length - 1; 0 <= c; c -= 2) d.unshift(parseInt(0 === c ? a[c] : a[c - 1] + a[c], 16));
            return d
        }
        var e = Array.prototype;
        if (!b.console || !console.firebug) {
            var d = ["log", "debug", "info", "warn", "error"];
            b.console = {};
            for (var k = 0; k < d.length; ++k) b.console[d[k]] = function() {}
        }
        var m = {
                G9: 127,
                Gb9: 126,
                F9: 125,
                E9: 124,
                Eb9: 123,
                D9: 122,
                Db9: 121,
                C9: 120,
                B8: 119,
                Bb8: 118,
                A8: 117,
                Ab8: 116,
                G8: 115,
                Gb8: 114,
                F8: 113,
                E8: 112,
                Eb8: 111,
                D8: 110,
                Db8: 109,
                C8: 108,
                B7: 107,
                Bb7: 106,
                A7: 105,
                Ab7: 104,
                G7: 103,
                Gb7: 102,
                F7: 101,
                E7: 100,
                Eb7: 99,
                D7: 98,
                Db7: 97,
                C7: 96,
                B6: 95,
                Bb6: 94,
                A6: 93,
                Ab6: 92,
                G6: 91,
                Gb6: 90,
                F6: 89,
                E6: 88,
                Eb6: 87,
                D6: 86,
                Db6: 85,
                C6: 84,
                B5: 83,
                Bb5: 82,
                A5: 81,
                Ab5: 80,
                G5: 79,
                Gb5: 78,
                F5: 77,
                E5: 76,
                Eb5: 75,
                D5: 74,
                Db5: 73,
                C5: 72,
                B4: 71,
                Bb4: 70,
                A4: 69,
                Ab4: 68,
                G4: 67,
                Gb4: 66,
                F4: 65,
                E4: 64,
                Eb4: 63,
                D4: 62,
                Db4: 61,
                C4: 60,
                B3: 59,
                Bb3: 58,
                A3: 57,
                Ab3: 56,
                G3: 55,
                Gb3: 54,
                F3: 53,
                E3: 52,
                Eb3: 51,
                D3: 50,
                Db3: 49,
                C3: 48,
                B2: 47,
                Bb2: 46,
                A2: 45,
                Ab2: 44,
                G2: 43,
                Gb2: 42,
                F2: 41,
                E2: 40,
                Eb2: 39,
                D2: 38,
                Db2: 37,
                C2: 36,
                B1: 35,
                Bb1: 34,
                A1: 33,
                Ab1: 32,
                G1: 31,
                Gb1: 30,
                F1: 29,
                E1: 28,
                Eb1: 27,
                D1: 26,
                Db1: 25,
                C1: 24,
                B0: 23,
                Bb0: 22,
                A0: 21,
                Ab0: 20,
                G0: 19,
                Gb0: 18,
                F0: 17,
                E0: 16,
                Eb0: 15,
                D0: 14,
                Db0: 13,
                C0: 12
            },
            g = function(a) {
                if (!a || null === a.type && void 0 === a.type || null === a.channel && void 0 === a.channel || null === a.param1 && void 0 === a.param1) throw Error("Not enough parameters to create an event.");
                this.setTime(a.time);
                this.setType(a.type);
                this.setChannel(a.channel);
                this.setParam1(a.param1);
                this.setParam2(a.param2)
            };
        g.createNote = function(a, b) {
            if (!a) throw Error("Note not specified");
            if ("string" === typeof a) a = m[a];
            else if (!a.pitch) throw Error("The pitch is required in order to create a note.");
            var d = [];
            d.push(g.noteOn(a));
            b || d.push(g.noteOff(a, a.duration || 128));
            return d
        };
        g.noteOn = function(a, b) {
            return new g({
                time: a.duration || b || 0,
                type: 9,
                channel: a.channel || 0,
                param1: a.pitch || a,
                param2: a.volume || 90
            })
        };
        g.noteOff = function(a, b) {
            return new g({
                time: a.duration || b || 0,
                type: 8,
                channel: a.channel || 0,
                param1: a.pitch || a,
                param2: a.volume || 90
            })
        };
        g.prototype = {
            type: 0,
            channel: 0,
            time: 0,
            setTime: function(a) {
                var b =
                    a || 0;
                for (a = b & 127; b >>= 7;) a <<= 8, a |= b & 127 | 128;
                for (b = [];;)
                    if (b.push(a & 255), a & 128) a >>= 8;
                    else break;
                this.time = b
            },
            setType: function(a) {
                if (8 > a || 14 < a) throw Error("Trying to set an unknown event: " + a);
                this.type = a
            },
            setChannel: function(a) {
                if (0 > a || 15 < a) throw Error("Channel is out of bounds.");
                this.channel = a
            },
            setParam1: function(a) {
                this.param1 = a
            },
            setParam2: function(a) {
                this.param2 = a
            },
            toBytes: function() {
                var a = [],
                    b = parseInt(this.type.toString(16) + this.channel.toString(16), 16);
                a.push.apply(a, this.time);
                a.push(b);
                a.push(this.param1);
                void 0 !== this.param2 && null !== this.param2 && a.push(this.param2);
                return a
            }
        };
        var f = function(a) {
            a && (this.setType(a.type), this.setData(a.data))
        };
        f.prototype = {
            setType: function(a) {
                this.type = a
            },
            setData: function(a) {
                this.data = a
            },
            toBytes: function() {
                if (!this.type || !this.data) throw Error("Type or data for meta-event not specified.");
                var a = [255, this.type];
                this.data && (this.data.concat && this.data.unshift && !this.data.callee) && e.push.apply(a, this.data);
                return a
            }
        };
        var l = function(a) {
            this.events = [];
            for (var b in a)
                if (a.hasOwnProperty(b)) this["set" +
                    b.charAt(0).toUpperCase() + b.substring(1)](a[b])
        };
        l.TRACK_START = [77, 84, 114, 107];
        l.TRACK_END = [0, 255, 47, 0];
        l.prototype = {
            addEvent: function(a) {
                this.events.push(a);
                return this
            },
            setEvents: function(a) {
                e.push.apply(this.events, a);
                return this
            },
            setText: function(a, b) {
                b || (b = a = 1);
                return this.addEvent(new f({
                    type: a,
                    data: b
                }))
            },
            setCopyright: function(a) {
                return this.setText(2, a)
            },
            setTrackName: function(a) {
                return this.setText(3, a)
            },
            setInstrument: function(a) {
                return this.setText(4, a)
            },
            setLyric: function(a) {
                return this.setText(5,
                    a)
            },
            setMarker: function(a) {
                return this.setText(6, a)
            },
            setCuePoint: function(a) {
                return this.setText(7, a)
            },
            setTempo: function(a) {
                this.addEvent(new f({
                    type: 81,
                    data: a
                }))
            },
            setTimeSig: function() {},
            setKeySig: function() {},
            toBytes: function() {
                var a = 0,
                    b = [],
                    d = l.TRACK_START,
                    f = l.TRACK_END;
                this.events.forEach(function(d) {
                    d = d.toBytes();
                    a += d.length;
                    e.push.apply(b, d)
                });
                var a = a + f.length,
                    g = c(a.toString(16), 4);
                return d.concat(g, b, f)
            }
        };
        b.MidiWriter = function(d) {
            if (d) {
                d = d.tracks || [];
                var e = d.length.toString(16),
                    f = "MThd\x00\x00\x00\u0006\x00\x00",
                    f = f + a(c(e, 2)),
                    f = f + "\u0001\u0090";
                d.forEach(function(b) {
                    f += a(b.toBytes())
                });
                return {
                    b64: btoa(f),
                    play: function() {
                        if (document) {
                            var a = document.createElement("embed");
                            a.setAttribute("src", "data:audio/midi;base64," + this.b64);
                            a.setAttribute("type", "audio/midi");
                            document.body.appendChild(a)
                        }
                    },
                    save: function() {
                        b.open("data:audio/midi;base64," + this.b64, "JSMidi generated output", "resizable=yes,scrollbars=no,status=no")
                    }
                }
            }
            throw Error("No parameters have been passed to MidiWriter.");
        };
        b.MidiEvent = g;
        b.MetaEvent =
            f;
        b.MidiTrack = l;
        b.noteTable = m
    })(jsmidi = {});

(function(b) {
    b.btoa || (b.btoa = function(a) {
        a = escape(a);
        var b = "",
            e, d, k = "",
            m, g, f = "",
            l = 0;
        do e = a.charCodeAt(l++), d = a.charCodeAt(l++), k = a.charCodeAt(l++), m = e >> 2, e = (e & 3) << 4 | d >> 4, g = (d & 15) << 2 | k >> 6, f = k & 63, isNaN(d) ? g = f = 64 : isNaN(k) && (f = 64), b = b + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(m) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(e) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(g) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(f);
        while (l < a.length);
        return b
    });
    b.atob || (b.atob = function(a) {
        var b = "",
            e, d, k = "",
            m, g = "",
            f = 0;
        /[^A-Za-z0-9\+\/\=]/g.exec(a) && alert("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding.");
        a = a.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(f++)), d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(f++)), m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(f++)),
            g = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(f++)), e = e << 2 | d >> 4, d = (d & 15) << 4 | m >> 2, k = (m & 3) << 6 | g, b += String.fromCharCode(e), 64 != m && (b += String.fromCharCode(d)), 64 != g && (b += String.fromCharCode(k)); while (f < a.length);
        return unescape(b)
    })
})(this);

String.prototype.replaceAll = function(b, a) {
    if ("object" === typeof b) {
        for (var c = this, e = 0; e < b.length; e++) c = c.split(b[e]).join(a[e]);
        return c
    }
    return this.split(b).join(a)
};

String.prototype.trim = function(b) {
    return this.replace(/^\s+|\s+$/g, "")
};

String.prototype.ucfirst = function(b) {
    return this[0].toUpperCase() + this.substr(1)
};

String.prototype.ucwords = function(b) {
    return this.replace(/^(.)|\s(.)/g, function(a) {
        return a.toUpperCase()
    })
};

String.prototype.addslashes = function() {
    return this.replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0")
};

String.prototype.stripslashes = function() {
    return this.replace(/\0/g, "0").replace(/\\([\\'"])/g, "$1")
};

String.prototype.basename = function() {
    return this.replace(/\\/g, "/").replace(/.*\//, "")
};

String.prototype.lpad = function(b, a) {
    for (var c = this; c.length < a;) c = b + c;
    return c
};

String.prototype.rpad = function(b, a) {
    for (var c = this; c.length < a;) c += b;
    return c
};

window.STRING = String;
STRING.prototype.replaceAll = STRING.prototype.replaceAll;
STRING.prototype.trim = STRING.prototype.trim;
STRING.prototype.ucfirst = STRING.prototype.ucfirst;
STRING.prototype.ucwords = STRING.prototype.ucwords;
STRING.prototype.addslashes = STRING.prototype.addslashes;
STRING.prototype.stripslashes = STRING.prototype.stripslashes;
STRING.prototype.basename = STRING.prototype.basename;
STRING.prototype.lpad = STRING.prototype.lpad;
STRING.prototype.rpad = STRING.prototype.rpad;
window.localStorage || (window.localStorage = {
    getItem: function(b) {
        return b && this.hasOwnProperty(b) ? unescape(document.cookie.replace(RegExp("(?:^|.*;\\s*)" + escape(b).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1")) : null
    },
    key: function(b) {
        return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[b])
    },
    setItem: function(b, a) {
        b && (document.cookie = escape(b) + "=" + escape(a) + "; path=/", this.length = document.cookie.match(/\=/g).length)
    },
    length: document.cookie.match(/\=/g).length,
    removeItem: function(b) {
        if (b && this.hasOwnProperty(b)) {
            var a = new Date;
            a.setDate(a.getDate() - 1);
            document.cookie = escape(b) + "=; expires=" + a.toGMTString() + "; path=/";
            this.length--
        }
    },
    hasOwnProperty: function(b) {
        return RegExp("(?:^|;\\s*)" + escape(b).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie)
    }
});


var Base64Binary = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    decodeArrayBuffer: function(b) {
        var a = Math.ceil(3 * b.length / 4),
            a = new ArrayBuffer(a);
        this.decode(b, a);
        return a
    },
    decode: function(b, a) {
        var c = this._keyStr.indexOf(b.charAt(b.length - 1)),
            e = this._keyStr.indexOf(b.charAt(b.length - 1)),
            d = Math.ceil(3 * b.length / 4);
        64 == c && d--;
        64 == e && d--;
        var k, m, g, f, l = 0,
            n = 0,
            c = a ? new Uint8Array(a) : new Uint8Array(d);
        b = b.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        for (l = 0; l < d; l += 3) k = this._keyStr.indexOf(b.charAt(n++)),
            m = this._keyStr.indexOf(b.charAt(n++)), e = this._keyStr.indexOf(b.charAt(n++)), f = this._keyStr.indexOf(b.charAt(n++)), k = k << 2 | m >> 4, m = (m & 15) << 4 | e >> 2, g = (e & 3) << 6 | f, c[l] = k, 64 != e && (c[l + 1] = m), 64 != f && (c[l + 2] = g);
        return c
    }
};


var Util = {
        toArray: function(b) {
            return Array.prototype.slice.call(b || [], 0)
        },
        strToDataURL: function(b, a, c) {
            return (void 0 != c ? c : 1) ? "data:" + a + ";base64," + self.btoa(b) : "data:" + a + "," + b
        },
        strToObjectURL: function(b, a) {
            for (var c = new Uint8Array(b.length), e = 0; e < c.length; ++e) c[e] = b.charCodeAt(e);
            c = new Blob([c], a ? {
                type: a
            } : {});
            return self.URL.createObjectURL(c)
        },
        fileToObjectURL: function(b) {
            return self.URL.createObjectURL(b)
        },
        fileToArrayBuffer: function(b, a, c) {
            var e = new FileReader;
            e.onload = function(b) {
                a(b.target.result)
            };
            e.onerror = function(a) {
                c && c(a)
            };
            e.readAsArrayBuffer(b)
        },
        dataURLToBlob: function(b) {
            if (-1 == b.indexOf(";base64,")) {
                var a = b.split(",");
                b = a[0].split(":")[1];
                a = decodeURIComponent(a[1]);
                return new Blob([a], {
                    type: b
                })
            }
            a = b.split(";base64,");
            b = a[0].split(":")[1];
            for (var a = window.atob(a[1]), c = a.length, e = new Uint8Array(c), d = 0; d < c; ++d) e[d] = a.charCodeAt(d);
            return new Blob([e], {
                type: b
            })
        },
        arrayBufferToBlob: function(b, a) {
            var c = new Uint8Array(b);
            return new Blob([c], a ? {
                type: a
            } : {})
        },
        arrayBufferToBinaryString: function(b,
            a, c) {
            var e = new FileReader;
            e.onload = function(b) {
                a(b.target.result)
            };
            e.onerror = function(a) {
                c && c(a)
            };
            b = new Uint8Array(b);
            e.readAsBinaryString(new Blob([b]))
        },
        arrayToBinaryString: function(b) {
            if ("object" != typeof b) return null;
            for (var a = b.length, c = Array(a); a--;) c[a] = String.fromCharCode(b[a]);
            return c.join("")
        },
        getFileExtension: function(b) {
            var a = b.lastIndexOf(".");
            return -1 != a ? b.substring(a) : ""
        }
    },
    MyFileError = function(b) {
        this.prototype = FileError.prototype;
        this.code = b.code;
        this.name = b.name
    };
FileError.BROWSER_NOT_SUPPORTED = 1E3;
FileError.prototype.__defineGetter__("name", function() {
    for (var b = Object.keys(FileError), a = 0, c; c = b[a]; ++a)
        if (FileError[c] == this.code) return c;
    return "Unknown Error"
});
var Filer = new function() {
    function b(b) {
        if (a = b || null) c = a.root, e = !0
    }
    var a = null,
        c = null,
        e = !1,
        d = function(b) {
            0 != b.indexOf("filesystem:") && (b = "/" == b[0] ? a.root.toURL() + b.substring(1) : 0 == b.indexOf("./") || 0 == b.indexOf("../") ? "../" == b && c != a.root ? c.toURL() + "/" + b : c.toURL() + b : c.toURL() + "/" + b);
            return b
        },
        k = function(a, b) {
            var c = arguments[1],
                e = arguments[2],
                k = function(a) {
                    if (a.code == FileError.NOT_FOUND_ERR) {
                        if (e) throw Error('"' + c + '" or "' + e + '" does not exist.');
                        throw Error('"' + c + '" does not exist.');
                    }
                    throw Error("Problem getting Entry for one or more paths.");
                },
                m = d(c);
            if (3 == arguments.length) {
                var p = d(e);
                self.resolveLocalFileSystemURL(m, function(b) {
                    self.resolveLocalFileSystemURL(p, function(d) {
                        a(b, d)
                    }, k)
                }, k)
            } else self.resolveLocalFileSystemURL(m, a, k)
        },
        m = function(b, d, c, e, m, q) {
            if (!a) throw Error("Filesystem has not been initialized.");
            if (typeof b != typeof d) throw Error("These method arguments are not supported.");
            var p = c || null,
                s = void 0 != q ? q : !1;
            (b.isFile || d.isDirectory) && d.isDirectory ? s ? b.moveTo(d, p, e, m) : b.copyTo(d, p, e, m) : k(function(a, b) {
                if (b.isDirectory) s ? a.moveTo(b,
                    p, e, m) : a.copyTo(b, p, e, m);
                else {
                    var d = Error('Oops! "' + b.name + " is not a directory!");
                    if (m) m(d);
                    else throw d;
                }
            }, b, d)
        };
    b.DEFAULT_FS_SIZE = 1048576;
    b.version = "0.4.3";
    b.prototype = {get fs() {
            return a
        },
        get isOpen() {
            return e
        },
        get cwd() {
            return c
        }
    };
    b.prototype.pathToFilesystemURL = function(a) {
        return d(a)
    };
    b.prototype.init = function(b, d, k) {
        if (!self.requestFileSystem) throw new MyFileError({
            code: FileError.BROWSER_NOT_SUPPORTED,
            name: "BROWSER_NOT_SUPPORTED"
        });
        b = b ? b : {};
        var m = b.size || 1048576;
        this.type = self.TEMPORARY;
        "persistent" in
        b && b.persistent && (this.type = self.PERSISTENT);
        var r = function(b) {
            this.size = m;
            a = b;
            c = a.root;
            e = !0;
            d && d(b)
        };
        this.type == self.PERSISTENT && navigator.persistentStorage ? navigator.persistentStorage.requestQuota(m, function(a) {
            self.requestFileSystem(this.type, a, r.bind(this), k)
        }.bind(this), k) : self.requestFileSystem(this.type, m, r.bind(this), k)
    };
    b.prototype.ls = function(b, d, e) {
        if (!a) throw Error("Filesystem has not been initialized.");
        var m = function(a) {
            c = a;
            var b = [],
                g = c.createReader(),
                k = function() {
                    g.readEntries(function(a) {
                        a.length ?
                            (b = b.concat(Util.toArray(a)), k()) : (b.sort(function(a, b) {
                                return a.name < b.name ? -1 : b.name < a.name ? 1 : 0
                            }), d(b))
                    }, e)
                };
            k()
        };
        b.isDirectory ? m(b) : 0 == b.indexOf("filesystem:") ? k(m, b) : c.getDirectory(b, {}, m, e)
    };
    b.prototype.mkdir = function(b, d, e, k) {
        if (!a) throw Error("Filesystem has not been initialized.");
        var m = null != d ? d : !1,
            q = b.split("/"),
            p = function(a, d) {
                if ("." == d[0] || "" == d[0]) d = d.slice(1);
                a.getDirectory(d[0], {
                    create: !0,
                    exclusive: m
                }, function(a) {
                    if (a.isDirectory) d.length && 1 != q.length ? p(a, d.slice(1)) : e && e(a);
                    else if (a =
                        Error(b + " is not a directory"), k) k(a);
                    else throw a;
                }, function(a) {
                    if (a.code == FileError.INVALID_MODIFICATION_ERR)
                        if (a.message = "'" + b + "' already exists", k) k(a);
                        else throw a;
                })
            };
        p(c, q)
    };
    b.prototype.open = function(b, c, e) {
        if (!a) throw Error("Filesystem has not been initialized.");
        b.isFile ? b.file(c, e) : k(function(a) {
            a.file(c, e)
        }, d(b))
    };
    b.prototype.create = function(b, d, e, k) {
        if (!a) throw Error("Filesystem has not been initialized.");
        c.getFile(b, {
            create: !0,
            exclusive: null != d ? d : !0
        }, e, function(a) {
            a.code == FileError.INVALID_MODIFICATION_ERR &&
                (a.message = "'" + b + "' already exists");
            if (k) k(a);
            else throw a;
        })
    };
    b.prototype.mv = function(a, b, d, c, e) {
        m.bind(this, a, b, d, c, e, !0)()
    };
    b.prototype.rm = function(b, d, c) {
        if (!a) throw Error("Filesystem has not been initialized.");
        var e = function(a) {
            a.isFile ? a.remove(d, c) : a.isDirectory && a.removeRecursively(d, c)
        };
        b.isFile || b.isDirectory ? e(b) : k(e, b)
    };
    b.prototype.cd = function(b, e, l) {
        if (!a) throw Error("Filesystem has not been initialized.");
        b.isDirectory ? (c = b, e && e(c)) : (b = d(b), k(function(a) {
            if (a.isDirectory) c = a, e && e(c);
            else if (a = Error("Path was not a directory."), l) l(a);
            else throw a;
        }, b))
    };
    b.prototype.cp = function(a, b, d, c, e) {
        m.bind(this, a, b, d, c, e)()
    };
    b.prototype.write = function(b, d, e, m) {
        if (!a) throw Error("Filesystem has not been initialized.");
        var r = function(a) {
            a.createWriter(function(b) {
                b.onerror = m;
                if (d.append) b.onwriteend = function(b) {
                    e && e(a, this)
                }, b.seek(b.length);
                else {
                    var c = !1;
                    b.onwriteend = function(b) {
                        c ? e && e(a, this) : (c = !0, this.truncate(this.position))
                    }
                }
                d.data.__proto__ == ArrayBuffer.prototype && (d.data = new Uint8Array(d.data));
                var k = new Blob([d.data], d.type ? {
                    type: d.type
                } : {});
                b.write(k)
            }, m)
        };
        b.isFile ? r(b) : 0 == b.indexOf("filesystem:") ? k(r, b) : c.getFile(b, {
            create: !0,
            exclusive: !1
        }, r, m)
    };
    b.prototype.df = function(a, b) {
        var d = function(b, d) {
            a(b, d - b, d)
        };
        if (!navigator.temporaryStorage.queryUsageAndQuota || !navigator.persistentStorage.queryUsageAndQuota) throw Error("Not implemented.");
        self.TEMPORARY == this.type ? navigator.temporaryStorage.queryUsageAndQuota(d, b) : self.PERSISTENT == this.type && navigator.persistentStorage.queryUsageAndQuota(d,
            b)
    };
    return b
};