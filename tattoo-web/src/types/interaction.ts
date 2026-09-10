export type InteractionType = 'like' | 'bookmark'
export type InteractionTargetType = 'gallery'

export interface Interaction {
  id: string
  customerId: string
  targetType: InteractionTargetType
  targetId: string
  type: InteractionType
  createdAt: string
  updatedAt: string
}

export interface InteractionListResponse {
  items: Interaction[]
  total: number
}

export interface InteractionCreateInput {
  targetType?: InteractionTargetType
  targetId: string
  type: InteractionType
}

export interface InteractionCreateResponse {
  interaction: Interaction
}

export interface InteractionListQuery {
  type?: InteractionType
  targetType?: InteractionTargetType
  targetId?: string
}

export type InteractionErrorCode =
  | 'AUTH_REQUIRED'
  | 'WRONG_TOKEN_TYPE'
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'SERVER'
  | 'UNKNOWN'
