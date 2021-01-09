import puppeteer, { PuppeteerExtra } from 'puppeteer-extra'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import TwoCaptchaConfig from '../config/TwoCaptchaConfig'

class PuppeteerController {
    public static async configuresPuppeteer(): Promise<PuppeteerExtra> {
        puppeteer.use(
            RecaptchaPlugin({
                provider: {
                    id: '2captcha',
                    token: TwoCaptchaConfig.TOKEN,
                },
                visualFeedback: false,
            })
        )

        return puppeteer
    }
}

export default PuppeteerController
