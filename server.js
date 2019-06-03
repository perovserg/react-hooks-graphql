import {ApolloServer} from 'apollo-server';
import mongoose from 'mongoose';
import 'dotenv/config';

import typeDefs from './typeDefs';
import resolvers from './resolvers';

import { findOrCreateUser } from './controllers/userController';


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => console.log('DB connected!'))
    .catch((err) => console.error(`DB connection failure: ${err}`));

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        let authToken = null;
        let currentUser = null;
        try{
            authToken = req.headers.authorization;
            if (authToken) {
                currentUser = await findOrCreateUser(authToken);
            }
        } catch (e) {
            console.error(`Unable to authenticate user with token: ${authToken}`);
        }
        return { currentUser };
    },
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => console.log(`Server listening on ${url}`));
