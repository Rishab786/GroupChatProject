//SEDING  HOME PAGE
exports.getHomePage = (request, response, next) => {
  response.sendFile("home.html", { root: "views" });
};
