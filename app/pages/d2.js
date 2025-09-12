import {platform} from "os";

function bytesToHex(bytes) {
  return Array.from(
    bytes,
    byte => byte.toString(16).padStart(2, "0")
  ).join("");
}

// You almost certainly want UTF-8, which is
// now natively supported:
function stringToUTF8Bytes(string) {
  return new TextEncoder().encode(string);
}

function generateSourceDefault (diagramCode, pluginOptions) {
  var imageFormat = pluginOptions.imageFormat || 'png'
  var diagramName = pluginOptions.diagramName || 'uml'
  var server = "http://localhost:4041"
  console.log("process.env", process.env)	
  console.log("conf", pluginOptions)

  var hexlifiedCode = bytesToHex(stringToUTF8Bytes(diagramCode))
  return server + '/d2/' + imageFormat + '/hex?diagram=' + hexlifiedCode
}

export default (md, opts = {}) => {
  const temp = md.renderer.rules.fence.bind(md.renderer.rules)
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    try {
      if (token.info && token.info.indexOf('d2') != -1 ) {
        const code = token.content.trim()
        return `<img src="${generateSourceDefault(code, opts)}" height=500px alt="" />`
      }
    } catch (e) {
      console.error(`Parse Diagram Error: `, e)
    }
    return temp(tokens, idx, options, env, slf)
  }
}
