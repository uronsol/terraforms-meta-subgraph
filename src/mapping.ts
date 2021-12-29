import {
  Daydreaming as DaydreamingEvent,
  Terraformed as TerraformedEvent,
  TokensRevealed as TokensRevealedEvent,
  Transfer as TransferEvent,
  Terraforms
} from "../generated/Terraforms/Terraforms"
import {
  Daydreaming,
  Terraformed,
  TokensRevealed,
  SupplementalData,
  Token,
  Terraformer
} from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleDaydreaming(event: DaydreamingEvent): void {
  let entity = new Daydreaming(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.save()
}


export function handleTerraformed(event: TerraformedEvent): void {
  let entity = new Terraformed(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.terraformer = event.params.terraformer
  entity.save()
}

export function handleTokensRevealed(event: TokensRevealedEvent): void {
  let entity = new TokensRevealed(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.timestamp = event.params.timestamp
  entity.seed = event.params.seed
  entity.save()

  let contract = Terraforms.bind(event.address)
  const totalSupply = parseInt(contract.totalSupply().toString())
  for (let i = 0; i + 1 < totalSupply; i++) {
    const contractToken = contract.tokenByIndex(BigInt.fromString(`${i}`))
    let token = Token.load(contractToken.toString())
    if (!token) {
      token = new Token(contractToken.toString())
      token.tokenID = contractToken
      token.createdAt = event.block.timestamp
      token.tokenURI = contract.tokenURI(contractToken)
    }
    token.supplementalData = contractToken.toString()

    let supplementalData = SupplementalData.load(contractToken.toString())
    if (!supplementalData) {
      const supplementalRes = contract.try_tokenSupplementalData(contractToken)
      if (supplementalRes.reverted) {
        return
      }
      const supplemental = supplementalRes.value
      supplementalData = new SupplementalData(contractToken.toString())
      supplementalData.tokenID = contractToken.toString()
      supplementalData.level = supplemental.level
      supplementalData.xCoordinate = supplemental.xCoordinate
      supplementalData.yCoordinate = supplemental.yCoordinate
      supplementalData.elevation = supplemental.elevation
      supplementalData.structureSpaceX = supplemental.structureSpaceX
      supplementalData.structureSpaceY = supplemental.structureSpaceY
      supplementalData.structureSpaceZ = supplemental.structureSpaceZ
      supplementalData.zoneName = supplemental.zoneName
      supplementalData.zoneColors = supplemental.zoneColors
      supplementalData.characterSet = supplemental.characterSet
      supplementalData.save()
    }
  }
}

export function handleTransfer(event: TransferEvent): void {
  let contract = Terraforms.bind(event.address)
  let token = Token.load(event.params.tokenId.toString())
  if (!token) {
    token = new Token(event.params.tokenId.toString())
    token.tokenID = event.params.tokenId
    token.createdAt = event.block.timestamp
    token.tokenURI = contract.tokenURI(event.params.tokenId)
  }

  token.supplementalData = event.params.tokenId.toString()
  token.terraformer = event.params.to.toHexString()
  token.save()

  let terraformer = Terraformer.load(event.params.to.toHexString())
  if (!terraformer) {
    terraformer = new Terraformer(event.params.to.toHexString())
    terraformer.save()
  }

  let supplementalData = SupplementalData.load(event.params.tokenId.toString())
  if (!supplementalData) {
    const supplementalRes = contract.try_tokenSupplementalData(event.params.tokenId)
    if (supplementalRes.reverted) {
      return
    }
    const supplemental = supplementalRes.value
    supplementalData = new SupplementalData(event.params.tokenId.toString())
    supplementalData.tokenID = event.params.tokenId.toString()
    supplementalData.level = supplemental.level
    supplementalData.xCoordinate = supplemental.xCoordinate
    supplementalData.yCoordinate = supplemental.yCoordinate
    supplementalData.elevation = supplemental.elevation
    supplementalData.structureSpaceX = supplemental.structureSpaceX
    supplementalData.structureSpaceY = supplemental.structureSpaceY
    supplementalData.structureSpaceZ = supplemental.structureSpaceZ
    supplementalData.zoneName = supplemental.zoneName
    supplementalData.zoneColors = supplemental.zoneColors
    supplementalData.characterSet = supplemental.characterSet
    supplementalData.save()
  }
}
