import { parseNumber } from '../commons'

export class Dividend {
    type: string
    dividendsData: DividendData[]
    total: number

    public constructor(type: string, dividendsData: DividendData[]) {
        this.type = type
        this.dividendsData = dividendsData
        this.total = this.calculatesTotal(dividendsData)
    }

    private calculatesTotal(dividends: DividendData[]): number {
        return dividends.reduce((total, dividend) => {
            return total + parseNumber(dividend.netValue)
        }, 0)
    }
}

type DividendData = {
    company: string
    especification: string
    code: string
    paymentPrevision: string
    type: string
    quantity: string
    quotationFactor: string
    grossValue: string
    netValue: string
}
