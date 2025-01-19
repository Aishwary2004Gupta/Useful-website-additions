document.addEventListener("DOMContentLoaded", () => {
    const maskRed = document.querySelector(".mask-red");
    const deadlineText = document.querySelector(".deadline-text");
  
    let days = 7;
  
    function startAnimation() {
      maskRed.style.transform = "translateX(0)";
      const interval = setInterval(() => {
        if (days > 1) {
          days--;
          deadlineText.textContent = `Deadline ${days}`;
        } else {
          clearInterval(interval);
          deadlineText.textContent = "Deadline Over!";
        }
      }, 1000);
    }
  
    startAnimation();
  });
  