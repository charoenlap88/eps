import {atom} from 'recoil';

export const modelsState = atom({
    key: 'modelsState',
    default: [],
});

export const selectModelState = atom({
    key: 'selectModelState',
    default: '',
});

export const models2State = atom({
    key: 'models2State',
    default: [],
});

export const selectModel2State = atom({
    key: 'selectModel2State',
    default: '',
});

export const userState = atom({
    key:'userState',
    default: ''
})

export const attemptLoginState = atom({
    key: 'attemptLoginState',
    default: 0
})