import React from 'react'
import {
    withStyles
} from '@material-ui/core/styles'
import { Button } from '@material-ui/core';

const styles = theme => ({})

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
}

class LocalStream extends React.Component {
    pc = {}

    state = {
        started: false,
        called: false,
        peerConn: null,
        turnReady: null,
        pcConfig: {
            'iceServers': [{
                'urls': 'stun:stun.l.google.com:19302'
            }
            , {
                'urls': 'turn:overcoded.tk:3478',
                'username': 'user',
                'credential': "root"
            }
        ]
        }
    }

    async componentDidMount() {
        this.props.ws.addEventListener("message", this.wsEventListener)
        try {
            const stream = await navigator.mediaDevices
                .getUserMedia({
                    audio: true,
                    video: true
                })

            this.gotStream(stream)
            await this.setState({ called: false, started: true }) // state changes before stream is added
        } catch (e) { console.log("getUserMedia() error: ", e) }

        this.props.ws.addEventListener("message", e => {
            const event = JSON.parse(e.data)
            if (event.stream_owner === this.props.user || event.to === this.props.user) {
                if (event.type === "request_offer") {
                    console.log('Stream', this.props.user, 'received message:', event.type)
                    this.inRequestForPeerConn(event.from)
                }
            }
        })
        // this.requestTurn("https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913")
    }

    componentWillUnmount() {
        // this.props.ws.removeEventListener("message", this.wsEventListener)
        for (let target in this.pc) {
            if (typeof target === typeof RTCPeerConnection)
            target.close()
        }
        if (this.localStream !== undefined) {
            this.localStream.getTracks()[0].stop()
        }
        console.info(`closing Local stream...`)
    }

    preparePeerConnection(from, callback) {
        this.pc[from].onicecandidate = (event) => this.iceCallbackLocal(event, from)
        console.log(`Local: created remote peer connection object`)

        callback()
    }

    wsEventListener = (e) => {
        const { called } = this.state

        const event = JSON.parse(e.data)
        console.log("received message", event)
        if (event.stream_owner === this.props.user || event.to === this.props.user) {
            console.log('Stream', this.props.user, 'received message:', event.type)
            switch (event.type) {
                case "answer":
                    if (called) {
                        this.pc[event.from].setRemoteDescription(event.desc)
                    }
                    break
                case "candidate":
                    if (called && event.candidate !== null) {
                        try{
                            this.pc[event.from].addIceCandidate(event.candidate)
                        } catch (_ignore){
                            console.log("Catch ERROR")
                            console.log(event)
                        }
                    }
                    break
                case "bye":
                    if (called) {
                        this.handleRemoteHangup()
                    }
                    break
                default:
                    break
            }
        }
    }

    sendBroadcastMessage(message) {
        console.log('Local sending message: ', message)
        this.props.ws.send(JSON.stringify({ type: "class_broadcast_message", message }))
    }

    sendDirectMessage(message, to) {
        console.log(`Local sending message to ${to}: `, message)
        message.to = to
        this.props.ws.send(JSON.stringify({ type: "class_direct_message", message }))
    }

    call = () => {
        this.sendBroadcastMessage({ type: "got user media" })
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
    }

    inRequestForPeerConn = (from) => {
        console.log(this.pc[from])
        if (this.pc[from] !== undefined && this.pc[from] !== null) {
            // window.alert(`clearing ${from}'s pc`)
            this.pc[from].close()
            this.pc[from] = null
        }
        console.log(this.pc[from])
        if (this.state.started) {
            this.pc[from] = new RTCPeerConnection(this.state.pcConfig)
            this.preparePeerConnection(from, () => {
                this.localStream.getTracks().forEach(track => {
                    console.log(`Adding track: ${JSON.stringify(track)}`)
                    this.pc[from].addTrack(track, this.localStream)
                })
                console.log("added local stream to local peer connection")
                this.pc[from].createOffer(offerOptions)
                    .then((desc) => this.gotDescription(desc, from), this.onCreateSessionDescriptionError)
            })
        }
    }

    gotStream = (stream) => { //called after start and before call
        console.log("Receive local stream")
        this.localVideo.srcObject = stream
        this.localStream = stream //hide call btn after this
    }

    gotDescription = (desc, from) => {
        this.pc[from].setLocalDescription(desc)
        desc.stream_owner = this.props.self
        this.sendDirectMessage(desc, from) //send in order to wait for answer
    }

    iceCallbackLocal = (event, from) => {
        this.pc[from].addIceCandidate(event.candidate)
            .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError)
        this.sendDirectMessage({ type: "candidate", candidate: event.candidate, stream_owner: this.props.user }, from)            
        console.log(`Local pc: New Ice candidate: ${event.candidate ? event.candidate.candidate : "(null)"}`)
    }

    onAddIceCandidateSuccess = () => {
        console.log("AddIceCandidateSuccess")
    }

    onAddIceCandidateError = (e) => {
        console.log(`Failed to add ICE candidate: ${e.toString()}`)
    }

    onCreateSessionDescriptionError = (err) => {
        console.log(`Local: Failed to create session description: ${err.toString}`)
    }

    requestTurn(turnURL) {
        let turnExists = false
        for (let i in this.state.pcConfig.iceServers) {
            if (this.state.pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
                turnExists = true
                this.setState({ turnReady: true })
                break
            }
        }
        if (!turnExists) {
            console.log('Getting TURN server from ', turnURL)
            // No TURN server. Get one from computeengineondemand.appspot.com:
            let xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let turnServer = JSON.parse(xhr.responseText)
                    console.log('Got TURN server: ', turnServer)
                    this.state.pcConfig.iceServers.push({
                        'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
                        'credential': turnServer.password
                    })
                    this.setState({ turnReady: true })
                }
            }
            xhr.open('GET', turnURL, true)
            xhr.send()
        }
    }

    render() {
        // const {classes, user} = this.props

        return (
            <div >
                <video
                    width="460"
                    height="300"
                    autoPlay muted playsInline ref={
                        video => {
                            this.localVideo = video
                        }
                    } > </video>
                {/* <Button onClick={this.start} disabled={this.state.started}>Start</Button> */}
                <Button onClick={this.call} disabled={this.state.called}>Call</Button>
            </div>
        )
    }
}

export default withStyles(styles)(LocalStream)