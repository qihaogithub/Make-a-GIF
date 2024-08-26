document
  .getElementById("file-input")
  .addEventListener("change", handleFileSelect);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file && file.type === "image/png") {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgElement = document.getElementById("animated-image");
      imgElement.src = e.target.result;
      document.getElementById("image-container").style.display = "block";
      document.getElementById("generate-gif").style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    alert("请选择一个PNG图片文件。");
  }
}

document.getElementById("generate-gif").addEventListener("click", generateGIF);

function generateGIF() {
  const imgElement = document.getElementById("animated-image");
  const gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: "js/gif.worker.js",
    transparent: 0x00000000, // 设置透明色
  });

  // 获取图片的宽度和高度
  const { width, height } = imgElement;

  // 创建一个 canvas
  const { canvas, ctx } = createCanvas(width, height);

  // 添加帧到 GIF
  const scales = [1, 0.8, 1]; // 不同的缩放比例
  scales.forEach((scale) => {
    ctx.clearRect(0, 0, width, height); // 清除之前的内容

    // 将原点移动到图片中心
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);

    // 将图片绘制到以中心为原点的位置
    ctx.drawImage(imgElement, -width / 2, -height / 2, width, height);
    ctx.restore();

    gif.addFrame(canvas, { copy: true, delay: 500 }); // 添加帧，延迟 0.5 秒
  });

  gif.on("finished", function (blob) {
    const file = document.getElementById("file-input").files[0];
    const fileName = file.name.replace(".png", ".gif");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  gif.render();
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, width, height); // 确保画布是透明的
  return { canvas, ctx };
}
