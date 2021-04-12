import { start } from '@rocket-scripts/web';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  await start({
    app: 'app',
    webpackConfig: webpackPolyfills,
  });
})();
