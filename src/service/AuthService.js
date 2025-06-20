export const setToken = (token) => {
  localStorage.setItem("authTokenAdmin", token);
};

export const getToken = () => {
  return localStorage.getItem("authTokenAdmin");
};

export const removeToken = () => {
  localStorage.removeItem("authTokenAdmin");
};
