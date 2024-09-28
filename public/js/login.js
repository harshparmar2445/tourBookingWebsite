/* eslint-disable*/
import axios from 'axios';
import { showAlert } from "./alert";

export const login = async (email, password) => {
    try{
        const res = await axios({
            method: "POST",
            url: "http://127.0.0.1:3000/api/v1/users/login",
            data: {
                email,
                password
            }
        });

        if (res.data.status === 'success') {
          showAlert('success', 'Logged in successfuly');
          window.setTimeout(() => {
            location.assign('/');
          }, 1500);
        }
    } catch(err) {
        showAlert('error', err.response.data.message); // Logs the response data
        // Add error handling here, e.g., display an error message on the page.
    }
};

export const logout = async () => {
    try{
        const res = await axios({
            method: "GET",
            url: "http://127.0.0.1:3000/api/v1/users/logout"
        });
        if ((res.data.status ='success')) location.reload(true);
    }catch(err){
        console.log(err.response);
        showAlert('error', 'Error logging out! Try agin')
    }
};

 