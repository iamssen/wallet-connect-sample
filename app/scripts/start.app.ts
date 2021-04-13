import { start } from '@rocket-scripts/web';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  await start({
    app: 'app',
    hostname: '0.0.0.0',
    webpackConfig: webpackPolyfills,
  });
})();
