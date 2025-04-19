import { gql } from '@apollo/client';

export const GET_PUBLIC_MODELS = gql`
  query GetPublicModels {
    tokens(where: { visibility: "Public" }) {
      tokenId
      owner
      modelName
      role
      visibility
      timestamp
    }
  }
`;