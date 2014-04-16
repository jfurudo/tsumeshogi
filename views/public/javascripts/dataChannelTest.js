var socket = io.connect("http://localhost:1337");
var pci = createRTCPeer(socket);

// pci.dc.onopen = function() {
//     console.log("data channel opened");
// };

/* pci.dc.onmessage = function(data) {
 console.log(data);
 }; */

socket.on("connect", function() {
    console.log("connected");
    socket.on("push_sdp", pci.gotMessage);
});

var chunks = [],
    MAX = 0;

var ms = new WebKitMediaSource();
var sourceBuffer;

ms.addEventListener("webkitsourceopen", function() {
    sourceBuffer = ms.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
});
var getMediaSource = function() {
    if (ms.readyState !== "open") {
        alert("Media source is not opened.");
        return;
    }
//     var sourceBuffer = ms.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
    console.log("media source");
    GET("/videos/sample1.webm", function(uInt8Array) {
        var chunkSize = 256; // Math.ceil(file.size / NUM_CHUNKS);
        var max = Math.ceil(uInt8Array.length / chunkSize);
        MAX = max;

        for (var i = 0; i < max; i++) {
            console.log(i);
            chunks[i] = uInt8Array.subarray(chunkSize * i, chunkSize * (i+1));
            sourceBuffer.append(chunks[i]);
        }
    });
};

var recvBuff = [];
var chunkIndex = 0;
pci.dc.onmessage = function(e) {
    var data = JSON.parse(e.data);
    if (data.seq === 0) {
        MAX = data.max;
    }
    console.log(data);

    var chunk = new Uint8Array(data.message);
    console.log(chunk);
    sourceBuffer.append(chunk);
    chunks[chunkIndex++] = chunk;
    // console.log(chunks[data.seq]);
};

var playVideo = function() {
    for (var i = 0; i < chunks.length; i++) {
        console.log(chunks[i]);
        sourceBuffer.append(chunks[i]);
    }
};

$(function() {
    $("#video").attr("src", URL.createObjectURL(ms));
    $("#sendOffer").click(pci.sendOffer);
    $("#getMediaSource").click(getMediaSource);
    $("#playVideo").click(playVideo);
    $("#sendVideo").click(function() {
        if (pci.dc.readyState === "open") {
            var i = 0;
            var timer = setInterval(function() {
                if (i === MAX) {
                    clearInterval(timer);
                    return;
                } else {
                    var data = {seq: i, max: MAX, message: chunks[i]};
                    console.log(data);
                    pci.dc.send(JSON.stringify(data));
                    i++;
                }
            }, 100);
        }
    });
    $("#file").change(function(e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.onload  = function(e){
            console.log(e.target);

            var data = e.target.result;
            var len = data.length;
            var plen = 300;
            var buff = [];

            for( var i = 0, l = Math.ceil(len / plen); i < l; i += 1) {
                var data_ = data.slice(plen * i, plen * (i + 1));
                var obj = {"seq": i, "max": l - 1, "message": data_};
                buff.push(obj);
            }

            var i = 0, l = Math.ceil(len / plen);
            if (pci.dc.readyState === "open") {
                var timer = setInterval(function(e) {
                    console.log(JSON.stringify(buff[i]));
                    if(i === l) {
                        clearInterval(timer);
                        return;
                    } else {
                        pci.dc.send(JSON.stringify(buff[i]));
                        i += 1;
                    }
                }, 1);
            } else {
                console.log("DataChannel is not opened.");
            }
        }
        
        reader.onloadstart = function(e) {
            console.log(e);
        };
        reader.onprogress = function(e) {
            console.log(e);
        };
        reader.onabort = function(e) {
            console.log(e);
        };
        reader.onerror = function(e) {
            console.log(e);
        };
        reader.onloadend = function(e) {
            console.log(e);
        };
        reader.readAsArrayBuffer(file);
    });
});

function GET(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();

    xhr.onload = function(e) {
        if (xhr.status != 200) {
            alert("Unexpected status code " + xhr.status + " for " + url);
            return false;
        }
        callback(new Uint8Array(xhr.response));
    };
}
