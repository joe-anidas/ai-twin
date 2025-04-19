import { gql } from '@apollo/client';

export const GET_PUBLIC_MODELS = gql`
  query GetPublicModels {
    publicModels(
      first: 100
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      owner
      metadataURI
      blockTimestamp
    }
  }
`;