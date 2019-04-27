# Realistic and Interactive Online Classroom (Frontend)

Demo: [https://overcoded.tk](https://overcoded.tk "Realistic and Interactive Online Classroom")

Elixir backend Github repo: [https://github.com/herbert1228/online-classroom-elixir-server](https://github.com/herbert1228/online-classroom-elixir-server "Elixir backend")

## Update:

- Grouping
  - Teacher can assign students into groups
  - Students in the same group can edit a shared whiteboard (work together)
  
- Class Management
  - Teacher can control the webcam permission of students
    - enable/disable audio
    - enable/disable video

## First stable version with the followings major features:

- Create classroom session letting students to enroll and join.
- Enter a classroom as Teacher (owner of the classroom).
- Enter a classroom as Student (after enrolling with Teacher's username
  and classroom name).
- Desktop like classroom, components are draggable and some are
  resizable.
- Classroom components:
    - Webcam of teacher and all students
        - Peer to Peer connection
        - Mute, Stop, Re-call
        
    - Sync and Shared Whiteboard
        - Self-whiteboard is editable
        - Other whiteboards are view only
        - Sync instantly
        - Can view teacher's whiteboard as student Only
        - Can view all students' whiteaboard as Teacher
        - Edit with:
            - Add/remove/drag/resize/rotate: images and texts
            - Draw with Pen
        <img alt="shared whiteboard" src="https://github.com/herbert1228/online-classroom-react.js-client/blob/master/src/css/whiteboard-no-cut.png"  width="500">
             
    - Drawer (File system)
        - Upload by selecting / dragging
        - View image with popup window component
        - Delete a file
        - Download a file
        - Share a file with teacher or students
                
        
- Connection driver for communicating with an elixir backend hosted at AWS ec2 server
    - 3 protocols
        - simple call / cast (call is synchronous which returns the value, cast is asynchronous)
        - signaling server call / cast
        - whiteboard server call / cast
    - Websocket secure wss (major)
    - Https (upload/download file)
    - Also support: ws and http
    - STUN/TURN (hosted on our AWS ec2 server) config
    
## Screenshot

![screenshot](https://github.com/herbert1228/online-classroom-react.js-client/blob/master/src/css/classroom.png)
