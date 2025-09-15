export const routesHealthGet = async () => {
  //replace with timer in state
  return {
    code: 200,
    header: {
      headerType: "Content-Type",
      headerValue: "application/json; charset=utf-8",
    },
    send: { state: "healthy", uptime: "uptime" },
  };
};
