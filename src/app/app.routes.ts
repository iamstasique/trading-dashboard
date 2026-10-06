import { Routes } from '@angular/router';

import { DepositModal } from './deposit/deposit-modal';
import { HomePage } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'deposit',
        component: DepositModal,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
