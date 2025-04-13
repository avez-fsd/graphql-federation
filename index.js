import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
// import { readFileSync } from 'fs';

// const supergraphSdl = readFileSync('./supergraph.graphql').toString();

// Initialize an ApolloGateway instance and pass it
// the supergraph schema as a string
// highlight-start
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://localhost:4000' },
      { name: 'orders', url: 'http://localhost:4002' },
      // ...additional subgraphs...
    ],
  }),
});
// highlight-end

// Pass the ApolloGateway to the ApolloServer constructor
// highlight-start
const server = new ApolloServer({
  gateway,
});
// highlight-end

// Note the top-level `await`!
const { url } = await startStandaloneServer(server,{
  listen: { port: 4001 },
});
console.log(`🚀  Server ready at ${url}`);

