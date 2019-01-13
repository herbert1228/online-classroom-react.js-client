import React from 'react';
// import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
// import {Card, CardHeader, Avatar, IconButton, Divider} from '@material-ui/core'

const styles = theme => ({

})

class RemoteStream extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChannelReady: false,
            // isInitiator: false,
            isStarted: false,
            remoteStream: null,
            pc: null,
            turnReady: null,
            pcConfig: {
                'iceServers': [{
                    'urls': 'stun:stun.l.google.com:19302'
                }]
            }
        }
        this.sendMessage = this.sendMessage.bind(this)
        this.setLocalAndSendMessage = this.setLocalAndSendMessage.bind(this)
    }

    componentWillReceiveProps({camOpen}) {
        if (camOpen === false) {
            console.log("disable webcam", camOpen)
        }
    }

    componentWillMount() {
        try {
            this.setState({pc: new RTCPeerConnection(null)}, () => {
                this.pc = this.state.pc
                this.pc.onicecandidate = this.handleIceCandidate;
                this.pc.onaddstream = this.handleRemoteStreamAdded;
                this.pc.onremovestream = this.handleRemoteStreamRemoved;
                console.log('Created RTCPeerConnnection');
            })
        } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
        }
    }

    componentDidMount() {
        const {isStarted, pc} = this.state
        const {self, user} = this.props
        let sdpConstraints = { // Set up audio and video regardless of what devices are present.
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        };

        // this.props.ws.send(JSON.stringify({type: "create or join"}))
        console.log(self, 'Attempting to join stream of', user)

        this.props.ws.addEventListener("message", e => {
            const event = JSON.parse(e.data)
            if (event.stream_owner === user) {
                console.log('Stream received message:', event.type)
                const {stream_owner} = event
                switch (event.type) {
                    // case "created": // TODO remove after ensured this msg is not possible to receive
                    //     console.log("Error: remote stream received 'created' message!")
                    //     break
                    // case "join": //for localStream
                    //     console.log('Another peer made a request to join room ' + stream_owner)
                    //     console.log('This peer is the initiator of room ' + stream_owner + '!')
                    //     this.setState({isChannelReady: true})
                    //     break
                    case "joined":
                        console.log('remote stream joined: ' + stream_owner);
                        this.setState({isChannelReady: true})
                        break
                    case "got user media":
                        this.maybeStart()
                        break
                    case "offer":
                        if (!isStarted) {
                            this.maybeStart()
                            pc.setRemoteDescription(new RTCSessionDescription(event)) //rebuild the message of offer
                            this.doAnswer()
                        }
                        break
                    case "answer":
                        if (isStarted) {
                            pc.setRemoteDescription(new RTCSessionDescription(event)) //rebuild the message of answer
                        }
                        break
                    case "candidate":
                        if (isStarted) {
                            let candidate = new RTCIceCandidate({
                                sdpMLineIndex: event.label,
                                candidate: event.candidate
                            })
                            pc.addIceCandidate(candidate)
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

        if (window.location.hostname !== 'localhost') {
            this.requestTurn(
                'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
            )
        }

        // window.onbeforeunload = function() { // replace with componentWillUnmount // test will this works on leave(no longer visible)
        //     sendMessage('bye');
        // };
    }

    sendMessage(message) {
        console.log('Client sending message: ', message);
        this.props.ws.send(JSON.stringify({type: "stream_message", message}));
    }

    maybeStart() {
        console.log('>>>>>>> maybeStart() of owner: ', this.props.user, this.state.isStarted, this.state.isChannelReady);
        if (!this.state.isStarted && this.state.isChannelReady) {
            console.log('>>>>>> creating peer connection');
            this.setState({isStarted: true})
        }
    }

    handleIceCandidate(event) {
        console.log('icecandidate event: ', event);
        if (event.candidate) {
            this.sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log('End of candidates.');
        }
    }

    handleCreateOfferError(event) {
        console.log('createOffer() error: ', event);
    }

    doCall() {
        console.log('Sending offer to peer');
        this.state.pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError);
    }

    doAnswer() {
        console.log('Sending answer to peer.');
        this.state.pc.createAnswer().then(
            this.setLocalAndSendMessage,
            this.onCreateSessionDescriptionError
        );
    }

    setLocalAndSendMessage(sessionDescription) {
        this.state.pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        this.sendMessage(sessionDescription);
    }

    onCreateSessionDescriptionError(error) {
        console.trace('Failed to create session description: ' + error.toString());
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
            xhr.onreadystatechange = function() {
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
        console.log('Remote stream added.');
        this.setState({remoteStream: event.stream})
        this.remoteVideo.srcObject = this.state.remoteStream;
    }

    handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
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
        // const {classes, user} = this.props;

        return (
            <div>
                <video width="460" height="300" autoPlay muted playsInline ref={video => {this.remoteVideo = video}}></video>
            </div>
        )
    }
}

export default withStyles(styles)(RemoteStream);