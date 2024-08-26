document
  .getElementById("file-input")
  .addEventListener("change", handleFileSelect);

// 监听参数变化
document.getElementById("min-scale").addEventListener("input", updatePreview);
document.getElementById("max-scale").addEventListener("input", updatePreview);
document.getElementById("frame-count").addEventListener("input", updatePreview);
document.getElementById("duration").addEventListener("input", updatePreview);

let animationFrameId;

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file && file.type === "image/png") {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgElement = document.getElementById("animated-image");
      imgElement.src = e.target.result;
      document.getElementById("image-container").style.display = "block";
      document.getElementById("controls").style.display = "block";
      updatePreview(); // 更新预览
    };
    reader.readAsDataURL(file);
  } else {
    alert("请选择一个PNG图片文件。");
  }
}

function updatePreview() {
  const imgElement = document.getElementById("animated-image");
  const minScale = parseFloat(document.getElementById("min-scale").value);
  const maxScale = parseFloat(document.getElementById("max-scale").value);
  const frameCount = parseInt(document.getElementById("frame-count").value, 10);
  const duration = parseFloat(document.getElementById("duration").value);

  const delay = (duration * 1000) / frameCount; // 计算每帧的延迟时间（毫秒）

  let startTime = null;

  // 取消之前的动画帧（如果有）
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  function animate(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;

    // 计算当前帧的索引
    const frameIndex = Math.floor((elapsed / delay) % frameCount);

    // 计算当前帧的缩放比例
    const scale =
      minScale +
      (maxScale - minScale) *
        Math.sin((frameIndex / (frameCount - 1)) * Math.PI);

    // 应用缩放效果
    imgElement.style.transform = `scale(${scale})`;

    // 请求下一帧
    animationFrameId = requestAnimationFrame(animate);
  }

  // 启动动画
  animationFrameId = requestAnimationFrame(animate);
}

document.getElementById("generate-gif").addEventListener("click", generateGIF);

function generateGIF() {
  const imgElement = document.getElementById("animated-image");
  const minScale = parseFloat(document.getElementById("min-scale").value);
  const maxScale = parseFloat(document.getElementById("max-scale").value);
  const frameCount = parseInt(document.getElementById("frame-count").value, 10);
  const duration = parseFloat(document.getElementById("duration").value);

  const delay = (duration * 1000) / frameCount; // 计算每帧的延迟时间（毫秒）

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

  // 生成帧，并添加到 GIF
  for (let i = 0; i < frameCount; i++) {
    const scale =
      minScale +
      (maxScale - minScale) * Math.sin((i / (frameCount - 1)) * Math.PI);
    ctx.clearRect(0, 0, width, height); // 清除之前的内容

    // 将原点移动到图片中心
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);

    // 将图片绘制到以中心为原点的位置
    ctx.drawImage(imgElement, -width / 2, -height / 2, width, height);
    ctx.restore();

    gif.addFrame(canvas, { copy: true, delay: delay }); // 添加帧，使用用户指定的延迟时间
  }

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
