import { Dividend } from './Dividend'

export class Dividends {
    accountAgent: string
    account: string
    dividends: Dividend[]

    public constructor(
        accountAgent: string,
        account: string,
        dividends: any[]
    ) {
        this.accountAgent = accountAgent
        this.account = account
        this.dividends = dividends.map(
            dividend => new Dividend(dividend.type, dividend.dividendsData)
        )
    }
}
