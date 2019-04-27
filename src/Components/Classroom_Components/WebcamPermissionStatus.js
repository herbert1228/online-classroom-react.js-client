
import React from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { Typography } from '@material-ui/core';

class WebcamPermissionStatus extends React.Component {
  state = {
    open: false,
  };

  handleTooltipClose = () => {
    this.setState({ open: false });
  };

  handleTooltipOpen = () => {
    this.setState({ open: true });
  };

  render() {
    return (
      <Tooltip
        onClose={this.handleTooltipClose}
        onOpen={this.handleTooltipOpen}
        open={this.state.open}
        title={
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Typography>Webcam</Typography>
                <Typography>Video: {this.props.webcamPermission.video? 'Yes' : 'No'}</Typography>
                <Typography>Audio: {this.props.webcamPermission.audio? 'Yes' : 'No'}</Typography>
            </div>
        }
      >

      <Typography>Permission</Typography>

      </Tooltip>
    )
  }
}

export default WebcamPermissionStatus;