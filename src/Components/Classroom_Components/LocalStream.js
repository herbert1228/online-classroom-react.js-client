import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import {Button} from '@material-ui/core'
import {SignalingChannel as channel, connection as conn, checkTURNServer} from '../../interface/connection'
import poster from '../../css/ask_camera_permission.jpg'
import classNames from 'classnames'
import { MicOff, Mic, Videocam, VideocamOff, Call, CallEnd } from '@material-ui/icons';

const styles = theme => ({
    button: {
        position: 'absolute', 
        // backgroundColor: '#eee',
        backgroundColor: 'rgba(238,238,238,0.7)',
    },
    callBtn: {
        left: '50%', 
        top: '0%', 
        height: '20%',
        width: '100%',
        transform: 'translateX(-50%) translateY(-0%)'
    },
    disableMicBtn: {
        left: '0%', 
        top: '0%', 
        height: '20%',
        width: '33.33%',
        transform: 'translateX(-0%) translateY(-0%)'
    },
    disableCameraBtn: {
        left: '33.33%', 
        top: '0%', 
        height: '20%',
        width: '33.33%',
        transform: 'translateX(-cal(33.33/2)%) translateY(-0%)'
    },
    hangupBtn: {
        left: '66.66%', 
        top: '0%', 
        height: '20%',
        width: '33.33%',
        transform: 'translateX(-cal(33.33/2)%) translateY(-0%)'
    }
})

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
}

class LocalStream extends React.Component {
    pc = {}

    defaultState = {
        started: false,
        called: false,
        peerConn: null,
        turnReady: null,
        // gotAnswer: [],
        pcConfig: {
            'iceServers': [
                {'urls': [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    // 'stun:stun2.l.google.com:19302',
                    // 'stun:stun3.l.google.com:19302',
                    // 'stun:stun4.l.google.com:19302',
                    // 'stun:stun.ekiga.net',
                    // 'stun:stun.ideasip.com',
                    // 'stun:stun.rixtelecom.se',
                    // 'stun:stun.schlund.de',
                    // 'stun:stun.stunprotocol.org:3478',
                    // 'stun:stun.voiparound.com',
                    // 'stun:stun.voipbuster.com',
                    // 'stun:stun.voipstunt.com',
                    // 'stun:stun.voxgratia.org'
                ]}, {
                    'urls': 'turn:overcoded.tk:3478',
                    'username': 'user',
                    'credential': "root"
                },
                // {
                //     urls: 'turn:192.158.29.39:3478?transport=udp',
                //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                //     username: '28224511:1379330808'
                // },
                {
                    urls: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
                    credential: 'webrtc',
                    username: 'webrtc'
                }
            ]
        },
        micEnabled: false,
        cameraEnabled: false,
    }

    state = this.defaultState

    async componentDidMount() {
        checkTURNServer(this.state.pcConfig['iceServers'][1], 5000)
            .then((bool) => console.log('is TURN server active? ', bool? 'yes':'no'))
            .catch(console.error.bind(console))

        conn.addListener("request_offer", this.requestOfferListener)
        conn.addListener("answer", this.answerListener)
        conn.addListener("candidate", this.candidateListener)
        conn.addListener("action", this.actionListener)
        this.getUserMedia()
    }

    componentWillUnmount() {
        conn.removeListener("request_offer", this.requestOfferListener)
        conn.removeListener("candidate", this.candidateListener)
        conn.removeListener("action", this.actionListener)
        conn.removeListener("answer", this.answerListener)
        if (this.state.called) this.hangup()
    }

    // if permission changed by teacher, toggle camera/mic off
    componentDidUpdate(prevProps) {
        const {webcamPermission} = this.props
        console.log(webcamPermission)
        console.log(webcamPermission.video)
        console.log(webcamPermission.audio)

        if (prevProps.webcamPermission.video !== webcamPermission.video) {
            console.log(webcamPermission.video)
            if (webcamPermission.video === false) {
                this.props.handleClassNotification(`Camera Disabled by teacher`)
                console.warn(`Camera Disabled:`, webcamPermission.video, prevProps.webcamPermission.video)
                this.setState({cameraEnabled: false})
                channel.broadcastAction("toggleCamera")
            }
        }
        if (prevProps.webcamPermission.audio !== webcamPermission.audio) {
            console.log(webcamPermission.audio)
            if (webcamPermission.audio === false) {
                this.props.handleClassNotification(`Mic Disabled by teacher`)
                console.warn(`Mic Disabled:`, webcamPermission.audio, prevProps.webcamPermission.audio)
                this.setState({micEnabled: false})
                channel.broadcastAction("toggleMic")
            }
        }
    }

    requestOfferListener = from => {
        if (this.state.called) this.inRequestForPeerConn(from)
    }

    answerListener = e => {
        if (this.state.called) {
            console.log("received answer from", e.from)
            console.warn(e.from)
            console.warn(this.pc[e.from])
            console.warn(this.pc[e.from].signalingState)
            this.pc[e.from].setRemoteDescription(e.answer)
        }
    }

    candidateListener = e => {
        if (e.stream_owner !== this.props.self) return
        console.log(e.stream_owner, this.props.self)
        console.log(e)
        if (this.state.called && e.candidate === null) return
        try {
            setTimeout(() => this.pc[e.from].addIceCandidate(e.candidate), 1000)
            console.log("Local adding ice from", e.from)
        } catch (_ignore) {
            console.log("Catch ERROR")
            console.log(e)
        }
    }

    actionListener = e => {
        console.warn("localstream received invalid action:", e)
        // switch (e.action) {
        //     case "hangup":
        //         if (this.pc[e.from]) {
        //             console.log("localstream received hangup from", e.from)
        //             this.pc[e.from].close()
        //             this.pc[e.from] = null
        //         }
        //         break
        //     default:
        // }
    }

    getUserMedia = async () => {
        let constrains = { audio: true, video: true }
        await navigator.mediaDevices
            .getUserMedia(constrains)
            .then(stream => this.gotStream(stream))
            .then(async () => await this.setState({
                called: false,
                started: true,
                cameraEnabled: true,
                micEnabled: true
            }))
            .then(() => console.info("got user media with constrains:", Object.keys(constrains)))
            .catch (async e => {
                console.log(`getUserMedia() with constrains ${Object.keys(constrains)} failed: `, e)
                constrains = { audio: true }
                await navigator.mediaDevices
                    .getUserMedia(constrains)
                    .then(stream => this.gotStream(stream))
                    .then(async () => await this.setState({
                        called: false,
                        started: true,
                        micEnabled: true
                    }))
                    .then(() => console.info("got user media with constrains:", Object.keys(constrains)))
                    .catch (e => {
                        console.log(`getUserMedia() with constrains ${Object.keys(constrains)} failed: `, e)                               
                    })                  
            })
    }

    hangup = () => {
        console.log(this.state)
        this.setState(this.defaultState, () => console.log(this.state))
        // this.props.ws.removeEventListener("message", this.wsEventListener)
        for (let target in this.pc) {
            if (this.pc[target]) {
                this.pc[target].close()
                this.pc[target] = null
            }
        }
        if (this.localStream !== undefined) {
            try {this.localStream.getTracks()[0].stop()} catch(_ignore) {}
            try {this.localStream.removeTrack(this.localStream.getTracks()[0])} catch(_ignore) {}
            try {this.localStream.getTracks()[1].stop()} catch(_ignore) {}
            try {this.localStream.removeTrack(this.localStream.getTracks()[1])} catch(_ignore) {}
            this.localVideo.srcObject = null
            this.localVideo.srcObject = this.localStream
        }
        //gotAnswer
        console.info(`closing Local stream...`)
    }

    call = () => {
        this.setState({ called: true })
        console.log("Starting calls")
        const audioTracks = this.localStream.getAudioTracks()
        const videoTracks = this.localStream.getVideoTracks()
        if (audioTracks.length > 0) {
            console.log(`Using audio device: ${audioTracks[0].label}`)
        }
        if (videoTracks.length > 0) {
            console.log(`Using video device: ${videoTracks[0].label}`)
        }
        channel.gotUserMedia()
    }

    inRequestForPeerConn = (target) => {
        console.log(`%%% ${this.state.started}`)
        console.log(this.pc[target])
        if (this.pc[target] !== undefined && this.pc[target] !== null) {
            // window.alert(`clearing ${target}'s pc`)
            this.pc[target].close()
            this.pc[target] = null
        }
        console.log(this.pc[target])
        if (this.state.started) {
            this.pc[target] = new RTCPeerConnection(this.state.pcConfig)
            this.pc[target].onicecandidate = (event) => this.iceCallbackLocal(event, target)
            console.log(`Local: created remote peer connection object`)
            this.localStream.getTracks().forEach(track => {
                console.log(`Adding track: ${track.kind}`)
                this.pc[target].addTrack(track, this.localStream)
            })
            console.log("added local stream to local peer connection")
            this.pc[target].createOffer(offerOptions)
                .then((desc) => this.sendOfferDescription(desc, target), this.onCreateOfferDescriptionError)
        }
    }

    gotStream = (stream) => { //called after start and before call
        console.log("Receive local stream")
        // stream = this.modifyGain(stream)
        this.localVideo.srcObject = stream
        this.localStream = stream //hide call btn after this //label, enabled, muted

        // disable webcam after got stream if no permission
        if (!this.props.webcamPermission.video) {
            this.props.handleClassNotification(`Camera Disabled by teacher`)
            this.setState({cameraEnabled: !this.state.cameraEnabled})
            channel.broadcastAction("toggleCamera")
        }
        if (!this.props.webcamPermission.audio ) {
            this.props.handleClassNotification(`Mic Disabled by teacher`)
            this.setState({micEnabled: !this.state.micEnabled})
            channel.broadcastAction("toggleMic")
        }
    }
    
    sendOfferDescription = (offerDesc, target) => {
        // console.warn(target)
        // console.warn(this.pc[target])
        // console.warn(this.pc[target].signalingState)
        this.pc[target].setLocalDescription(offerDesc)
        channel.sendOffer(this.props.self, offerDesc, target) //send offer and wait for answer
    }

    onCreateOfferDescriptionError = (err) => {
        // console.log(`Local: Failed to create session description: ${err.toString}`)
        console.log(`Local: Failed to create session description`)
    }

    iceCallbackLocal = (event, target) => {
        setTimeout(() => {
            this.pc[target].addIceCandidate(event.candidate)
                .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError)
            channel.sendCandidate(this.props.self, event.candidate, target)
            // console.log(`Local pc: New Ice candidate: ${event.candidate ? event.candidate.candidate : "(null)"}`)
            // console.log(`Local pc: New Ice candidate: ${event.candidate ? `NOT null` : "(null)"}`)
        }, 1000)
    }

    onAddIceCandidateSuccess = () => {
        console.log("AddIceCandidateSuccess")
    }

    onAddIceCandidateError = (e) => {
        console.log(`AddIceCandidateFailed: ${e.toString()}`)
    }

    toggleMic = () => {
        if (this.props.webcamPermission.audio) {
            this.props.handleClassNotification(`Mic ${!this.state.micEnabled? 'On':'Off'}`)
            this.setState({micEnabled: !this.state.micEnabled})
            channel.broadcastAction("toggleMic")
        } else {
            console.warn(this.props.webcamPermission)
            this.props.handleClassNotification('No Permission to toggle Mic')
        }
    }
    
    toggleCamera = () => {
        if (this.props.webcamPermission.video) {
            this.props.handleClassNotification(`Camera ${!this.state.cameraEnabled? 'On':'Off'}`)
            this.setState({cameraEnabled: !this.state.cameraEnabled})
            channel.broadcastAction("toggleCamera")
        } else {
            console.warn(this.props.webcamPermission)
            this.props.handleClassNotification('No Permission to toggle Camera')
        }
    }

    render() {
        const {classes} = this.props
        return (
            <div style={{position: 'relative'}}>
                <video poster={poster}
                    width = '100%'
                    height = '100%'
                    autoPlay muted playsInline ref = {
                        video => {this.localVideo = video
                    }}> </video>
                <Button 
                    style={{visibility: (this.state.called)? 'visible' : 'hidden'}}
                    className={classNames(classes.disableMicBtn, classes.button)}
                    onClick = {this.toggleMic} >
                    {this.state.micEnabled && <Mic/>}
                    {!this.state.micEnabled && <MicOff/>}
                </Button> 
                <Button 
                    style={{visibility: (this.state.called)? 'visible' : 'hidden'}}
                    className={classNames(classes.disableCameraBtn, classes.button)}
                    onClick = {this.toggleCamera} >
                    {this.state.cameraEnabled && <Videocam/>}
                    {!this.state.cameraEnabled && <VideocamOff/>}
                </Button> 
                <Button 
                    style={{visibility: (this.state.called)? 'visible' : 'hidden'}}
                    className={classNames(classes.hangupBtn, classes.button)}
                    onClick = {() => {
                        channel.broadcastAction("hangup")
                        this.hangup()
                        this.getUserMedia()
                    }} >
                    <CallEnd/>
                </Button> 
                <Button 
                    style={{visibility: (!this.state.started || this.state.called)? 'hidden' : 'visible'}}
                    className={classNames(classes.callBtn, classes.button)}
                    onClick = {this.call}
                    disabled = {!this.state.started || this.state.called} > 
                    <Call/>
                </Button> 
            </div>
        )
    }
}

export default withStyles(styles)(LocalStream)