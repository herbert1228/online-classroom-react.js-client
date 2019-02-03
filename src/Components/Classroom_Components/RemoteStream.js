import React from 'react'
import {
    withStyles
} from '@material-ui/core/styles'

const styles = theme => ({})

class RemoteStream extends React.Component {
    defaultState = {
        requesting: false,
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

    componentDidMount() {
        if (this.props.user === "Teacher")
            return

        this.peerConn = new RTCPeerConnection(this.state.pcConfig)
        this.peerConn.ontrack = this.gotRemoteStream
        this.peerConn.onicecandidate = this.iceCallbackRemote
        console.log(`${this.props.user}: created remote peer connection object`)

        this.props.ws.addEventListener("message", this.wsEventListener)

        // case "get_exist_peer_conn":
        // this.setState({ peerConn: event.exist_peer_conn })
        // break
        // if (this.props.peerConn.includes(this.props.user)) {
        //     this.requestOffer()
        // }
    }

    componentWillUnmount() {
        this.props.ws.removeEventListener("message", this.wsEventListener)
        if (this.peerConn) {
            this.peerConn.close()
        }
        console.info(`closing remote stream: ${this.props.user}...`)
    }

    wsEventListener = (e) => {
        const event = JSON.parse(e.data)
        // if (event.type === "join") {
        //     console.log('Received a request to join room from:') // + event.joiner_pid)
        // }
        if (event.stream_owner === this.props.user) {
            console.log('Stream', this.props.user, 'received message:', event.type)
            switch (event.type) {
                case "got user media":
                    if (!this.state.requesting) {
                        this.requestOffer()
                    } else {
                        console.log(this.state.requesting);
                        console.log(this.state)
                    }
                    break
                case "offer":
                    this.setRemoteDescriptionForPeerConn(event)
                    break
                case "candidate":
                    if (this.state.requesting) {
                        if (event.candidate !== null) {
                            this.peerConn.addIceCandidate(event.candidate)
                        }
                    }
                    break
                default:
                    console.log(`Not Controlledd:`)
                    console.log({ ...event
                    })
                    break
            }
        }
    }

    sendDirectMessage(message, to) {
        console.log(`Remote sending message to ${to}: `, message)
        message.to = to
        this.props.ws.send(JSON.stringify({
            type: "class_direct_message",
            message
        }))
    }

    requestOffer = () => {
        this.setState({
            requesting: true
        })
        // this.sendMessage({ type: "request_offer", stream_owner: this.props.user }) //TODO include self in json for opponent to reply        
        this.sendDirectMessage({
            type: "request_offer"
        }, this.props.user)
    }

    setRemoteDescriptionForPeerConn = (desc) => {
        const {
            peerConn
        } = this
        peerConn.setRemoteDescription(desc)
        peerConn.createAnswer()
            .then(this.gotDescriptionRemote, this.onCreateSessionDescriptionError)
            .then(this.setState({
                peerConn
            }))
            .catch(this.setState({
                peerConn
            }))
    }

    gotDescriptionRemote = (desc) => { // send answer to streamer
        this.peerConn.setLocalDescription(desc)
        const modDesc = {
            desc
        }
        modDesc.stream_owner = this.props.user
        modDesc.type = "answer"
        this.sendDirectMessage(modDesc, this.props.user)
    }

    onCreateSessionDescriptionError = (err) => {
        console.log(`Failed to create session desc for ${this.props.user}: ${err.toString()}`)
    }

    gotRemoteStream = (e) => {
        if (this.remoteVideo !== null) {
            if (this.remoteVideo.srcObject !== e.streams[0]) {
                this.remoteVideo.srcObject = e.streams[0]
                console.log(`${this.props.user}'s pc: received remote stream (webcam)`)
            }
            // if (this.remoteAudio.srcObject !== e.streams[0]) {
            //     this.remoteAudio.srcObject = e.streams[0]
            //     console.log(`${this.props.user}'s pc: received remote stream (audio)`)
            // }
        }
    }

    iceCallbackRemote = (event) => {
        this.peerConn.addIceCandidate(event.candidate)
            .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError)
        this.sendDirectMessage({
            type: "candidate",
            candidate: event.candidate,
            stream_owner: this.props.user
        }, this.props.user)
        console.log(`${this.props.user}'s pc New ICE candidate: ${event.candidate ? event.candidate.candidate : "(null)"}`)
    }

    onAddIceCandidateSuccess = () => {
        console.log("AddIceCandidateSuccess")
    }

    onAddIceCandidateError = (e) => {
        console.log(`Failed to add ICE candidate: ${e.toString()}`)
    }

    render() {
        // const {classes, user} = this.props//
        const {
            small
        } = this.props
        return ( <div>
            <video width = {
                small ? "92" : "460"
            }
            height = {
                small ? "60" : "300"
            }
            autoPlay playsInline ref = {
                video => {
                    this.remoteVideo = video
                }
            } > </video> {
                /* <audio
                                    autoPlay controls ref={
                                        audio => {
                                            this.remoteAudio = audio
                                        }
                                    }></audio> */
            } 
            </div>
        )
    }
}

export default withStyles(styles)(RemoteStream)