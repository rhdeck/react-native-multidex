const fixMultidex = require("./index.js");
module.exports = {
  commands: [
    {
      name: "multidex",
      description:
        "Activate multidex support (works on standard react native apps)",
      func: () => {
        fixMultidex();
      },
    },
  ],
};
