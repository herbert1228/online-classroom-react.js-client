import React from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { Typography } from '@material-ui/core';

class GroupStatus extends React.Component {
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
                <Typography>Groupmates: </Typography>
                {(this.props.group.members || []).map(member => 
                    <Typography>{member}</Typography>
                )}
            </div>
        }
      >

      <Button disabled={!this.props.group.group}>{this.props.group.group || "Group"}</Button>

      </Tooltip>
    )
  }
}

export default GroupStatus;