import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';


const loadingStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)'
}

function CircularUnderLoad() {
  return <CircularProgress disableShrink style={loadingStyle}/>;
}

export default CircularUnderLoad;