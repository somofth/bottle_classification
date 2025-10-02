const URL = "./my_model/";
let result = document.getElementById("result");

let model, labelContainer, maxPredictions;

// 페이지가 로드되면 바로 모델을 불러오자.
init();

// 모델을 로드하고 결과창을 준비하는 함수
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

// 이미지를 예측하고 결과를 표시하는 함수
// 이미지를 예측하고 결과를 표시하는 함수
async function predict() {
  const image = document.getElementById("uploadedImage");
  const prediction = await model.predict(image);

  // 1. 최고 확률 값을 찾기 위한 변수를 준비 (let으로 변경)
  let highestProbability = 0;
  let bestPredictionIndex = -1;

  for (let i = 0; i < maxPredictions; i++) {
    const probability = prediction[i].probability;
    const classPrediction =
      prediction[i].className + ": " + probability.toFixed(2);

    // 일단 모든 div의 내용을 채우고, selected 클래스는 제거해서 초기화
    const resultDiv = labelContainer.childNodes[i];
    resultDiv.innerHTML = classPrediction;
    resultDiv.classList.remove("selected");

    // 2. 현재 항목의 확률이 지금까지의 최고 확률보다 높으면 기록을 갱신
    if (probability > highestProbability) {
      highestProbability = probability;
      bestPredictionIndex = i;
    }
  }

  // 3. 반복문이 끝난 후, 가장 확률이 높았던 div를 찾아서 클래스 추가
  if (bestPredictionIndex > -1) {
    labelContainer.childNodes[bestPredictionIndex].classList.add("selected");
    result.innerHTML = `이 이미지는 <strong>${
      prediction[bestPredictionIndex].className
    }</strong>입니다! (확률: ${highestProbability.toFixed(2) * 100}%)`;
  }
}

// 파일 업로더에 이벤트 리스너를 추가해서 파일 선택을 감지
const imageUploader = document.getElementById("imageUploader");
imageUploader.addEventListener("change", async (e) => {
  const image = document.getElementById("uploadedImage");
  const file = e.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      image.src = event.target.result;
      image.style.display = "block"; // 이미지를 화면에 표시
      // 이미지가 브라우저에 완전히 그려진 후에 예측을 실행
      image.onload = async () => {
        await predict();
      };
    };
    reader.readAsDataURL(file);
  }
});
