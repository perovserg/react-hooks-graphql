// тут используем useState хук

import React, { useState, useEffect, useContext } from "react";
import ReactMapGL, { NavigationControl, Marker, Popup } from 'react-map-gl';
import differenceInMinutes from "date-fns/difference_in_minutes";
import { Subscription } from "react-apollo";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

// сторонний хук из библиотеки
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";

import PinIcon from './PinIcon';
import Blog from './Blog';

import { useClient } from "../clientGraphQL";
import { GET_PINS_QUERY } from "../graphql/queries";
import { DELETE_PIN_MUTATION } from "../graphql/mutations";
import { PIN_ADDED_SUBSCRIPTION, PIN_UPDATED_SUBSCRIPTION, PIN_DELETED_SUBSCRIPTION } from "../graphql/subscriptions";
import Context from '../context';

import config from '../config';

const initialViewport = {
  latitude: 37.7577,
  longitude: -122.4376,
  zoom: 13,
};

const Map = ({ classes }) => {

  // hook returns true when condition is true
  const mobileSize = useMediaQuery('(max-width: 650px)');

  const clientGraphQL = useClient();

  const { state, dispatch } = useContext(Context);

  useEffect(() => { getPins(); }, []);

  const [viewport, setViewport] = useState(initialViewport);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => { getUserPosition(); }, []);

  const [popup, setPopup] = useState(null);
  // remove popup if pin itself is deleted by the author of pin
  useEffect(() => {
      const pinExist = popup && state.pins.findIndex(pin => pin._id === popup._id) > -1;

      if (!pinExist) setPopup(null);

  }, [state.pins.length]);
  // будет вызываться при изменении [state.pins.length]
  // если этот массив пустой сраблтает только при componentDidMount

  const getUserPosition = () => {

    // норм проверка свойства объекта
    if ('geolocation' in navigator) {

      navigator.geolocation.getCurrentPosition(
          position => {

            console.log('callback => navigator.geolocation.getCurrentPosition', position);
            const {latitude, longitude} = position.coords;
            setViewport({...viewport, latitude, longitude});
            setUserPosition({latitude, longitude});

          },
          error => console.error('Error => navigator.geolocation.getCurrentPosition', error),
          {enableHighAccuracy: true}
      );
    }
  };

  const getPins = async () => {
    const { getPins } =  await clientGraphQL.request(GET_PINS_QUERY);
    dispatch({ type: 'GET_PING', payload: getPins});
  };

  const handleMapClick = (event) => {
    const { lngLat, leftButton } = event;

    if (!leftButton) return;

    if (!state.draft) {
      dispatch({ type: 'CREATE_DRAFT' });
    }

    const [longitude, latitude] =lngLat;

    dispatch({
      type: 'UPDATE_DRAFT_LOCATION',
      payload: { longitude, latitude },
    });

  };

  const highlightNewPin = (pin) => {
    const isNewPin = differenceInMinutes(Date.now(), Number(pin.createdAt)) <= 30;
    return isNewPin ? 'limegreen' : 'darkblue';
  };

  const handleClickOnMarker = (pin) => {
    setPopup(pin);
    dispatch({ type: 'SET_PIN', payload: pin})
  };

  const isAuthorUser = () => state.currentUser._id === popup.author._id;

  const handleDeletePin = async (pin) => {
      const variables = { pinId: pin._id };
      await clientGraphQL.request(DELETE_PIN_MUTATION, variables);
      setPopup(null);
  };

  return (
      <div className={mobileSize ? classes.rootMobile : classes.root}>
        <ReactMapGL
          scrollZoom={!mobileSize}
          onClick={handleMapClick}
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

          {/*Pin for User's Current Position*/}

          {userPosition && (
            <Marker
                latitude={userPosition.latitude}
                longitude={userPosition.longitude}
                offsetLeft={-19}
                offsetTop={-37}
            >
              <PinIcon size={40} color="red" />
            </Marker>
          )}

          {/*Draft Pin*/}

          {state.draft && (
              <Marker
                  latitude={state.draft.latitude}
                  longitude={state.draft.longitude}
                  offsetLeft={-19}
                  offsetTop={-37}
              >
                <PinIcon size={40} color="hotpink" />
              </Marker>
          )}

          {/* Display here Created Pins*/}
          {state.pins.map(pin => (
              <Marker
                  key={pin._id}
                  latitude={pin.latitude}
                  longitude={pin.longitude}
                  offsetLeft={-19}
                  offsetTop={-37}
              >
                <PinIcon
                    size={40}
                    color={highlightNewPin(pin)}
                    onClick={() => handleClickOnMarker(pin)}
                />
              </Marker>
          ))}

          {/*Popup Dialog for Created Pins*/}
          {popup && (
              <Popup
                anchor='top'
                latitude={popup.latitude}
                longitude={popup.longitude}
                closeOnClick={false}
                onClose={() => setPopup(null)}
              >
                <img
                    className={classes.popupImage}
                    src={popup.image}
                    alt={popup.title}
                />
                <div className={classes.popupTab}>
                  <Typography>
                    {popup.latitude.toFixed(6)}, {popup.longitude.toFixed(6)}
                  </Typography>
                  {isAuthorUser() && (
                    <Button onClick={() => handleDeletePin(popup)}>
                      <DeleteIcon className={classes.deleteIcon}/>
                    </Button>
                  )}
                </div>
              </Popup>
          )}

        </ReactMapGL>

        {/*Subscriptions for Creating / Updating / Deleting Pins */}
        <Subscription
            subscription={PIN_ADDED_SUBSCRIPTION}
            onSubscriptionData={({ subscriptionData }) => {
              const { pinAdded } = subscriptionData.data;
              console.log({ pinAdded });
              dispatch({ type: 'CREATE_PIN', payload: pinAdded });
            }}
        />
        <Subscription
            subscription={PIN_UPDATED_SUBSCRIPTION}
            onSubscriptionData={({ subscriptionData }) => {
              const { pinUpdated } = subscriptionData.data;
              console.log({ pinUpdated });
              dispatch({ type: 'CREATE_COMMENT', payload: pinUpdated });
            }}
        />
        <Subscription
            subscription={PIN_DELETED_SUBSCRIPTION}
            onSubscriptionData={({ subscriptionData }) => {
              const { pinDeleted } = subscriptionData.data;
              console.log({ pinDeleted });
              dispatch({ type: 'DELETE_PIN', payload: pinDeleted });
            }}
        />


        {/*Blog Area to add Pin Content*/}

        <Blog/>

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
