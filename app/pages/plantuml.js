const plantumlEncoder = require("plantuml-encoder");

function generateSourceDefault(umlCode, pluginOptions, diagType) {
  var imageFormat = pluginOptions.imageFormat || "img";
  var diagramName = pluginOptions.diagramName || "uml";
  var server = pluginOptions.server || "https://www.plantuml.com/";
  var zippedCode = plantumlEncoder.encode(umlCode);

  return server + "/" + diagType + "/" + imageFormat + "/" + zippedCode;
}

export default (md, opts = {}) => {
  const temp = md.renderer.rules.fence.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    console.log(token);
    try {
      if (
        token.info &&
        (token.info.indexOf("plantuml") != -1 ||
          token.info.indexOf("blockdiag") != -1 ||
          token.info.indexOf("d2"))
      ) {
        const code = token.content.trim();
        const diag =
          (token.info.indexOf("plantuml") != -1 && "plantuml") || "blockdiag";
        return `<img src="${generateSourceDefault(
          code,
          opts,
          diag
        )}" alt="" />`;
      }
    } catch (e) {
      console.error(`Parse Diagram Error: `, e);
    }
    return temp(tokens, idx, options, env, slf);
  };
};
