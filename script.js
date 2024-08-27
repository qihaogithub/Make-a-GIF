const httpServer = require("http-server");
const { exec } = require("child_process");
const os = require("os");

const server = httpServer.createServer({
  root: "./",
  cache: -1,
});

server.listen(8080, "0.0.0.0", () => {
  console.log("HTTP server running at http://localhost:8080/");

  const url = "http://localhost:8080/";

  // 根据操作系统选择命令
  if (os.platform() === "darwin") {
    exec(`open ${url}`); // macOS 使用 'open'
  } else if (os.platform() === "win32") {
    exec(`start ${url}`); // Windows 使用 'start'
  } else {
    console.log(`Please open your browser and navigate to ${url}`);
  }
});
