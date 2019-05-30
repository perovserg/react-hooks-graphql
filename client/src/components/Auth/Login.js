import React from 'react';
import { GoogleLogin } from 'react-google-login';
import { withStyles } from '@material-ui/core/styles';
// import Typography from "@material-ui/core/Typography";

import config from '../../config';

const Login = ({ classes }) => {
  console.log('CLIENT_ID', config.OAUTH_GOOGLE_API_CLIENT_ID);
  return <GoogleLogin
      onSuccess={() => console.log('success!')}
      onFailure={() => console.error('Google login error!')}
      clientId={config.OAUTH_GOOGLE_API_CLIENT_ID}/>
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
