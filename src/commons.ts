import { ElementHandle } from 'puppeteer'

export const normalizeHTMLText = (str: string) => {
    const pattern = /[\f\n\r\t\v ]{2,}/g
    const replacement = ' '

    return str.replace(pattern, replacement)
}

export const parseNumber = (value: string): number => {
    const replacedValue = value.replace(/\./g, '').replace(/,/g, '.')
    return Number(replacedValue)
}

export const extractTableContent = async (
    table: ElementHandle | null,
    fieldsNames: any
) => {
    if (!table) {
        return []
    }

    const headers: string[] = await table.$eval(
        'thead > tr',
        (tr: Element, fieldsNames: any) => {
            const headersElements = tr.children

            const headers: any[] = []
            for (const headerElement of Array.from(headersElements)) {
                const headerName = window.normalizeHTMLText(
                    headerElement.textContent || ''
                )
                headers.push(fieldsNames[headerName])
            }

            return headers
        },
        fieldsNames
    )

    const content = await table.$$eval(
        'tbody > tr',
        (lines: Element[], headers: string[]) => {
            const content: any[] = []
            lines.forEach(line => {
                const lineContent: any = {}

                Array.from(line.children).forEach((column, index) => {
                    const attrName = headers[index]
                    lineContent[attrName] = window.normalizeHTMLText(
                        column.textContent || ''
                    )
                })

                content.push(lineContent)
            })
            return content
        },
        headers
    )

    return content
}
