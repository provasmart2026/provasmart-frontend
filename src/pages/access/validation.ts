const passwordRule = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const verificationCodePattern = '[0-9]{6}'
const verificationCodeRule = new RegExp('^' + verificationCodePattern + '$')

export function isValidPassword(password: string) {
    return passwordRule.test(password)
}

export function isValidEmail(email: string) {
    return emailRule.test(email)
}

export function isValidVerificationCode(code: string) {
    return verificationCodeRule.test(code)
}
