// тут используем useState хук

import React, { useState } from "react";
import ReactMapGL, { NavigationControl } from 'react-map-gl';
import { withStyles } from "@material-ui/core/styles";
// import Button from "@material-ui/core/Button";
// import Typography from "@material-ui/core/Typography";
// import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

import config from '../config';

const initialViewport = {
  latitude: 37.7577,
  longitude: -122.4376,
  zoom: 13,
};

const Map = ({ classes }) => {

  const [viewport, setViewport] = useState(initialViewport);

  return (
      <div className={classes.root}>
        <ReactMapGL
          width="100vw"
          height="calc(100vh - 64px)"
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxApiAccessToken={config.MAPBOX_API_KEY}
          onViewportChange={newViewport => setViewport(newViewport)}
          {...viewport}
        >
          {/*Navigation Control*/}
          <div className={classes.navigationControl}>
            <NavigationControl
                onViewportChange={newViewport => setViewport(newViewport)}
            />
          </div>
        </ReactMapGL>
      </div>
  );
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
