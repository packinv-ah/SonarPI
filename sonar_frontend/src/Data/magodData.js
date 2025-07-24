export let lazerData = JSON.parse(localStorage.getItem("LazerUser"))["data"]["0"];

let envGST = process.env.REACT_APP_LOCAL_UNIT_GST
export let localGST = envGST || "29AABCM1970H1ZE";