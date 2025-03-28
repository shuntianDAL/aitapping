// script.js

// Global variables
let currentStep = 0;
let detectedEmotion = "";
const acupoints = ["后溪穴", "内关穴", "攒竹穴", "童子髎", "承泣穴", "人中穴", "承浆穴", "神藏穴", "大包穴", "百会穴"];

/**
 * Simulated API call that detects emotion.
 * Replace this simulation with your actual API call.
 */
async function detectEmotionAI(text) {
  // Example: Call your backend endpoint (/api/chat)
  const prompt = `请用两个字精准总结以下描述的主要负面情绪：“${text}”，只返回两个字，不要有标点符号或引号。`;
  const response = await fetch('/api/chat', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });
  const data = await response.json();
  // Assuming the backend returns a structure similar to DeepSeek's API response.
  return data.choices[0].message.content.trim().replace(/['"“”]/g, '').substring(0, 2);
}

/**
 * Called when the "描述问题" button is clicked.
 * Displays a progress bar while waiting for the API response.
 */
async function startStep1() {
  const step1Div = document.getElementById("step1");
  // Display the progress bar
  step1Div.innerHTML = '<div class="progress-bar"><div class="progress"></div></div>';

  // Get user input
  const input = document.getElementById("userInput").value;

  try {
    // Call the API (simulate delay as needed)
    detectedEmotion = await detectEmotionAI(input);

    // Update the "step1" div with the result
    step1Div.innerHTML = `我明白了，你现在感到${detectedEmotion}。请跟我一起进行弹穴疗愈。`;

    // Use speech synthesis to speak the instruction
    speak(`我明白了，你现在感到了${detectedEmotion}。请跟我一起进行弹穴疗愈。请问你对这件事情的情绪强度是0到10第几级？`);
  } catch (error) {
    console.error(error);
    step1Div.innerHTML = "出错了，请稍后重试。";
  }
}

/**
 * Evaluates the initial emotional intensity.
 */
function evaluateIntensity() {
  const level = parseInt(document.getElementById("intensityInput").value);
  if (level === 0) {
    document.getElementById("acupointStep").style.display = "block";
    document.getElementById("acupointStep").innerText = "太好了！您已成功释放情绪，不需要弹穴啦~";
  } else {
    currentStep = 0;
    document.getElementById("acupointStep").style.display = "block";
    document.getElementById("nextAcupointBtn").style.display = "inline-block";
    nextAcupoint();
  }
}

/**
 * Moves to the next acupoint with a countdown.
 */
function nextAcupoint() {
  if (currentStep < acupoints.length) {
    const point = acupoints[currentStep];
    const guidance = `步骤 ${currentStep + 1}：请轻弹“${point}”20秒，同时口述：\n“虽然我想起这件事还是很${detectedEmotion}，但是我还是完完全全接受并爱自己。”`;
    document.getElementById("acupointStep").innerText = guidance;

    // Speak the guidance
    speak(`请轻弹 ${point} 二十秒，并说：虽然我想起这件事还是很${detectedEmotion}，但我还是完完全全接受并爱自己。`);

    // Countdown logic
    let counter = 20;
    const countdown = setInterval(() => {
      document.getElementById("acupointStep").innerText = guidance + `\n\n倒计时：${counter} 秒`;
      counter--;
      if (counter < 0) {
        clearInterval(countdown);
        currentStep++;
        if (currentStep < acupoints.length) {
          document.getElementById("nextAcupointBtn").style.display = "inline-block";
        } else {
          document.getElementById("acupointStep").innerText = "10个穴位已完成，请继续进行情绪评分。";
          document.getElementById("nextAcupointBtn").style.display = "none";
          document.getElementById("followUpDiv").style.display = "block";
        }
      } else {
        document.getElementById("nextAcupointBtn").style.display = "none";
      }
    }, 1000);
  }
}

/**
 * Evaluates the follow-up emotional intensity.
 */
function evaluateFollowUp() {
  const level = parseInt(document.getElementById("followupIntensity").value);
  const final = document.getElementById("finalResponse");
  if (level === 0) {
    final.innerText = "非常好！祝贺您已成功释放这件事情带来的负面情绪！";
  } else {
    final.innerText = `请复述：“虽然我想起这件事还是很${detectedEmotion}，但是我还是完完全全接受并爱自己。”
现在请再跟我再来进行一次完整的弹穴疗愈动作！`;
  }
}

/**
 * Uses the Web Speech API to speak the provided text.
 */
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text.replace(/弹/g, "谭"));
  utter.lang = 'zh-CN';
  speechSynthesis.speak(utter);
}

// Toggle background music mute/unmute
document.getElementById("toggleMusicBtn").addEventListener("click", function() {
  const music = document.getElementById("bgMusic");
  music.muted = !music.muted;
});
