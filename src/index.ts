import { Page } from 'puppeteer'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'

import PuppeteerController from './controller/PuppeteerController'
import LoginController from './controller/LoginController'
import WalletController from './controller/WalletController'
import DividendController from './controller/DividendController'
import CEIConfig from './config/CEIConfig'

main()
async function main() {
    const puppeteer = await PuppeteerController.configuresPuppeteer()
    const browser = await puppeteer.launch({ headless: true })

    try {
        const page: unknown = await browser.newPage()

        skipStylesRequests(page as Page)

        await LoginController.login(
            page as Page,
            CEIConfig.USER,
            CEIConfig.PASSWORD
        )

        const wallet = await WalletController.getWallet(page as Page)
        await saveJSON(wallet, 'wallet')

        const dividends = await DividendController.getDividends(page as Page)
        await saveJSON(dividends, 'dividens')

        await browser.close()
    } catch (err) {
        console.error('Erro inesperado: ', err)
        await browser.close()
    }
}

function saveJSON(content: any, fileName: string) {
    const path = resolve(
        __dirname,
        '..',
        '..',
        'files',
        `${fileName}-${Date.now()}.json`
    )
    return writeFile(path, JSON.stringify(content))
}

function skipStylesRequests(page: Page) {
    page.setRequestInterception(true)
    page.on('request', (request: any) => {
        if (
            ['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !==
            -1
        ) {
            request.abort()
        } else {
            request.continue()
        }
    })
}
