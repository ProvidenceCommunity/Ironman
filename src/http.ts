import Axios from "axios";

const url = window.location.hostname.includes("localhost")
    ? "http://localhost:5002"
    : window.location.origin;

export async function get(path: string) {
    return await Axios.get(url + path, {
        headers: {
            "Content-type": "application/json",
        },
        validateStatus: () => { return true },
        withCredentials: true
    });
}
export async function post(path: string, data: any) {
    return Axios.post(url + path, data, {
        headers: {
            "Content-type": "application/json",
        },
        validateStatus: () => { return true },
        withCredentials: true
    });
}
