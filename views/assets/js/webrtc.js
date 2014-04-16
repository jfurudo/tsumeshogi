var createRTCPeer = function(socket, signalingPath) {
    function iceCandidateCallback(event) {
        if (event.candidate) {
            console.log("Found candidate. Send it to peer.");
            sendDescription({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log("End of candidate");
        }
    }
    function onReceiveOffer(desc) {
        console.log(desc);
        pc.setRemoteDescription(new RTCSessionDescription(desc), function() {
            console.log("Receive Offer from peer.");
            pc.createAnswer(function(description) {
                console.log("Create Answer succeeded. Send it to peer.");
                pc.setLocalDescription(description);
                sendDescription(description);
            });
        }, function() {console.log("error");});
    }

    function onReceiveAnswer(desc){
        console.log("Receive Answer from peer.");
        pc.setRemoteDescription(new RTCSessionDescription(desc));
    }

    function onReceiveCandidate(desc){
        console.log("Receive Candidate from peer.");
        var candidate = new RTCIceCandidate({sdpMLineIndex:desc.label, candidate:desc.candidate});
        pc.addIceCandidate(candidate);
    }

    function onReceiveHangup(desc){
        console.log("Receive Hangup from peer.");
        pc.close();
        pc = null;
    }

    var signalling = {
        'offer': onReceiveOffer,
        'answer': onReceiveAnswer,
        'candidate': onReceiveCandidate,
        'bye': onReceiveHangup
    };
    var sendDescription = function(desc) {
        console.log(JSON.stringify(desc));
        socket.request(signalingPath, {data: JSON.stringify(desc)}, function() {console.log("Sending sdp...");});
    };
    // event for server to client when fired sdp message got by ohter client.

    var servers = {
        iceServers: [
            { url: "stun:stun.l.google.com:19302"}
        ]
    };
    var options = {
        optional: [
            { RtpDataChannels: true } // use data channel
        ]
    };
    // If you use STUN, indicate stun url except for null
    var dc;
    var pc = new webkitRTCPeerConnection(servers, options);
    pc.onicecandidate = iceCandidateCallback;
    var sendOffer = function() {
        pc.createOffer(function(description){
            pc.setLocalDescription(description);
            sendDescription(description);
        });
    };
    try {
    // Reliable Data Channels not yet supported in Chrome
    // Data Channel api supported from Chrome M25.
    // You need to start chrome with  --enable-data-channels flag.
        dc = pc.createDataChannel("DataChannel",{reliable: false});
        //     {reliable: true});
        console.log('Created send data channel');
    } catch (e) {
        alert('Failed to create data channel. ' +
              'You need Chrome M25 or later with --enable-data-channels flag');
        console.log('Create Data channel failed with exception: ' + e.message);
    }
 
    function onDataChannelStateChange() {
        var readyState = dc.readyState;
        console.log('Send channel state is: ' + readyState);
    }

    var recvBuff = [];
    function onDataChannelReceiveMessage(ev){
        var data = ev.data;
        console.log(data);
    }

    dc.onopen = onDataChannelStateChange;
//     dc.onmessage = onDataChannelReceiveMessage;
    dc.onclose = onDataChannelStateChange;

    var ret = {pc: pc, dc: dc};
    ret.sendOffer = sendOffer;
    ret.gotMessage = function(e) {
        console.log(e);
        var msg = JSON.parse(e);

        if(!!msg.type && typeof(signalling[msg.type]) === "function") {
            console.log(msg.type);
            signalling[msg.type](msg);
        } else {
        }
    };

    return ret;
};
