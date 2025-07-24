// getRequest function
export const getRequest = async (url, callback) => {
  let response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let content = await response.json();
  callback(content);
};

// postRequest function
export const postRequest = async (url, body, callback) => {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let content = await response.json();
  callback(content);
};

// postRequestFormData function
export const postRequestFormData = async (url, data, callback) => {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "multipart/form-data",
    },
    body: data,
  });
  callback(response);
};
