import React from 'react';
import { GraphQLClient } from 'graphql-request';
import { GoogleLogin } from 'react-google-login';
import { withStyles } from '@material-ui/core/styles';
// import Typography from "@material-ui/core/Typography";

import config from '../../config';

const ME_QUERY = `
{
  me {
    _id
    name
    email
    picture
  }
}
`;

const Login = ({ classes }) => {

  const onSuccess = async googleUser => {

    // receive google token id for check it on our backend
    const idToken = googleUser.getAuthResponse().id_token;

    const clientGraphQL = new GraphQLClient(config.BACKEND_GRAPHQL_URL, {
      headers: { authorization: idToken }
    });

    const data = await clientGraphQL.request(ME_QUERY);

    console.log('ME_QUERY response => ', data);

  };

  return (
      <GoogleLogin
        onSuccess={onSuccess}
        onFailure={() => console.error('Google login error!')}
        clientId={config.OAUTH_GOOGLE_API_CLIENT_ID}
        isSignedIn={true}
      />
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
