import {ApolloServer} from 'apollo-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import typeDefs from './typeDefs';
import resolvers from './resolvers';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => console.log('DB connected!'))
    .catch((err) => console.error(`DB connection failure: ${err}`));

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => console.log(`Server listening on ${url}`));
