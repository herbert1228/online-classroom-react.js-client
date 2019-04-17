# online-classroom-react.js-client

Realistic and Interactive Online Classroom

 First stable version with the followings major features:

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
    - Drawer (File system)
        - Upload by selecting / dragging
        - View image with popup window component
        - Delete a file
        - Download a file
        - Share a file with teacher or students
        ![image](https://github.com/herbert1228/online-classroom-react.js-client/blob/master/src/css/whiteboard.png)
- Connection driver for communicating with an elixir backend hosted at AWS ec2 server
    - 3 protocols
        - simple call / cast (call is synchronous which returns the value, cast is asynchronous)
    - Websocket secure wss (major)
    - Https (upload/download file)
    - Also support: ws and http
    
Screenshot

![image](https://github.com/herbert1228/online-classroom-react.js-client/blob/master/src/css/classroom.png)
