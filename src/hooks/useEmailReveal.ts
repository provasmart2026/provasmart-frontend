import { useEffect, useRef, useState } from 'react'

export type EmailAccess =
    | { id: string; status: 'loading' | 'error' }
    | { id: string; status: 'visible'; email: string }

export function useEmailReveal(fetchEmail: (id: string) => Promise<{ email: string }>) {
    const [emailAccess, setEmailAccess] = useState<EmailAccess | null>(null)
    const latestRequest = useRef(0)

    useEffect(
        () => () => {
            latestRequest.current++
        },
        []
    )

    function hideEmail() {
        latestRequest.current++
        setEmailAccess(null)
    }

    async function revealEmail(id: string) {
        const request = ++latestRequest.current
        setEmailAccess({ id, status: 'loading' })
        try {
            const { email } = await fetchEmail(id)
            if (request === latestRequest.current) setEmailAccess({ id, status: 'visible', email })
        } catch {
            if (request === latestRequest.current) setEmailAccess({ id, status: 'error' })
        }
    }

    return { emailAccess, hideEmail, revealEmail }
}
