import { OAuth2Client } from 'google-auth-library';

import User from '../models/User';

const clientOAuth2 = new OAuth2Client(process.env.OAUTH_GOOGLE_API_CLIENT_ID);

export const findOrCreateUser = async token => {

    console.log('call => verifyAuthToken');
    // verify auth token
    const googleUser = await verifyAuthToken(token);

    console.log('call => checkIfUserExists');
    // check if the user exists
    const user = await checkIfUserExists(googleUser.email);

    console.log('call => createNewUser');
    // if user exists, return them; otherwise, create new user in db
    return user ? user : createNewUser(googleUser);
};

const verifyAuthToken = async token => {
  try {
    const ticket = await clientOAuth2.verifyIdToken({
        idToken: token,
        audience: process.env.OAUTH_GOOGLE_API_CLIENT_ID,
    });

    return ticket.getPayload();

  } catch (error) {
      console.error('Error verifying auth token'. error);
  }
};

const checkIfUserExists = async email => await User.findOne({ email }).exec();

const createNewUser = googleUser => {
    const { name, email, picture } = googleUser;
    const user = { name, email, picture };

    return new User(user).save();
};
