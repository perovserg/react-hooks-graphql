import { AuthenticationError } from 'apollo-server';

import Pin from './models/Pin';

const authenticated = next => (root, args, ctx, info) => {

    if (!ctx.currentUser) throw new AuthenticationError('You must be logged in!');

    return next(root, args, ctx, info);
};

const resolvers = {
    Query: {
        me: authenticated((root, args, ctx) => ctx.currentUser),
    },
    Mutation: {
        // оборачиваем функцией authenticated() что бы был доступен currentUser внутри анонимной функции.
        createPin: authenticated(async (root, args, ctx) => {
            const newPin = await new Pin({
                ...args.input,
                author: ctx.currentUser._id
            }).save();
            const pinAdded = await Pin.populate(newPin, 'author');
            return pinAdded;
        })
    },
};

export default resolvers;
