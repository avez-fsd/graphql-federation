import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import { readFileSync } from 'fs';

// const supergraphSdl = readFileSync('./supergraph.graphql').toString();


class DataSourceWithServerId extends RemoteGraphQLDataSource {
  async didReceiveResponse({ response, request, context }) {
    // Parse the Server-Id header and add it to the array on context
    const serverId = response.http.headers.get('Server-Id');
    if (serverId) {
      context.serverIds.push(serverId);
    }

    // Return the response, even when unchanged.
    return response;
  }
}
// Initialize an ApolloGateway instance and pass it
// the supergraph schema as a string
// highlight-start
const gateway = new ApolloGateway({
  supergraphSdl: readFileSync('./supergraph.graphql', { encoding: 'utf-8' }),
  buildService({ url }) {
    return new DataSourceWithServerId({ url });
  },
});
// highlight-end

// Pass the ApolloGateway to the ApolloServer constructor
// highlight-start
const server = new ApolloServer({
  gateway,
  plugins: [
    {
      requestDidStart() {
        return {
          async willSendResponse({ contextValue, response }) {
            // Append our final result to the outgoing response headers
            response.http.headers.set(
              'Server-Id',
              contextValue?.serverIds?.join(','),
            );
          },
        };
      },
    },
  ],
});
// highlight-end

// Note the top-level `await`!
const { url } = await startStandaloneServer(server,{
  listen: { port: 4001 },
  context() {
    return { serverIds: [] };
  },
});
console.log(`🚀  Server ready at ${url}`);

