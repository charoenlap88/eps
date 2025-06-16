// src/store/page.js
import { atom } from 'recoil';

export const breadcrumbState = atom({
  key: 'breadcrumbState',
  default: [],
});

export const titleState = atom({
  key: 'titleState',
  default: '',
});

export const selectedUrlState = atom({
  key: 'selectedUrlState',
  default: '',
});
