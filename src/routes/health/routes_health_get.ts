export const routesHealthGet = async () => {
  // TODO: place timer in state and use that
  return {
    code: 200,
    header: {
      headerType: "Content-Type",
      headerValue: "application/json; charset=utf-8",
    },
    send: { state: "healthy", uptime: "uptime" },
  };
};
