
export interface FeeList {
  d: D
}

export interface D {
  results: FeeListDetails[]
}

export interface FeeListDetails {
  __metadata: Metadata
  Einri: string
  Nursing: boolean
  Tarif: string
  Falnr: string
  Ktxt1: string
  Price: string
  Talst: string
  Searchstring: string
  Unit: string
  Favourite: boolean
}

export interface Metadata {
  id: string
  uri: string
  type: string
}


export interface FeeServiceFilterObject {
  Einri: string
  Falnr: string
  Search: string
  Patnr: string
  Lfdnr: string,
  Nav: string
}


