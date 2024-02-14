import { getAppOrigin } from '@salesforce/pwa-kit-react-sdk/utils/url'

class ControllerManager {
    constructor(siteId, locale) {
        this.baseUrl = `${getAppOrigin()}/mobify/proxy/controller/on/demandware.store/Sites-${siteId}-Site/${locale}/`
    }

    get(controllerName, callback, params = null) {
        let fetchUrl = `${this.baseUrl}${controllerName}`
        if (params) {
            fetchUrl = `${fetchUrl}?${params.toString()}`
        }

        fetch(fetchUrl)
            .then(async (res) => {
                const result = await res.json()
                callback(result)
            })
            .catch(error => console.error(error))
    }

    post(controllerName, requestBody, callback) {
        fetch(
            `${this.baseUrl}${controllerName}`,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody)
            }
        )
            .then(async (res) => {
                const result = await res.json()
                callback(result)
            })
            .catch(error => console.error(error))
    }

}

export default ControllerManager