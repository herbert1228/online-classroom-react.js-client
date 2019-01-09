import React from 'react'
// import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
// import {Card, CardHeader, Avatar, IconButton, Divider} from '@material-ui/core'

const styles = theme => ({})

class LocalStream extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isChannelReady: false,
            // isInitiator: false,
            isStarted: false,
            localStream: null,
            pc: null,
            remoteStream: null,
            turnReady: null,
            pcConfig: {
                'iceServers': [{
                    'urls': 'stun:stun.l.google.com:19302'
                }]
            }
        }
        this.gotStream = this.gotStream.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
        this.setLocalAndSendMessage = this.setLocalAndSendMessage.bind(this)
    }

    componentWillReceiveProps({camOpen}) {
        if (camOpen === false) {
            console.log("disable webcam", camOpen)
        }
    }

    componentDidMount() {
        const {isStarted} = this.state
        let sdpConstraints = { // Set up audio and video regardless of what devices are present.
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        }

        // this.props.ws.send(JSON.stringify({type: "start_stream"})) // create or join
        console.log(this.props.user, 'Attempting to start stream')

        this.props.ws.addEventListener("message", e => {
            const event = JSON.parse(e.data)
            if (event.type === "join") {
                console.log('Received a request to join room from:') // + event.joiner_pid)
                this.setState({isChannelReady: true})
                this.maybeStart()
            }
            if (event.stream_owner === this.props.user) {
                console.log('Stream', this.props.user, 'received message:', event.type)
                // const {stream_owner} = event
                switch (event.type) {
                    // case "created":
                    //     console.log('Created room ' + room)
                    //     isInitiator = true
                    //     break
                    // case "join": // other peers joined //moved upwards
                    //     console.log('Another peer made a request to join room ' + stream_owner)
                    //     console.log('This peer is the initiator of room ' + stream_owner + '!')
                    //     this.setState({isChannelReady: true})
                    //     break
                    // case "joined": //for remoteStream
                    //     console.log('joined: ' + stream_owner)
                    //     this.setState({isChannelReady: true})
                    //     break
                    case "got user media":
                        this.maybeStart()
                        break
                    // case "offer":
                    //     console.log("Error: Should stream owner receive 'offer' message?")
                    //     this.state.pc.setRemoteDescription(new RTCSessionDescription(event.message)) //rebuild the message of offer
                    //     this.doAnswer()
                    //     break
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

////////////////////////////////////////////////////

        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
        })
            .then(this.gotStream)
            .catch(function (e) {
                console.log('getUserMedia() error: ' + e.name, e)
            })

        if (window.location.hostname !== 'localhost') {
            this.requestTurn(
                'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
            )
        }

        // window.onbeforeunload = function() { // replace with componentWillUnmount // test will this works on leave(no longer visible)
        //     sendMessage('bye')
        // }
    }

    sendMessage(message) {
        console.log('Client sending message: ', message)
        this.props.ws.send(JSON.stringify({type: "stream_message", message}))
    }

    gotStream(stream) {
        console.log('Adding local stream.')
        this.setState({localStream: stream})
        this.localVideo.srcObject = stream
        this.sendMessage({type: 'got user media'})
        this.maybeStart()
    }

    maybeStart() {
        console.log('>>>>>>> maybeStart() ', this.state.isStarted, this.state.localStream, this.state.isChannelReady)
        if (!this.state.isStarted && this.state.localStream !== null && this.state.isChannelReady) {
            console.log('>>>>>> creating peer connection')
            this.createPeerConnection()
            this.state.pc.addStream(this.state.localStream)
            this.setState({isStarted: true})
            this.doCall()
        }
    }

    createPeerConnection() {
        try {
            this.setState({pc: new RTCPeerConnection(null)})
            this.pc = this.state.pc
            this.pc.onicecandidate = this.handleIceCandidate.bind(this)
            this.pc.onaddstream = this.handleRemoteStreamAdded.bind(this)
            this.pc.onremovestream = this.handleRemoteStreamRemoved.bind(this)
            console.log('Created RTCPeerConnnection')
        } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message)
            alert('Cannot create RTCPeerConnection object.')
        }
    }

    handleIceCandidate(event) {
        console.log('icecandidate event: ', event)
        if (event.candidate) {
            this.sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            })
        } else {
            console.log('End of candidates.')
        }
    }

    doCall() {
        console.log('Sending offer to peer')
        this.state.pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError)
    }

    // doAnswer() {
    //     console.log('Sending answer to peer.')
    //     this.state.pc.createAnswer().then(
    //         this.setLocalAndSendMessage,
    //         this.onCreateSessionDescriptionError
    //     )
    // }

    setLocalAndSendMessage(sessionDescription) {
        console.log(sessionDescription)
        this.state.pc.setLocalDescription(sessionDescription)
        console.log('setLocalAndSendMessage sending message', sessionDescription)
        this.sendMessage(sessionDescription)
    }

    handleCreateOfferError(event) {
        console.log('createOffer() error: ', event)
    }

    onCreateSessionDescriptionError(error) {
        console.trace('Failed to create session description: ' + error.toString())
    }

    requestTurn(turnURL) {
        let turnExists = false
        for (let i in this.state.pcConfig.iceServers) {
            if (this.state.pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
                turnExists = true
                this.setState({turnReady: true})
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
                    this.setState({turnReady: true})
                }
            }
            xhr.open('GET', turnURL, true)
            xhr.send()
        }
    }

    handleRemoteStreamAdded(event) {
        console.log('Error: local stream received "handleRemoteStreamAdded" from ice')
    }

    handleRemoteStreamRemoved(event) {
        console.log('Error: local stream received "handleRemoteStreamRemoved" from ice')
    }

    hangup() {
        console.log('Hanging up.')
        this.stop()
        this.sendMessage('bye')
    }

    handleRemoteHangup() {
        console.log('Session terminated.')
        this.stop()
        // isInitiator = false
    }

    stop() {
        this.setState({isStarted: false})
        this.state.pc.close()
        this.setState({pc: null})
    }

    render() {
        // const {classes, user} = this.props

        return (
            <div>
                <video width="460" height="300" autoPlay muted playsInline ref={video => {
                    this.localVideo = video
                }}></video>
            </div>
        )
    }
}

export default withStyles(styles)(LocalStream)