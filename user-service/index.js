import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';
import data from './data.json' assert { type: 'json' };

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

    type Query {
        me: User
        user(id: ID!): User
    }

    type User @key(fields: "id") {
        id: ID!
        firstName: String
        lastName: String
        email: String
        age: Int
        isActive: Boolean
    }
`;

const fetchUserById = (id)=> {
    return data.find(e => e.id == id)
}

const resolvers = {
  Query: {
    me() {
      return data[0];
    },
    user(parent, args) {
      return fetchUserById(args.id);
    },
  },
  User: {
    __resolveReference(user, { }) {
      return fetchUserById(user.id);
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

const { url } = await startStandaloneServer(server,{
  listen: { port: 4000 },
});
console.log(`🚀  Server ready at ${url}`);