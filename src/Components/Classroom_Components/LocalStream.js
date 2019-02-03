import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import {Button} from '@material-ui/core'
import {connection as conn} from '../../interface/connection'

const styles = theme => ({})

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
        console.info(`!!!!!!!! ${this.state.started}`)

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
        conn.addListener("", () => {})
        this.props.ws.addEventListener("message", this.wsEventListener)
        this.props.ws.addEventListener("message", e => {
            const event = JSON.parse(e.data)
            if (event.stream_owner === this.props.user || event.to === this.props.user) {
                if (event.type === "request_offer") {
                    console.log('Stream', this.props.user, 'received message:', event.type)
                    console.info(`### ${this.state.started}`)
                    this.inRequestForPeerConn(event.from)
                }
            }
        })
        console.info(`!!!!!!!!2 ${this.state.started}`)
    }

    componentWillUnmount() {
        this.stop()
    }

    stop = () => {
        this.setState(this.defaultState)
        this.props.ws.removeEventListener("message", this.wsEventListener)
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
        console.info(`closing Local stream...`)
    }

    preparePeerConnection(from, callback) {
        this.pc[from].onicecandidate = (event) => this.iceCallbackLocal(event, from)
        console.log(`Local: created remote peer connection object`)

        callback()
    }

    wsEventListener = (e) => {
        if (event.stream_owner === this.props.user || event.to === this.props.user) {
            console.log('Stream', this.props.user, 'received message:', event.type)
            switch (event.type) {
                case "answer":
                    if (this.state.called) {
                        this.pc[event.from].setRemoteDescription(event.desc)
                    }
                    break
                case "candidate":
                    if (this.state.called && event.candidate !== null) {
                        try {
                            this.pc[event.from].addIceCandidate(event.candidate)
                        } catch (_ignore) {
                            console.log("Catch ERROR")
                            console.log(event)
                        }
                    }
                    break
                case "bye":
                    if (this.state.called) {
                        this.handleRemoteHangup()
                    }
                    break
                default:
                    break
            }
        }
    }

    sendBroadcastMessage(message) {
        console.log('Local sending message: ', message.type)
        this.props.ws.send(JSON.stringify({
            type: "class_broadcast_message",
            message
        }))
    }

    sendDirectMessage(message, to) {
        console.log(`Local sending message to ${to}: `, message.type)
        message.to = to
        this.props.ws.send(JSON.stringify({
            type: "class_direct_message",
            message
        }))
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
        this.sendBroadcastMessage({
            type: "got user media"
        })
    }

    inRequestForPeerConn = (from) => {
        console.log(`%%% ${this.state.started}`)
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
        this.sendDirectMessage({
            type: "candidate",
            candidate: event.candidate,
            stream_owner: this.props.user
        }, from)
        // console.log(`Local pc: New Ice candidate: ${event.candidate ? event.candidate.candidate : "(null)"}`)
        // console.log(`Local pc: New Ice candidate: ${event.candidate ? `NOT null` : "(null)"}`)
    }

    onAddIceCandidateSuccess = () => {
        console.log("AddIceCandidateSuccess")
    }

    onAddIceCandidateError = (e) => {
        // console.log(`Failed to add ICE candidate: ${e.toString()}`)
        // console.log(`Failed to add ICE candidate`)
    }

    onCreateSessionDescriptionError = (err) => {
        // console.log(`Local: Failed to create session description: ${err.toString}`)
        console.log(`Local: Failed to create session description`)
    }

    render() {
        // const {classes, user} = this.props

        return ( <div>
            <video width = "460"
            height = "300"
            autoPlay muted playsInline ref = {
                video => {
                    this.localVideo = video
                }
            } > </video> { /* <Button onClick={this.start} disabled={this.state.started}>Start</Button> */ } 
            <Button onClick = {
                this.call
            }
            disabled = {
                this.state.called
            } > Call </Button> 
            </div>
        )
    }
}

export default withStyles(styles)(LocalStream)