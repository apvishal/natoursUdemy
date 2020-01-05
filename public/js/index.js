/* eslint-disable */
import '@babel/polyfill';
import { login } from './login';
import { logout } from './login';

console.log("hello from parcel...");

const loginForm = document.querySelector('.form');
const logoutButton = document.querySelector('.nav__el--logout');

if (loginForm) {
    // get the info from the webpage...
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log("*****", email, password);
        login(email, password);
    });
}
if (logoutButton) logoutButton.addEventListener('click', logout)

