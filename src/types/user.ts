import type { UserRole } from '../services/sessionService'

export type UserResponse = {
    id: string
    name: string
    email: string
    role: UserRole
    active: boolean
    deletionRequested: boolean
    deletionRequestedAt: string | null
    termsVersion: string
    termsAcceptedAt: string
    privacyVersion: string
    privacyAcceptedAt: string
    createdAt: string
    updatedAt: string | null
}
