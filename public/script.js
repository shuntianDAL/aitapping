// public/script.js

// Global variables and element references
const acupoints = ["后溪穴", "内关穴", "攒竹穴", "童子髎", "承泣穴", "人中穴", "承浆穴", "神藏穴", "大包穴", "百会穴"];
let currentStep = 0;
let detectedEmotion = "";

const bgMusic = document.getElementById("bgMusic");
const toggleMusicBtn = document.getElementById("toggleMusicBtn");

// Set background music volume (if bgMusic is found)
if (bgMusic) {
  bgMusic.volume = 0.4;
}

// Function to call your backend endpoint to detect emotion
async function detectEmotionAI(text) {
  const prompt = `请用两个字精准总结以下描述的主要负面情绪：“${text}”，只返回两个字，不要有标点符号或引号。`;
  try {
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    // Assuming the backend returns a similar structure as the DeepSeek API.
    return data.choices[0].message.content.trim().replace(/['"“”]/g, '').substring(0, 2);
  } catch (error) {
    console.error("Error in detectEmotionAI:", error);
    return "未知";
  }
}

// Start the therapy process: detect emotion then display the first step.
async function startStep1() {
  // Ensure background music plays on user interaction
  if (bgMusic) bgMusic.play();

  // Show spinner beside the button
  const spinner = document.getElementById("spinner");
  spinner.style.display = "inline-block";

  const input = document.getElementById("userInput").value;
  try {
    detectedEmotion = await detectEmotionAI(input);
    document.getElementById("step1").innerText = `我明白了，你现在感到${detectedEmotion}。请跟我一起进行弹穴疗愈。`;
    document.getElementById("intensityDiv").style.display = "block";
    speak(`我明白了，你现在感到了${detectedEmotion}。请跟我一起进行弹穴疗愈。请问你对这件事情的情绪强度是0到10第几级？`);
  } catch (error) {
    console.error("Error in startStep1:", error);
    document.getElementById("step1").innerText = "出错了，请稍后重试。";
  } finally {
    // Hide spinner once the API call is complete
    spinner.style.display = "none";
  }
}

// Evaluate initial emotional intensity and show next steps
function evaluateIntensity() {
  const level = parseInt(document.getElementById("intensityInput").value);
  if (level === 0) {
    document.getElementById("acupointStep").style.display = "block";
    document.getElementById("acupointStep").innerText = "太好了！您已成功释放情绪，不需要弹穴啦~";
  } else {
    currentStep = 0;
    document.getElementById("acupointStep").style.display = "block";
    // Start the first acupoint step by opening the acupoint modal
    nextAcupoint();
  }
}

// Modified nextAcupoint: open the acupoint modal for the current step
function nextAcupoint() {
  // Hide the "下一穴位" button if visible
  document.getElementById("nextAcupointBtn").style.display = "none";
  showAcupointModal();
}

// Show the acupoint modal with image corresponding to currentStep, guidance text, and start countdown
function showAcupointModal() {
  const modal = document.getElementById("acupointModal");
  const modalImg = document.getElementById("acupointImg");
  const guidanceEl = document.getElementById("acupointGuidance");

  // Get the acupoint name for the current step and build guidance text.
  const point = acupoints[currentStep];
  const guidanceText = `步骤 ${currentStep + 1}：请轻弹“${point}”20秒，同时口述：\n“虽然我想起这件事还是很${detectedEmotion}，但是我还是完完全全接受并爱自己。”`;

  // Update guidance element with the text.
  guidanceEl.innerText = guidanceText;

  // Speak the guidance
  speak(`请轻弹 ${point} 二十秒，并说：虽然我想起这件事还是很${detectedEmotion}，但我还是完完全全接受并爱自己。`);

  // Construct image path: for currentStep=0, show "1.jpeg", currentStep=1 -> "2.jpeg", etc.
  modalImg.src = `/source/${currentStep + 1}.jpeg`;
  modal.style.display = "block";
  startCountdown();
}


// Start the 20-second countdown and update the countdown display
function startCountdown() {
  let counter = 20;
  const countdownEl = document.getElementById("acupointCountdown");
  countdownEl.innerText = counter + " 秒";
  const interval = setInterval(() => {
    counter--;
    if (counter < 0) {
      clearInterval(interval);
      fadeOutAcupointModal();
    } else {
      countdownEl.innerText = counter + " 秒";
    }
  }, 1000);
}

// Fade out the acupoint modal and then hide it
function fadeOutAcupointModal() {
  const modal = document.getElementById("acupointModal");
  modal.classList.add("fade-out");
  setTimeout(() => {
    modal.style.display = "none";
    modal.classList.remove("fade-out");
    // Proceed to next acupoint step
    currentStep++;
    if (currentStep < acupoints.length) {
      // Show "下一穴位" button if more steps remain
      document.getElementById("nextAcupointBtn").style.display = "inline-block";
    } else {
      document.getElementById("nextAcupointBtn").style.display = "none";
      document.getElementById("acupointStep").innerText = "10个穴位已完成，请继续进行情绪评分。";
      document.getElementById("followUpDiv").style.display = "block";
    }
  }, 1000); // Adjust timeout to match the fade-out transition duration
}

// Evaluate follow-up emotional intensity and display final instructions
function evaluateFollowUp() {
  const level = parseInt(document.getElementById("followupIntensity").value);
  const final = document.getElementById("finalResponse");
  if (level === 0) {
    final.innerText = "非常好！祝贺您已成功释放这件事情带来的负面情绪！";
  } else {
    final.innerText = `请复述：“虽然我想起这件事还是很${detectedEmotion}，但是我还是完完全全接受并爱自己。”\n现在请再跟我再来进行一次完整的弹穴疗愈动作！`;
  }
}

// Function to use speech synthesis
function speak(text) {
  // Replace "弹" with "谭" to avoid TTS issues if needed
  const utter = new SpeechSynthesisUtterance(text.replace(/弹/g, "谭"));
  utter.lang = 'zh-CN';
  speechSynthesis.speak(utter);
}

// Toggle background music mute/unmute
toggleMusicBtn.addEventListener('click', function() {
  const music = document.getElementById('bgMusic');
  music.muted = !music.muted;
});

/* ========== EXISTING MODAL FUNCTIONS FOR RED ICON ========== */
// Open the modal with the detailed 百会穴 image (triggered by clicking the red icon)
function openModal(imgSrc) {
  const modal = document.getElementById("myModal");
  const modalImg = document.getElementById("modal-img");
  modal.style.display = "block";
  modalImg.src = imgSrc;
}

// Close the modal (for the red icon modal)
function closeModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";
}
