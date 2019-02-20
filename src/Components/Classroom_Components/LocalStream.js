import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import {Button} from '@material-ui/core'
import {signalingChannel as channel, connection as conn, checkTURNServer} from '../../interface/connection'
import poster from '../../css/ask_camera_permission.jpg'

const styles = theme => ({
    button: {
        position: 'absolute', 
        left: '50%', 
        top: '50%', 
        height: 160,
        width: 220,
        backgroundColor: '#eee',
        opacity: '80%',
        transform: 'translateX(-50%) translateY(-50%)'
    },
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
            'iceServers': [{
                'urls': 'stun:stun.l.google.com:19302'
            }, {
                'urls': 'turn:overcoded.tk:3478',
                'username': 'user',
                'credential': "root"
            }]
        }
    }

    state = this.defaultState

    async componentDidMount() {
        checkTURNServer(this.state.pcConfig['iceServers'][1], 5000)
            .then((bool) => console.log('is TURN server active? ', bool? 'yes':'no'))
            .catch(console.error.bind(console))

        try {
            const stream = await navigator.mediaDevices
                .getUserMedia({
                    audio: true,
                    video: true
                })

            this.gotStream(stream)
            await this.setState({
                called: false,
                started: true
            }) // state changes before stream is added
            console.info("!!!turned to true!!!")
        } catch (e) {
            console.log("getUserMedia() error: ", e)
        }
        conn.addListener("request_offer", (from) => this.inRequestForPeerConn(from))
        conn.addListener("answer", (e) => {
            if (this.state.called) {
                console.log("received answer from", e.from)
                this.pc[e.from].setRemoteDescription(e.answer)
            }
        })
        conn.addListener("candidate", (e) => {
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
        })
    }

    componentWillUnmount() {
        this.stop()
    }

    stop = () => {
        this.setState(this.defaultState)
        // this.props.ws.removeEventListener("message", this.wsEventListener)
        for (let target in this.pc) {
            // if (typeof target === typeof RTCPeerConnection)
            // target.close()
            this.pc[target].close()
            this.pc[target] = null
        }
        if (this.localStream !== undefined) {
            this.localStream.getTracks()[0].stop()
            this.localStream.getTracks()[1].stop()
        }
        //gotAnswer
        console.info(`closing Local stream...`)
    }

    call = () => {
        this.setState({
            called: true
        })
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
        this.localVideo.srcObject = stream
        this.localStream = stream //hide call btn after this //label, enabled, muted
    }

    sendOfferDescription = (offerDesc, target) => {
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

    render() {
        return (
            <div style={{position: 'relative'}}>
                <video poster={poster}
                    width = '100%'
                    height = '100%'
                    autoPlay muted playsInline ref = {
                        video => {this.localVideo = video
                    }}> </video>
                <Button 
                    style={{visibility: (!this.state.started || this.state.called)? 'hidden' : 'visible'}}
                    className={this.props.classes.button}
                    onClick = {this.call}
                    disabled = {!this.state.started || this.state.called} > 
                    Call
                </Button> 
            </div>
        )
    }
}

export default withStyles(styles)(LocalStream)