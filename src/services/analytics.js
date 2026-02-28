import GA4React from 'react-ga4'

const MEASUREMENT_ID = 'G-18ZNFL9Q27' // Replace with your Google Analytics 4 Measurement ID

export const initializeApp = () => {
  if (MEASUREMENT_ID && MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    GA4React.initialize([
      {
        trackingId: MEASUREMENT_ID,
      },
    ])
  }
}

export const trackPageView = (pageName) => {
  if (MEASUREMENT_ID && MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    GA4React.pageview({
      page_path: `/${pageName}`,
      page_title: pageName,
    })
  }
}

export const trackEvent = (eventName, eventParams = {}) => {
  if (MEASUREMENT_ID && MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    GA4React.event(eventName, eventParams)
  }
}

