import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';


const loadingStyle = {
    position: 'absolute',
    top: '47%',
    left: '48%',
}

function CircularUnderLoad() {
  return <CircularProgress style={loadingStyle}/>;
}

export default CircularUnderLoad;