document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("file-input")
    .addEventListener("change", handleFileSelect);

  // 监听参数变化
  document.getElementById("min-scale").addEventListener("input", updatePreview);
  document.getElementById("max-scale").addEventListener("input", updatePreview);
  document
    .getElementById("frame-count")
    .addEventListener("input", updatePreview);
  document.getElementById("duration").addEventListener("input", updatePreview);

  document
    .getElementById("generate-gif")
    .addEventListener("click", generateGIF);

  console.log("事件监听器已添加"); // 添加这行来确认事件监听器已添加
});

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
      console.log(
        "Controls displayed:",
        document.getElementById("controls").style.display
      );
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

    // 计算当帧的索引
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
  console.log("generateGIF function called");
  console.log("按钮元素:", document.getElementById("generate-gif"));
  console.log("图片元素:", document.getElementById("animated-image"));

  const imgElement = document.getElementById("animated-image");

  // 检查图片是否已加载
  if (!imgElement.complete || !imgElement.naturalWidth) {
    alert("请等待图片完全加载后再生成GIF。");
    return;
  }

  const minScale = parseFloat(document.getElementById("min-scale").value);
  const maxScale = parseFloat(document.getElementById("max-scale").value);
  const frameCount = parseInt(document.getElementById("frame-count").value, 10);
  const duration = parseFloat(document.getElementById("duration").value);
  const delay = (duration * 1000) / frameCount;

  console.log("GIF参数:", { minScale, maxScale, frameCount, duration, delay });

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: imgElement.naturalWidth,
    height: imgElement.naturalHeight,
    transparent: "rgba(0,0,0,0)", // 设置透明背景
    workerScript: "js/gif.worker.js", // 确保这个路径是正确的
  });

  const canvas = document.createElement("canvas");
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  for (let i = 0; i < frameCount; i++) {
    const progress = i / (frameCount - 1);
    const scale =
      minScale + (maxScale - minScale) * Math.sin(progress * Math.PI);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaledWidth = imgElement.naturalWidth * scale;
    const scaledHeight = imgElement.naturalHeight * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(imgElement, x, y, scaledWidth, scaledHeight);

    gif.addFrame(ctx, { copy: true, delay: delay });
    console.log(`添加第 ${i + 1} 帧`);
  }

  gif.on("progress", function (p) {
    console.log(`GIF生成进度: ${Math.round(p * 100)}%`);
  });

  gif.on("finished", function (blob) {
    console.log("GIF生成完成");
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

  console.log("开始渲染GIF");
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
