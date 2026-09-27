const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function formatDate(value: string) {
    return dateFormatter.format(new Date(value))
}
