import { ElementHandle, Page } from 'puppeteer'
import { extractTableContent } from '../commons'
import { Dividends } from '../entities/Dividends'

declare global {
    interface Window {
        normalizeHTMLText: (str: string) => string
    }
}

type DividendsData = {
    tableType: string
    table: ElementHandle<Element> | null
}

type DividendsTable = {
    type: string
    dividendsData: any[]
}

class DividendsController {
    private static _config = {
        URL: 'https://cei.b3.com.br/CEI_Responsivo/ConsultarProventos.aspx',
        querySelectors: {
            submitQueryButton: 'input#ctl00_ContentPlaceHolder1_btnConsultar',
            accountAgent:
                'span#ctl00_ContentPlaceHolder1_rptAgenteProventos_ctl00_lblAgenteProventos',
            account:
                'span#ctl00_ContentPlaceHolder1_rptAgenteProventos_ctl00_rptContasProventos_ctl00_lblConta',
            dividendsData: 'div.section-container.accordion > section.active',
            table: 'table.responsive',
            tableType: 'p.title > a',
        },
        fieldsMap: {
            Ativo: 'company',
            Especificação: 'especification',
            'Espec.': 'especification',
            'Cód. Negociação': 'code',
            'Prev. Pagamento': 'paymentPrevision',
            'Data Crédito': 'creditDate',
            'Tipo Evento': 'type',
            'Quantidade Base': 'quantity',
            'Fator Cotação': 'quotationFactor',
            'Valor Bruto (R$)': 'grossValue',
            'Valor Líquido (R$)': 'netValue',
            'Eventos em Dinheiro Provisionado': 'provisionedDividends',
            'Eventos em Dinheiro Creditado': 'creditedDividends',
        },
    }

    public static async getDividends(page: Page): Promise<Dividends> {
        console.log('Navigating to dividends page...')

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
        console.log('Fetching dividends data...')
        await page.waitForTimeout(1000)

        console.log('Extracting dividends information...')
        const [accountAgent, account, dividendsTables] = await Promise.all([
            this._getAccountAgent(page),
            this._getAccount(page),
            this._getDividendsTables(page, this._config.fieldsMap),
        ])

        return new Dividends(accountAgent, account, dividendsTables)
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

    private static async _getDividendsTables(
        page: Page,
        fieldsNames: any
    ): Promise<DividendsTable[]> {
        const sections = await page.$$(
            this._config.querySelectors.dividendsData
        )

        const dividendsDataArray = await Promise.all(
            sections.map(section => this._getDividendsData(section))
        )

        return await Promise.all(
            dividendsDataArray.map(dividendsData =>
                this._extractTableContent(dividendsData, fieldsNames)
            )
        )
    }

    private static async _extractTableContent(
        dividendsData: DividendsData,
        fieldsNames: any
    ) {
        return {
            type: fieldsNames[dividendsData.tableType],
            dividendsData: await extractTableContent(
                dividendsData.table,
                fieldsNames
            ),
        }
    }

    private static async _getDividendsData(
        section: ElementHandle
    ): Promise<DividendsData> {
        const tableType = await section.$eval(
            this._config.querySelectors.tableType,
            element => window.normalizeHTMLText(element.textContent || '')
        )

        const table = await section.$(this._config.querySelectors.table)

        return { tableType, table }
    }
}

export default DividendsController
