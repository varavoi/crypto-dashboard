import axios from 'axios'

const cryptoApi = axios.create({
    baseURL: 'https://api.coingecko.com/api/v3',
    timeout: 10000,
})
export default cryptoApi