import { gql } from '@apollo/client';

export const GET_PUBLIC_MODELS = gql`
  query GetPublicModels {
    tokenEntities(where: { visibility: "Public" }) {
      id
      tokenId
      owner
      modelName
      role
      visibility
      timestamp
    }
  }
`;