import { gql } from 'apollo-server';

const typeDefs = gql`
    type User {
        _id: ID
        name: String
        email: String
        picture: String
    }
    
    type Query {
        me: User
    }
`;

export default typeDefs;
