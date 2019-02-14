import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import {signalingChannel as channel, connection as conn} from '../../interface/connection'

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

        conn.addListener("got_media", (e) => {
            if (!this.state.requesting) {
                this.requestOffer()
            } else {
                console.log(this.state.requesting);
                console.log(this.state)
            }
        })
        conn.addListener("offer", (e) => {
            console.log("received offer from", e.from)
            this.setRemoteDescriptionForPeerConn(e.offer)
        })
        conn.addListener("candidate", (e) => {
            if (e.stream_owner !== this.props.user) return
            if (!this.state.requesting) return
            if (e.candidate == null) return
            console.log("Remote adding ice from", e.from)
            setTimeout(() => this.peerConn.addIceCandidate(e.candidate), 1000)
        })

        // case "get_exist_peer_conn":
        // this.setState({ peerConn: event.exist_peer_conn })
        // break
        if (this.props.peerConn.includes(this.props.user)) {
            this.requestOffer()
        }
    }

    // componentWillUnmount() {
    //     this.props.ws.removeEventListener("message", this.wsEventListener)
    //     if (this.peerConn) {
    //         this.peerConn.close()
    //     }
    //     console.info(`closing remote stream: ${this.props.user}...`)
    // }

    requestOffer = () => {
        this.setState({
            requesting: true
        })
        // this.sendMessage({ type: "request_offer", stream_owner: this.props.user }) //TODO include self in json for opponent to reply        
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
        // const {classes, user} = this.props//
        const {
            small
        } = this.props
        return ( <div style={{position: 'relative'}}>
            <video 
                // poster="https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/P3IPDsA/loading-bar-scribble-animation-doodle-cartoon-4k_sdfqzybaux_thumbnail-full05.png"
                width = { small ? "100%" : "460" }
                height = { small ? "100%" : "300" }
                autoPlay playsInline ref = {
                    video => {
                        this.remoteVideo = video
                    }
            } > </video>
            </div>
        )
    }
}

export default withStyles(styles)(RemoteStream)