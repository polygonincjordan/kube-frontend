export interface StorageLocation {
  d: D
}

export interface D {
  results: StorageLocationDetails[]
}

export interface StorageLocationDetails {
  __metadata: Metadata
  Bname: string
  Lgort: string
}

export interface Metadata {
  id: string
  uri: string
  type: string
}
