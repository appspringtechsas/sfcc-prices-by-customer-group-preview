/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import PropTypes from 'prop-types'

// Removes focus for non-keyboard interactions for the whole application
import 'focus-visible/dist/focus-visible'

import theme from '@appspringtechsas/sfcc-prices-by-customer-group/app/theme'
import {
    resolveSiteFromUrl,
    resolveLocaleFromUrl
} from '@appspringtechsas/sfcc-prices-by-customer-group/app/utils/site-utils'
import { getConfig } from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import { createUrlTemplate } from '@appspringtechsas/sfcc-prices-by-customer-group/app/utils/url'

import { withReactQuery } from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query'
import { useCorrelationId } from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import { getAppOrigin } from '@salesforce/pwa-kit-react-sdk/utils/url'
import { CurrencyProvider } from '@appspringtechsas/sfcc-prices-by-customer-group/app/contexts'
import AppCore from '@appspringtechsas/sfcc-prices-by-customer-group/app/components/app-core'

/**
 * Use the AppConfig component to inject extra arguments into the getProps
 * methods for all Route Components in the app – typically you'd want to do this
 * to inject a connector instance that can be used in all Pages.
 *
 * You can also use the AppConfig to configure a state-management library such
 * as Redux, or Mobx, if you like.
 */
const AppConfig = ({ children, locals = {} }) => {
    const { correlationId } = useCorrelationId()
    const headers = {
        'correlation-id': correlationId
    }

    const commerceApiConfig = locals.appConfig.commerceAPI

    const appOrigin = getAppOrigin()

    return (
        <CurrencyProvider currency={locals.locale?.preferredCurrency}>
            <AppCore
                shortCode={commerceApiConfig.parameters.shortCode}
                clientId={commerceApiConfig.parameters.clientId}
                organizationId={commerceApiConfig.parameters.organizationId}
                siteId={locals.site?.id}
                locale={locals.locale?.id}
                redirectURI={`${appOrigin}/callback`}
                proxy={`${appOrigin}${commerceApiConfig.proxyPath}`}
                headers={headers}
                OCAPISessionsURL={`${appOrigin}/mobify/proxy/ocapi/s/${locals.site?.id}/dw/shop/v22_8/sessions`}
                site={locals.site}
                msLocale={locals.locale}
                buildUrl={locals.buildUrl}
                theme={theme}
            >
                {children}
            </AppCore>
        </CurrencyProvider>
    )
}

AppConfig.restore = (locals = {}) => {
    const path =
        typeof window === 'undefined'
            ? locals.originalUrl
            : `${window.location.pathname}${window.location.search}`
    const site = resolveSiteFromUrl(path)
    const locale = resolveLocaleFromUrl(path)

    const { app: appConfig } = getConfig()
    const apiConfig = {
        ...appConfig.commerceAPI,
        einsteinConfig: appConfig.einsteinAPI
    }

    apiConfig.parameters.siteId = site.id

    locals.buildUrl = createUrlTemplate(appConfig, site.alias || site.id, locale.id)
    locals.site = site
    locals.locale = locale
    locals.appConfig = appConfig
}

AppConfig.freeze = () => undefined

AppConfig.extraGetPropsArgs = (locals = {}) => {
    return {
        buildUrl: locals.buildUrl,
        site: locals.site,
        locale: locals.locale
    }
}

AppConfig.propTypes = {
    children: PropTypes.node,
    locals: PropTypes.object
}

const isServerSide = typeof window === 'undefined'

// Recommended settings for PWA-Kit usages.
// NOTE: they will be applied on both server and client side.
// retry is always disabled on server side regardless of the value from the options
const options = {
    queryClientConfig: {
        defaultOptions: {
            queries: {
                retry: false,
                refetchOnWindowFocus: false,
                staleTime: 10 * 1000,
                ...(isServerSide ? { retryOnMount: false } : {})
            },
            mutations: {
                retry: false
            }
        }
    }
}

export default withReactQuery(AppConfig, options)
