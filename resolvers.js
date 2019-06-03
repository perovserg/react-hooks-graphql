import { AuthenticationError, PubSub } from 'apollo-server';

import Pin from './models/Pin';

const pubsub = new PubSub();

const PIN_ADDED = 'PIN_ADDED';
const PIN_DELETED = 'PIN_DELETED';
const PIN_UPDATED = 'PIN_UPDATED';

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
            pubsub.publish(PIN_ADDED, { pinAdded });
            return pinAdded;
        }),
        deletePin: authenticated(async (root, args, ctx) => {
            const pineDeleted = await Pin.findOneAndDelete({ _id: args.pinId }).exec();
            pubsub.publish(PIN_DELETED, { pineDeleted });
            return pineDeleted;
        }),
        createComment: authenticated(async (root, args, ctx) => {
            const newComment = { text: args.text, author: ctx.currentUser._id };
            const updatedPin = await Pin.findOneAndUpdate(
                { _id: args.pinId }, // фильтр для поиска
                { $push: { comments: newComment } }, // как изменять
                { new: true } // вернуть новый объект
            ).populate('author').populate('comments.author');
            pubsub.publish(PIN_UPDATED, { updatedPin });
            return updatedPin;
        }),
    },
    Subscription: {
        pinAdded: {
            subscribe: () => pubsub.asyncIterator(PIN_ADDED)
        },
        pinDeleted: {
            subscribe: () => pubsub.asyncIterator(PIN_DELETED)
        },
        pinUpdated: {
            subscribe: () => pubsub.asyncIterator(PIN_UPDATED)
        },
    },
};

export default resolvers;
