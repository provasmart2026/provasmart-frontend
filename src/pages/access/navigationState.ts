import { isValidEmail } from './validation'

export type TwoFactorState = {
    email: string
    remember: boolean
}

export function isTwoFactorState(state: unknown): state is TwoFactorState {
    return (
        typeof state === 'object' &&
        state !== null &&
        'email' in state &&
        typeof state.email === 'string' &&
        Boolean(state.email.trim()) &&
        'remember' in state &&
        typeof state.remember === 'boolean'
    )
}

export type RecoveryState = { email: string }

export function isRecoveryState(state: unknown): state is RecoveryState {
    return (
        typeof state === 'object' &&
        state !== null &&
        'email' in state &&
        typeof state.email === 'string' &&
        isValidEmail(state.email)
    )
}
