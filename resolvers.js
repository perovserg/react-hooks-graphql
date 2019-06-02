import { AuthenticationError } from 'apollo-server';

import Pin from './models/Pin';

const authenticated = next => (root, args, ctx, info) => {

    if (!ctx.currentUser) throw new AuthenticationError('You must be logged in!');

    return next(root, args, ctx, info);
};

const resolvers = {
    Query: {
        me: authenticated((root, args, ctx) => ctx.currentUser),
        getPins: async (root, args, ctx) => {
            // .find({}) - вытаскиваем всю таблицу Pin т.к. без фильтра
            // .populate('author') - заполняем поле автор в каждом pin
            // .populate('comments.author') - заполняем автора у каждого комметрария в каждом pin
            const pins = await Pin.find({}).populate('author').populate('comments.author');
            return pins;
        }
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
        }),
        deletePin: authenticated(async (root, args, ctx) => {
            const pineDeleted = await Pin.findOneAndDelete({ _id: args.pinId }).exec();
            return pineDeleted;
        }),
    },
};

export default resolvers;
