import { build } from '@rocket-scripts/web';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  await build({
    app: 'wallet',
    webpackConfig: webpackPolyfills,
  });
})();
