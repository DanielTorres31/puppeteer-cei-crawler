import { parseNumber } from '../commons'

export class Wallet {
    accountAgent: string
    account: string
    stocks: Stock[]
    total: number

    public constructor(accountAgent: string, account: string, stocks: Stock[]) {
        this.accountAgent = accountAgent
        this.account = account
        this.stocks = stocks
        this.total = this.calculatesTotal(stocks)
    }

    private calculatesTotal(dividends: Stock[]): number {
        return dividends.reduce((total, dividend) => {
            return total + parseNumber(dividend.total)
        }, 0)
    }
}

export type Stock = {
    company: string
    type: string
    code: string
    isin: string
    price: string
    quantity: string
    quotationFactor: string
    total: string
}
