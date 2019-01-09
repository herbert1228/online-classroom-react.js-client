import React from 'react'
import {
    withStyles
} from '@material-ui/core/styles'
import { Button } from '@material-ui/core';
import { DESTRUCTION } from 'dns';

const styles = theme => ({})

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
}

class LocalStream extends React.Component {
    state = {
        started: false,
        called: true,
        peerConn: null,
        turnReady: null,
        pcConfig: {
            'iceServers': [{
                'urls': 'stun:stun.l.google.com:19302'
            }]
        }
    }
    
    componentDidMount() {
        const { isStarted } = this.state

        console.log(this.props.user, 'Attempting to start stream')

        this.props.ws.addEventListener("message", e => {
            const event = JSON.parse(e.data)
            if (event.type === "join") {
                console.log('Received a request to join room from:') // + event.joiner_pid)
            }
            if (event.stream_owner === this.props.user) {
                console.log('Stream', this.props.user, 'received message:', event.type)
                switch (event.type) {
                    case "got user media":
                        this.maybeStart()
                        break

                    case "answer":
                        if (isStarted) {
                            this.state.pc.setRemoteDescription(new RTCSessionDescription(event)) //rebuild the message of answer
                        }
                        break
                    case "candidate":
                        if (isStarted) {
                            let candidate = new RTCIceCandidate({
                                sdpMLineIndex: event.label,
                                candidate: event.candidate
                            })
                            this.state.pc.addIceCandidate(candidate)
                        }
                        break
                    case "bye":
                        if (isStarted) {
                            this.handleRemoteHangup()
                        }
                        break
                    default:
                        break
                }
            }
        })
    }

    sendMessage(message) {
        console.log('Local sending message: ', message)
        this.props.ws.send(JSON.stringify({ type: "stream_message", message }))
    }

    start = () => {
        console.log("Requesting local stream")
        this.setState({ started: true })
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: true
            })
            .then(this.gotStream)
            .then(this.setState({ called: false })) // state changes before stream is added
            .catch(e => console.log("getUserMedia() error: ", e))
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

        const server = null
        this.createPeerConn() //create peerConn for each pair
    }

    inRequestForPeerConn = () => {

    }

    gotStream = (stream) => {
        console.log("Receive local stream")
        this.localVideo.srcObject = stream
        this.localStream = stream //hide call btn after this
    }

    gotDescription = (desc) => {
        const pc = this.state.peerConn
        pc.setLocalDescription(desc)
        console.log(`Offer from local peer conn:\n${desc.sdp}`)
        //send to opponent on order to let remote pc setRemoteDescruption based on desc
        //and createAnswer back to us
    }

    handleIce = (event) => {
        dest.addIceCandidate(event.candidate)
            .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError)
        console.log(`Remote/Local, pc: No. , New Ice candidate: ${event.candidate ? event.candidate.candidate : "(null)"}`)
    }

    onAddIceCandidateSuccess = () => {
        console.log("AddIceCandidateSuccess")
    }

    onAddIceCandidateError = (e) => {
        console.log(`Failed to add ICE candidate: ${e.toString()}`)
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
                <Button onClick={this.start} disabled={this.state.started}>Start</Button>
                <Button onClick={this.call} disabled={this.state.called}>Call</Button>
            </div>
        )
    }
}

export default withStyles(styles)(LocalStream)