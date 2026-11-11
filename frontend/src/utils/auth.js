export const logout = async () => {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    }
  } finally {
    localStorage.removeItem("token");
  }
};
