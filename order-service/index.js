import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';
import data from './data.json' assert { type: 'json' };
import { readFileSync } from 'fs';

const typeDefs = gql(readFileSync('./schema.graphql', 'utf-8'));

const fetchOrderById = (id)=> {
    return data.find(e => e.order_id == id)
}

const resolvers = {
  Query: {
    order(parent, args) {
      console.log('test ',fetchOrderById(args.id),args.id)
      return fetchOrderById(args.id);
    },
  },
  Order: {
    __resolveReference(order, {  }) {
      return fetchOrderById(order.id);
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4002 },
});
console.log(`🚀  Server ready at ${url}`);