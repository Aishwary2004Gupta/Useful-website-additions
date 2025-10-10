
      document.addEventListener("DOMContentLoaded", function () {
        // DOM Elements
        const uploadArea = document.getElementById("uploadArea");
        const fileInput = document.getElementById("fileInput");
        const originalCanvas = document.getElementById("originalCanvas");
        const pixelCanvas = document.getElementById("pixelCanvas");
        const generateBtn = document.getElementById("generateBtn");
        const resetBtn = document.getElementById("resetBtn");
        const downloadBtn = document.getElementById("downloadBtn");
        const shareBtn = document.getElementById("shareBtn");
        const pixelSize = document.getElementById("pixelSize");
        const colorPalette = document.getElementById("colorPalette");
        const brightness = document.getElementById("brightness");
        const pixelSizeValue = document.getElementById("pixelSizeValue");
        const colorPaletteValue = document.getElementById("colorPaletteValue");
        const brightnessValue = document.getElementById("brightnessValue");
        const loadingIndicator = document.getElementById("loadingIndicator");
        const originalContainer = document.getElementById("originalContainer");
        const pixelContainer = document.getElementById("pixelContainer");
        const originalZoomIn = document.getElementById("originalZoomIn");
        const originalZoomOut = document.getElementById("originalZoomOut");
        const pixelZoomIn = document.getElementById("pixelZoomIn");
        const pixelZoomOut = document.getElementById("pixelZoomOut");
        const originalDimensions =
          document.getElementById("originalDimensions");
        const originalSize = document.getElementById("originalSize");
        const pixelDimensions = document.getElementById("pixelDimensions");
        const pixelSizeInfo = document.getElementById("pixelSizeInfo");
        const zoomInBtn = document.getElementById("zoomInBtn");
        const zoomOutBtn = document.getElementById("zoomOutBtn");
        const resetZoomBtn = document.getElementById("resetZoomBtn");

        // Canvas contexts
        const originalCtx = originalCanvas.getContext("2d");
        const pixelCtx = pixelCanvas.getContext("2d");

        // Current image
        let currentImage = null;
        let updateTimeout = null;
        let originalZoomLevel = 1;
        let pixelZoomLevel = 1;
        let isDragging = false;

        // Event Listeners
        uploadArea.addEventListener("click", () => fileInput.click());
        uploadArea.addEventListener("dragover", (e) => {
          e.preventDefault();
          uploadArea.style.borderColor = "var(--primary)";
          uploadArea.style.background = "rgba(99, 102, 241, 0.1)";
        });
        uploadArea.addEventListener("dragleave", () => {
          uploadArea.style.borderColor = "var(--card-border)";
          uploadArea.style.background = "rgba(255, 255, 255, 0.05)";
        });
        uploadArea.addEventListener("drop", (e) => {
          e.preventDefault();
          uploadArea.style.borderColor = "var(--card-border)";
          uploadArea.style.background = "rgba(255, 255, 255, 0.05)";
          if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleImageUpload();
          }
        });

        fileInput.addEventListener("change", handleImageUpload);
        generateBtn.addEventListener("click", generatePixelArt);
        resetBtn.addEventListener("click", resetControls);
        downloadBtn.addEventListener("click", downloadPixelArt);
        shareBtn.addEventListener("click", sharePixelArt);

        // Zoom controls
        originalZoomIn.addEventListener("click", () =>
          zoomCanvas("original", "in")
        );
        originalZoomOut.addEventListener("click", () =>
          zoomCanvas("original", "out")
        );
        pixelZoomIn.addEventListener("click", () => zoomCanvas("pixel", "in"));
        pixelZoomOut.addEventListener("click", () =>
          zoomCanvas("pixel", "out")
        );
        zoomInBtn.addEventListener("click", () => {
          zoomCanvas("original", "in");
          zoomCanvas("pixel", "in");
        });
        zoomOutBtn.addEventListener("click", () => {
          zoomCanvas("original", "out");
          zoomCanvas("pixel", "out");
        });
        resetZoomBtn.addEventListener("click", () => {
          originalZoomLevel = 1;
          pixelZoomLevel = 1;
          updateCanvasZoom();
        });

        // Comparison slider
        // comparisonSlider.addEventListener('mousedown', startDragging);
        document.addEventListener("mousemove", dragSlider);
        document.addEventListener("mouseup", stopDragging);

        // Update value displays and trigger real-time updates
        pixelSize.addEventListener("input", () => {
          pixelSizeValue.textContent = pixelSize.value;
          schedulePixelArtUpdate();
        });

        colorPalette.addEventListener("input", () => {
          colorPaletteValue.textContent = colorPalette.value;
          schedulePixelArtUpdate();
        });

        brightness.addEventListener("input", () => {
          brightnessValue.textContent = brightness.value;
          schedulePixelArtUpdate();
        });

        // Handle image upload
        function handleImageUpload() {
          if (!fileInput.files.length) return;

          const file = fileInput.files[0];
          const reader = new FileReader();

          // Update upload area text
          uploadArea.innerHTML = `
                    <div class="upload-icon"><i class="fas fa-spinner fa-spin"></i></div>
                    <h3>Processing Image...</h3>
                    <p>Please wait</p>
                `;

          reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
              currentImage = img;
              displayOriginalImage(img);
              generatePixelArt();

              // Reset upload area text
              uploadArea.innerHTML = `
                            <div class="upload-icon"><i class="fas fa-check-circle"></i></div>
                            <h3>Image Uploaded</h3>
                            <p>Drag & drop or click to change image</p>
                            <input type="file" id="fileInput" accept="image/*" style="display: none;">
                        `;
            };
            img.src = e.target.result;
          };

          reader.readAsDataURL(file);
        }

        // Display original image
        function displayOriginalImage(img) {
          // Set canvas size to match image (with max constraints)
          const maxWidth = 500;
          const maxHeight = 400;

          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }

          originalCanvas.width = width;
          originalCanvas.height = height;
          pixelCanvas.width = width;
          pixelCanvas.height = height;

          originalCtx.drawImage(img, 0, 0, width, height);

          // Update image info
          originalDimensions.textContent = `${width} × ${height}`;
          originalSize.textContent = `${(
            fileInput.files[0].size / 1024
          ).toFixed(1)} KB`;

          // Reset zoom levels
          originalZoomLevel = 1;
          pixelZoomLevel = 1;
          updateCanvasZoom();
        }

        // Schedule pixel art update with debouncing
        function schedulePixelArtUpdate() {
          if (updateTimeout) {
            clearTimeout(updateTimeout);
          }

          updateTimeout = setTimeout(() => {
            generatePixelArt();
          }, 300);
        }

        // Generate pixel art
        function generatePixelArt() {
          if (!currentImage) return;

          loadingIndicator.style.display = "block";

          // Use requestAnimationFrame to prevent UI blocking
          requestAnimationFrame(() => {
            const pixelSizeVal = parseInt(pixelSize.value);
            const colorCount = parseInt(colorPalette.value);
            const brightnessVal = parseInt(brightness.value);

            // Clear pixel canvas
            pixelCtx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);

            // Get image data from original canvas
            const imageData = originalCtx.getImageData(
              0,
              0,
              originalCanvas.width,
              originalCanvas.height
            );
            const data = imageData.data;

            // Process image data to create pixel art
            for (let y = 0; y < originalCanvas.height; y += pixelSizeVal) {
              for (let x = 0; x < originalCanvas.width; x += pixelSizeVal) {
                // Get the color at this position
                const pixelIndex = (y * originalCanvas.width + x) * 4;
                let r = data[pixelIndex];
                let g = data[pixelIndex + 1];
                let b = data[pixelIndex + 2];

                // Apply brightness adjustment
                if (brightnessVal !== 0) {
                  const factor = 1 + brightnessVal / 100;
                  r = Math.min(255, Math.max(0, r * factor));
                  g = Math.min(255, Math.max(0, g * factor));
                  b = Math.min(255, Math.max(0, b * factor));
                }

                // Reduce color palette if needed
                if (colorCount < 256) {
                  const factor = 255 / (colorCount - 1);
                  r = Math.round(r / factor) * factor;
                  g = Math.round(g / factor) * factor;
                  b = Math.round(b / factor) * factor;
                }

                // Draw the pixel
                pixelCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                pixelCtx.fillRect(x, y, pixelSizeVal, pixelSizeVal);
              }
            }

            // Update pixel art info
            pixelDimensions.textContent = `${pixelCanvas.width} × ${pixelCanvas.height}`;
            pixelSizeInfo.textContent = `Pixel Size: ${pixelSizeVal}`;

            loadingIndicator.style.display = "none";
          });
        }

        // Reset controls
        function resetControls() {
          pixelSize.value = 10;
          colorPalette.value = 64;
          brightness.value = 0;
          pixelSizeValue.textContent = "10";
          colorPaletteValue.textContent = "64";
          brightnessValue.textContent = "0";

          // Reset zoom
          originalZoomLevel = 1;
          pixelZoomLevel = 1;
          updateCanvasZoom();

          if (currentImage) {
            generatePixelArt();
          }
        }

        // Download pixel art
        function downloadPixelArt() {
          if (!currentImage) return;

          const link = document.createElement("a");
          link.download = "pixel-art.png";
          link.href = pixelCanvas.toDataURL("image/png");
          link.click();
        }

        // Share pixel art
        function sharePixelArt() {
          if (!currentImage) return;

          if (navigator.share) {
            pixelCanvas.toBlob((blob) => {
              const file = new File([blob], "pixel-art.png", {
                type: "image/png",
              });
              navigator.share({
                files: [file],
                title: "My Pixel Art Creation",
                text: "Check out this pixel art I created!",
              });
            });
          } else {
            // Fallback: copy to clipboard
            pixelCanvas.toBlob((blob) => {
              const item = new ClipboardItem({ "image/png": blob });
              navigator.clipboard.write([item]).then(() => {
                alert("Pixel art copied to clipboard!");
              });
            });
          }
        }

        // Zoom functionality
        function zoomCanvas(type, direction) {
          if (type === "original") {
            if (direction === "in") {
              originalZoomLevel = Math.min(originalZoomLevel + 0.5, 3);
            } else {
              originalZoomLevel = Math.max(originalZoomLevel - 0.5, 1);
            }
          } else {
            if (direction === "in") {
              pixelZoomLevel = Math.min(pixelZoomLevel + 0.5, 3);
            } else {
              pixelZoomLevel = Math.max(pixelZoomLevel - 0.5, 1);
            }
          }

          updateCanvasZoom();
        }

        function updateCanvasZoom() {
          // Update original canvas
          if (originalZoomLevel > 1) {
            originalContainer.classList.add("zoomed");
            originalCanvas.style.transform = `scale(${originalZoomLevel})`;
          } else {
            originalContainer.classList.remove("zoomed");
            originalCanvas.style.transform = "scale(1)";
          }

          // Update pixel canvas
          if (pixelZoomLevel > 1) {
            pixelContainer.classList.add("zoomed");
            pixelCanvas.style.transform = `scale(${pixelZoomLevel})`;
          } else {
            pixelContainer.classList.remove("zoomed");
            pixelCanvas.style.transform = "scale(1)";
          }
        }

        // Comparison slider functionality
        function startDragging(e) {
          isDragging = true;
          document.body.style.cursor = "col-resize";
          e.preventDefault();
        }

        function dragSlider(e) {
          if (!isDragging) return;

          const container = document.getElementById("canvasComparison");
          const containerRect = container.getBoundingClientRect();
          const x = e.clientX - containerRect.left;
          const percentage = (x / containerRect.width) * 100;

          // Limit slider movement
          if (percentage >= 10 && percentage <= 90) {
            // Adjust canvas visibility based on slider position
            const originalCanvas = document.getElementById("originalCanvas");
            const pixelCanvas = document.getElementById("pixelCanvas");

            originalCanvas.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            pixelCanvas.style.clipPath = `inset(0 0 0 ${percentage}%)`;
          }
        }

        function stopDragging() {
          isDragging = false;
          document.body.style.cursor = "default";
        }
      });
