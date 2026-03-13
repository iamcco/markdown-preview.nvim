const zlib = require("zlib");

// Kroki 需要标准 base64 编码（deflate + base64）
// plantuml-encoder 使用的是 PlantUML 特有的自定义 base64 变体
function encodeForKroki(code) {
  const deflated = zlib.deflateSync(code);
  return deflated.toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

function generateSourceDefault(umlCode, pluginOptions, diagType) {
  var imageFormat = pluginOptions.imageFormat || "svg";
  var server = pluginOptions.server || "https://kroki.io";
  var encoded = encodeForKroki(umlCode);

  return server + "/" + diagType + "/" + imageFormat + "/" + encoded;
}

function getDiagramType(info) {
  if (info.indexOf("plantuml") !== -1) return "plantuml";
  if (info.indexOf("d2") !== -1) return "d2";
  if (info.indexOf("blockdiag") !== -1) return "blockdiag";
  if (info.indexOf("seqdiag") !== -1) return "seqdiag";
  if (info.indexOf("actdiag") !== -1) return "actdiag";
  if (info.indexOf("nwdiag") !== -1) return "nwdiag";
  if (info.indexOf("packetdiag") !== -1) return "packetdiag";
  if (info.indexOf("rackdiag") !== -1) return "rackdiag";
  return null;
}

export default (md, opts = {}) => {
  const temp = md.renderer.rules.fence.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    try {
      if (token.info) {
        const diagType = getDiagramType(token.info);
        if (diagType) {
          const code = token.content.trim();
          return `<img src="${generateSourceDefault(code, opts, diagType)}" alt="${diagType} diagram" />`;
        }
      }
    } catch (e) {
      console.error(`Parse Diagram Error: `, e);
    }
    return temp(tokens, idx, options, env, slf);
  };
};
