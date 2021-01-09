import { throws } from 'assert'
import { Page } from 'puppeteer'

class LoginController {
    private static _config = {
        URL: 'https://cei.b3.com.br/CEI_Responsivo/login.aspx',
        querySelectors: {
            recaptchaTextArea: 'textarea#g-recaptcha-response',
            inputLogin: 'input#ctl00_ContentPlaceHolder1_txtLogin',
            inputPassword: 'input#ctl00_ContentPlaceHolder1_txtSenha',
            submitButton: 'input#ctl00_ContentPlaceHolder1_btnLogar',
        },
    }

    public static async login(
        page: Page,
        user: string | undefined,
        password: string | undefined
    ) {
        if (!user || !password) {
            throw new Error('User or password not informed')
        }

        await page.goto(this._config.URL)

        await Promise.all([
            this._solveRecaptchas(page),
            this._setUser(page, user),
            this._setPassword(page, password),
        ])

        console.log('Submiting login...')
        await this._submitLogin(page)
        console.log('Login successfully')
    }

    private static async _solveRecaptchas(page: Page) {
        const { solutions, error } = await page.solveRecaptchas()

        if (error) {
            console.error('Falha ao resolver recaptcha: ', error)
            return
        }

        const token = solutions[0].text || ''

        await page.$eval(
            this._config.querySelectors.recaptchaTextArea,
            (element, { token }) => {
                element.innerHTML = token
            },
            { token }
        )
    }

    private static async _setUser(page: Page, user: string) {
        await page.$eval(
            this._config.querySelectors.inputLogin,
            (element, { user }) => {
                element.setAttribute('value', user)
            },
            { user }
        )
    }

    private static async _setPassword(page: Page, password: string) {
        await page.$eval(
            this._config.querySelectors.inputPassword,
            (element, { password }) => {
                element.setAttribute('value', password)
            },
            { password }
        )
    }

    private static async _submitLogin(page: Page) {
        await page.click(this._config.querySelectors.submitButton)
        await page.waitForNavigation()
    }
}

export default LoginController
