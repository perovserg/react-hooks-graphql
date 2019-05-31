import { useState, useEffect } from 'react';
import { GraphQLClient } from "graphql-request";

import config from './config';

export const BASE_URL = process.env.NODE_ENV === 'production'
    ? '<insert-production-url>'
    : config.BACKEND_GRAPHQL_URL;

export const useClient = () => {
    const [idToken, setIdToken] = useState('');

    useEffect(() => {
        // получаем токен из апи гугла
        const idToken = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;

        setIdToken(idToken);

    }, []);

    return new GraphQLClient(BASE_URL, {
        headers: { authorization: idToken}
    });
};
