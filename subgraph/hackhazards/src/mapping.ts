// src/mapping.ts
import { PublicModel } from "../generated/schema"
import { CloneMinted } from "../generated/CloneNFT/CloneNFT"
import { json, ipfs, Bytes } from "@graphprotocol/graph-ts"

export function handleCloneMinted(event: CloneMinted): void {
  // Create new PublicModel entity
  let publicModel = new PublicModel(event.params.tokenId.toString())
  
  // Set basic properties
  publicModel.owner = event.params.owner
  publicModel.metadataURI = event.params.metadataURI
  publicModel.blockTimestamp = event.block.timestamp

  // Load and parse metadata from IPFS
  let metadataURI = event.params.metadataURI.replace("ipfs://", "")
  let metadataBytes = ipfs.cat(metadataURI)
  
  if (metadataBytes) {
    let metadataJson = json.fromBytes(metadataBytes as Bytes)
    let metadata = metadataJson.toObject()
    
    if (metadata) {
      publicModel.modelName = metadata.get("modelName")!.toString()
      publicModel.role = metadata.get("role")!.toString()
      publicModel.visibility = metadata.get("visibility")!.toString()
      publicModel.timestamp = metadata.get("timestamp")!.toString()
    }
  }

  // Save only if visibility is Public
  if (publicModel.visibility == "Public") {
    publicModel.save()
  }
}