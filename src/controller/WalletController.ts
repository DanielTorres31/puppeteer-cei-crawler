import { Page } from 'puppeteer'
import { extractTableContent, parseNumber } from '../commons'
import { Wallet, Stock } from '../entities/Wallet'

declare global {
    interface Window {
        normalizeHTMLText: (str: string) => string
    }
}

class WalletController {
    private static _config = {
        URL:
            'https://cei.b3.com.br/CEI_Responsivo/ConsultarCarteiraAtivos.aspx',
        querySelectors: {
            submitQueryButton: 'input#ctl00_ContentPlaceHolder1_btnConsultar',
            accountAgent:
                'span#ctl00_ContentPlaceHolder1_rptAgenteContaMercado_ctl00_lblAgenteContas',
            account:
                'span#ctl00_ContentPlaceHolder1_rptAgenteContaMercado_ctl00_rptContaMercado_ctl00_lblContaPosicao',
            walletTable:
                'table#ctl00_ContentPlaceHolder1_rptAgenteContaMercado_ctl00_rptContaMercado_ctl00_rprCarteira_ctl00_grdCarteira',
        },
        fieldsMap: {
            Empresa: 'company',
            Tipo: 'type',
            'Cód. de Negociação': 'code',
            'Cod.ISIN': 'isin',
            'Preço (R$)*': 'price',
            'Qtde.': 'quantity',
            'Fator Cotação': 'quotationFactor',
            'Valor (R$)': 'total',
        },
    }

    public static async getWallet(page: Page): Promise<Wallet> {
        console.log('Navigating to wallet page...')
        await page.goto(this._config.URL)

        page.on('console', args => console.log(args.text()))

        await page.evaluate(() => {
            window.normalizeHTMLText = (str: string) => {
                const pattern = /[\f\n\r\t\v ]{2,}/g
                const replacement = ' '

                return str.replace(pattern, replacement).trim()
            }
        })

        await page.click(this._config.querySelectors.submitQueryButton)
        console.log('Fetching wallet data...')
        await page.waitForSelector(this._config.querySelectors.walletTable)

        console.log('Extracting wallet information...')
        const [accountAgent, account, stocks] = await Promise.all([
            this._getAccountAgent(page),
            this._getAccount(page),
            this._getStocks(page, this._config.fieldsMap),
        ])

        return new Wallet(accountAgent, account, stocks)
    }

    private static async _getAccountAgent(page: Page) {
        return await page.$eval(
            this._config.querySelectors.accountAgent,
            (element: Element) =>
                window.normalizeHTMLText(element.textContent || '')
        )
    }

    private static async _getAccount(page: Page) {
        return await page.$eval(
            this._config.querySelectors.account,
            (element: Element) =>
                window.normalizeHTMLText(element.textContent || '')
        )
    }

    private static async _getStocks(
        page: Page,
        fieldsNames: any
    ): Promise<Stock[]> {
        const table = await page.$(this._config.querySelectors.walletTable)
        return extractTableContent(table, fieldsNames) as Promise<Stock[]>
    }
}

export default WalletController
