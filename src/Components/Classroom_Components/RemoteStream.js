
import React from 'react'
import {
    withStyles
} from '@material-ui/core/styles'

const styles = theme => ({})

class RemoteStream extends React.Component {
    state = {
        requesting: false,
        turnReady: null,
        pcConfig: {
            'iceServers': [{
                'urls': 'stun:stun.l.google.com:19302'
            }]
        }
    }

    componentDidMount() {
        if (this.props.user === "Teacher") 
            return
        const { requesting } = this.state

        this.peerConn = new RTCPeerConnection(this.state.pcConfig)
        this.peerConn.ontrack = this.gotRemoteStream
        this.peerConn.onicecandidate = this.iceCallbackRemote
        console.log(`${this.props.user}: created remote peer connection object`)

        this.props.ws.addEventListener("message", e => {
            const event = JSON.parse(e.data)
            if (event.type === "join") {
                console.log('Received a request to join room from:') // + event.joiner_pid)
            }
            if (event.stream_owner === this.props.user) {
                console.log('Stream', this.props.user, 'received message:', event.type)
                switch (event.type) {
                    case "got user media":
                        if (!requesting) {
                            this.requestOffer()
                        }
                        break
                    case "offer":
                        this.setRemoteDescriptionForPeerConn(event)
                        break
                    case "candidate":
                        if (requesting) {
                            this.peerConn.addIceCandidate(event.candidate)
                        }
                        break
                    default:
                        console.log(`Not Controlledd:`)
                        console.log({...event})
                        break
                }
            }
        })

        if (this.props.peerConn.includes(this.props.user)) {
            this.requestOffer()
        }
        // this.requestTurn("https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913")
    }

    componentWillUnmount() {
        console.info(`closing remote stream: ${this.props.user}...`)
    }

    sendMessage(message) {
        console.log('Remote sending message: ', message)
        this.props.ws.send(JSON.stringify({ type: "stream_message", message }))
    }

    sendDirectMessage(message, to) {
        console.log(`Remote sending message to ${to}: `, message)
        message.to = to
        this.props.ws.send(JSON.stringify({ type: "class_direct_message", message }))
    }

    requestOffer = () => {
        this.setState({ requesting: true })
        this.sendMessage({ type: "request_offer", stream_owner: this.props.user }) //TODO include self in json for opponent to reply        
    }

    setRemoteDescriptionForPeerConn = (desc) => {
        const { peerConn } = this
        peerConn.setRemoteDescription(desc)
        peerConn.createAnswer()
            .then(this.gotDescriptionRemote, this.onCreateSessionDescriptionError)
            .then(this.setState({ peerConn }))
            .catch(this.setState({ peerConn }))
    }

    gotDescriptionRemote = (desc) => { // send answer to streamer
        this.peerConn.setLocalDescription(desc)
        const modDesc = { desc }
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
                console.log(`${this.props.user}'s pc: received remote stream`)
            }
        }
    }

    iceCallbackRemote = (event) => {
        this.peerConn.addIceCandidate(event.candidate)
            .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError)
        this.sendMessage({ type: "candidate", candidate: event.candidate, stream_owner: this.props.user })
        console.log(`${this.props.user}'s pc New ICE candidate: ${event.candidate ? event.candidate.candidate : "(null)"}`)
    }

    onAddIceCandidateSuccess = () => {
        console.log("AddIceCandidateSuccess")
    }

    onAddIceCandidateError = (e) => {
        console.log(`Failed to add ICE candidate: ${e.toString()}`)
    }

    render() {
        // const {classes, user} = this.props
        const {small} = this.props
        return (
            <div >
                <video
                    width={small? "92" : "460"}
                    height={small ? "60" : "300"}
                    autoPlay muted playsInline ref={
                        video => {
                            this.remoteVideo = video
                        }
                    } > </video>
            </div>
        )
    }
}

export default withStyles(styles)(RemoteStream)