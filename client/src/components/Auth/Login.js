import React, { useContext } from 'react';
import { GraphQLClient } from 'graphql-request';
import { GoogleLogin } from 'react-google-login';
import { withStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";

import config from '../../config';

import Context from '../../context';
import { ME_QUERY } from "../../graphql/queries";

import { BASE_URL } from "../../clientGraphQL";


const Login = ({ classes }) => {

  const { dispatch } = useContext(Context);

  const onSuccess = async googleUser => {

    try {

      // receive google token id for check it on our backend
      const idToken = googleUser.getAuthResponse().id_token;

      // тут новый клиент потому что хук useClient нужно вызывать в начале компонента Login, а там еще нет idToken
      const clientGraphQL = new GraphQLClient(BASE_URL, {
        headers: { authorization: idToken }
      });

      const { me } = await clientGraphQL.request(ME_QUERY);

      dispatch({
        type: 'LOGIN_USER', //todo: replace to constant
        payload: me,
      });

      dispatch({ type: 'IS_LOGGED_IN', payload: googleUser.isSignedIn() });

    } catch (error) {
      onFailure(error);
    }

  };

  const onFailure = error => {
    console.error('Error logging in', error);
  };

  return (
      <div className={classes.root}>
        <Typography
            component="h1"
            variant="h3"
            gutterBottom
            noWrap
            style={{ color: "rgb(66, 133, 244)" }}
        >
          Welcome
        </Typography>
        <GoogleLogin
            onSuccess={onSuccess}
            onFailure={onFailure}
            clientId={config.OAUTH_GOOGLE_API_CLIENT_ID}
            isSignedIn={true}
            buttonText="Login with Google!"
            theme="dark"
        />
      </div>
  );
};

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
