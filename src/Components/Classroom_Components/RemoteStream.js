import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import {signalingChannel as channel, connection as conn} from '../../interface/connection'
import { Avatar } from '@material-ui/core';
import { Person } from '@material-ui/icons';

const styles = theme => ({
    avatar: {
        position: 'absolute', 
        left: '50%', 
        top: '30%', 
        height: 50,
        width: 50,
        transform: 'translateX(-50%) translateY(0%)'
    },
})

class RemoteStream extends React.Component {
    defaultState = {
        requesting: false,
        turnReady: null,
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
        videoEnabled: false,
        initCameraState: true,
        initMicState: true
    }

    state = this.defaultState

    componentDidMount() {
        this.peerConn = new RTCPeerConnection(this.state.pcConfig)
        this.peerConn.ontrack = this.gotRemoteStream
        this.peerConn.onicecandidate = this.iceCallbackRemote
        this.peerConn.onnegotiationneeded = ev => console.log("negotiationneeded", ev)
        console.log(`${this.props.user}: created remote peer connection object`)

        conn.addListener("got_media", this.gotMediaListener)
        conn.addListener("offer", this.offerListener)
        conn.addListener("candidate", this.candidateListener)
        conn.addListener("action", this.actionListener)

        console.log(this.props.peerConn)
        console.log(this.props.session_user)
        if (this.props.session_user.includes(this.props.user)) {
            this.requestOffer()
        } else {console.warn("Not requesting offer when initializing")}
    }

    componentWillUnmount() {
        conn.removeListener("got_media", this.gotMediaListener)
        conn.removeListener("offer", this.offerListener)
        conn.removeListener("candidate", this.candidateListener)
        conn.removeListener("action", this.actionListener)
    }

    gotMediaListener = e => {
        // if (!this.state.requesting) 
        if (e === this.props.user) this.requestOffer()
    }

    offerListener = e => {
        if (this.peerConn === null) {
            this.peerConn = new RTCPeerConnection(this.state.pcConfig)
            this.peerConn.ontrack = this.gotRemoteStream
            this.peerConn.onicecandidate = this.iceCallbackRemote
            this.peerConn.onnegotiationneeded = ev => console.log("negotiationneeded", ev)
            console.log(`${this.props.user}: created remote peer connection object`)
        }
        if( e.from === this.props.user) {
            this.setRemoteDescriptionForPeerConn(e.offer)
        }
        this.setState({initMicState: e.mic, initCameraState: e.camera})
    }

    candidateListener = e => {
        if (e.stream_owner !== this.props.user) return
        if (!this.state.requesting) return
        if (e.candidate === null) return
        console.log("Remote adding ice from", e.from)
        setTimeout(() => this.peerConn.addIceCandidate(e.candidate), 1000)
    }

    actionListener = e => {
        if (e.from !== this.props.user) return
        console.log(e.action, e.from)
        switch (e.action) {
            case "toggleMic":
                this.toggleTrack(this.remoteVideo.srcObject, "audio")
                break
            case "toggleCamera":
                this.toggleTrack(this.remoteVideo.srcObject, "video")
                break
            case "hangup":
                this.hangup()
                break
            default:
                console.warn("Unexpected action from server:", e.action, e.from)
        }
    }

    toggleTrack = (stream, type) => {
        console.warn("receive toggle:", type)
        if (!stream) {
            console.warn("stream Object is null, while toggling", type)
            return
        }
        stream.getTracks().forEach(track => {
            if (track.kind === type) track.enabled = ! track.enabled
            if (type === "video") this.setState({videoEnabled: track.enabled})
        })
    }

    hangup = () => {
        this.setState({requesting: false})
        if (!this.peerConn) return
        if (this.remoteVideo === null) return
        console.info(`closing remote stream: ${this.props.user}...`)
        this.peerConn.close()
        this.peerConn = null
        this.remoteVideo.srcObject = null
        this.setState({videoEnabled: false})
    }

    requestOffer = () => {
        this.setState({ requesting: true })
        channel.requestOffer(this.props.user)
    }

    setRemoteDescriptionForPeerConn = (offerDesc) => {
        this.peerConn.setRemoteDescription(offerDesc)
        this.peerConn.createAnswer()
            .then(this.gotDescriptionRemote, this.onCreateSessionDescriptionError)
    }

    gotDescriptionRemote = (answerDesc) => { // send answer to streamer
        this.peerConn.setLocalDescription(answerDesc)
        channel.sendAnswer(this.props.user, answerDesc, this.props.user)
    }

    onCreateSessionDescriptionError = (err) => {
        console.log(`Failed to create session desc for ${this.props.user}: ${err.toString()}`)
    }

    gotRemoteStream = async (e) => {
        if (this.remoteVideo !== null) {
            if (this.remoteVideo.srcObject !== e.streams[0]) {
                this.remoteVideo.srcObject = e.streams[0]
                e.streams[0].getTracks().forEach(track => {
                    if (track.kind === "video") {
                        this.setState({videoEnabled: true})
                        track.enabled = this.state.initCameraState
                        console.warn("init camera:", this.state.initCameraState)
                    }
                    if (track.kind === "audio") {
                        track.enabled = this.state.initMicState
                        console.warn("init audio:", this.state.initMicState)
                    }
                })
                console.log(`${this.props.user}'s pc: GOT remote stream (webcam)`)
            }
        }
        this.setState({ requesting: false })

        //set track enable/disable
        // const result = await channel.getPermission()
        
    }

    iceCallbackRemote = (event) => {
        setTimeout(() => {
            this.peerConn.addIceCandidate(event.candidate)
                .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError)
            channel.sendCandidate(this.props.user, event.candidate, this.props.user)
            console.log(`${this.props.user}'s pc New ICE candidate: ${event.candidate ? event.candidate.candidate : "(null)"}`)
        }, 1000)
    }

    onAddIceCandidateSuccess = () => {
        console.log("AddIceCandidateSuccess")
    }

    onAddIceCandidateError = (e) => {
        console.log(`AddIceCandidateFailed: ${e.toString()}`)
    }

    render() {
        const {classes} = this.props
        return ( 
            <div style={{position: 'relative'}}>
                <video 
                    // poster="https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/P3IPDsA/loading-bar-scribble-animation-doodle-cartoon-4k_sdfqzybaux_thumbnail-full05.png"
                    // width = { this.props.small ? "100%" : "460" }
                    // height = { this.props.small ? "100%" : "300" }
                    width = '100%'
                    height = '100%'
                    autoPlay playsInline ref = {
                        video => {
                            this.remoteVideo = video
                        }
                } > </video>
                {!this.state.videoEnabled && 
                    // <Avatar className={classes.avatar}>{this.props.user.substring(0,3)}</Avatar>
                    <Avatar className={classes.avatar}><Person/></Avatar>
                }
            </div>
        )
    }
}

export default withStyles(styles)(RemoteStream)