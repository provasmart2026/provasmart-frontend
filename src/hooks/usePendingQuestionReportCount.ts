import { useEffect, useState } from 'react'
import { questionReportService } from '../services/questionReportService'

export const questionReportStatusChangedEvent = 'provasmart:question-report-status-changed'

export function usePendingQuestionReportCount() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let active = true
        let latestRequest = 0

        async function refresh() {
            if (document.visibilityState === 'hidden') return
            const request = ++latestRequest

            try {
                const result = await questionReportService.countPending()
                if (active && request === latestRequest) setCount(result.count)
            } catch {
                // Keep the last known count and retry on the next refresh.
            }
        }

        void refresh()
        const interval = window.setInterval(refresh, 60_000)
        document.addEventListener('visibilitychange', refresh)
        window.addEventListener(questionReportStatusChangedEvent, refresh)

        return () => {
            active = false
            window.clearInterval(interval)
            document.removeEventListener('visibilitychange', refresh)
            window.removeEventListener(questionReportStatusChangedEvent, refresh)
        }
    }, [])

    return count
}
