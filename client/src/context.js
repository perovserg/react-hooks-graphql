import { createContext } from 'react';

const appContext = createContext({
    currentUser: null,
    isAuth: false,
    draft: null,
    pins: [],
});

export default appContext;
