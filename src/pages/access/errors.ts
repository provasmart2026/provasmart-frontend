import {ApiError} from '../../api/client'

export const accessRequestError = 'Não foi possível concluir agora. Tente novamente em instantes.'

export function getAccountAccessError(error: unknown) {
    if (error instanceof ApiError && error.status === 409) return 'Já existe uma conta com este e-mail.'
    return accessRequestError
}

export function isRejectedVerificationCode(error: unknown) {
    return error instanceof ApiError && [400, 401, 403, 422].includes(error.status)
}
