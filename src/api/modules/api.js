import axios from 'axios'
 

export const requestFaults = () => {
    return axios.get('http://localhost:5000/detect')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching faults:', error);
            throw error;
        });
};
