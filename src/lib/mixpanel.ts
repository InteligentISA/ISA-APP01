import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = "YOUR_PROJECT_TOKEN"; // TODO: Replace with your actual Mixpanel project token

export const initMixpanel = () => {
  if (!(mixpanel as any).__loaded) {
    mixpanel.init(MIXPANEL_TOKEN, { debug: true });
  }
};

export const trackEvent = (event: string, properties?: Record<string, any>) => {
  mixpanel.track(event, properties);
};

export default mixpanel; 