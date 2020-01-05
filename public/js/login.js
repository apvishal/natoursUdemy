/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email, password) => {
    try {
        const result = await axios ({
            method : 'POST',
            url: 'http://127.0.0.1:1337/api/v1/users/login/',
            data: {
                email,
                password
            }
        });
        console.log(result.data);
        if (result.data.status === 'success') {
            showAlert('success', 'Log in successful!')
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};


export const logout = async () => {
    try {
        console.log("hello from logoit");
        // call the logout from the api (located in authController...)
        const result = await axios ({
            method: 'GET',
            url: 'http://127.0.0.1:1337/api/v1/users/logout/'
        });
        if (result.data.status === 'success') {
            // reload the page, specify true to indicate that we want to reload from the server, not browser cache...
            location.reload(true);
            showAlert('success', 'Logout Successful');
        }

    } catch (err) {
        // err logging out...
        showAlert('error', 'error logging out, try again...');
    }
}