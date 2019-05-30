const dammyUser = {
    _id: '1',
    name: 'Sergey',
    email: 'perovserg@mail.ru',
    picture: 'https://cloudinary.com/asdf'
};

const resolvers = {
    Query: {
        me: () => dammyUser
    }
};

export default resolvers;
