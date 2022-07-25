import { defineModule } from '@directus/extensions-sdk';

export default defineModule({
  id: 'bree-module',
  name: 'Bree',
  icon: 'more_time',
  routes: [
    {
      path: '',
      component: () => import('./views/Bree.vue'),
    },
  ],
});
