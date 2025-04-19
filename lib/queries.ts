// lib/queries.ts
import { gql } from '@apollo/client';
import { Address } from "viem";


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


//for ContractContext.tsx
export type CloneData = {
  tokenId: bigint;
  metadata: string;
  createdAt: number;
};

type GetClonesQuery = {
  publicModels: {
    id: string;
    metadataURI: string;
    blockTimestamp: string;
  }[];
};

type SubgraphBlockQuery = {
  _meta: {
    block: {
      number: number;
    };
  };
};

const SUBGRAPH_URL =process.env.NEXT_PUBLIC_SUBGRAPH_URL || "https://api.studio.thegraph.com/query/109144/hackhazards/v0.0.3";

async function fetchFromSubgraph<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data as T;
}

export const getOwnedClones = async (owner: Address): Promise<CloneData[]> => {
  const data = await fetchFromSubgraph<GetClonesQuery>(`
    query GetClones($owner: Bytes!) {
      publicModels(where: { owner: $owner }) {
        id
        metadataURI
        blockTimestamp
      }
    }
  `, { owner: owner.toLowerCase() });

  return data.publicModels.map(nft => ({
    tokenId: BigInt(nft.id),
    metadata: nft.metadataURI,
    createdAt: Number(nft.blockTimestamp)
  }));
};

export const getSubgraphBlock = async (): Promise<number> => {
  const data = await fetchFromSubgraph<SubgraphBlockQuery>(`
    query GetSubgraphBlock {
      _meta { block { number } }
    }
  `);
  return data._meta.block.number;
};

//for CreateAITwinForm.tsx
export const getExistingModelNames = async (): Promise<string[]> => {
  try {
    const data = await fetchFromSubgraph<{ publicModels: { metadataURI: string }[] }>(`
      query GetAllModels {
        publicModels {
          metadataURI
        }
      }
    `);

    const names = await Promise.all(
      data.publicModels.map(async ({ metadataURI }) => {
        try {
          const response = await fetch(metadataURI);
          const metadata = await response.json();
          return metadata.modelName?.toLowerCase().trim();
        } catch (err) {
          console.error("Failed to fetch metadata:", err);
          return null;
        }
      })
    );

    return Array.from(new Set(names.filter(Boolean))) as string[];
  } catch (err) {
    console.error("Failed to fetch existing models:", err);
    return [];
  }
};