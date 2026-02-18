(function () {
  const CONFIG = {
    PREVIEW_SIZE: 250,
    LOADING_THRESHOLD: 500,
    BORDER_SIZE: 100,
    STORAGE_KEY: 'qrGeneratorSettings',
    SAVE_DELAY_MS: 50,
    SAVE_DELAY_LARGE_MS: 150,
    SAVE_POLL_MAX_MS: 2000,
    SAVE_POLL_INTERVAL_MS: 50,
    DEFAULTS: {
      colorDark: '#000000',
      colorLight: '#ffffff',
      size: 200,
      darkMode: false
    }
  };

  const elements = {
    textInput: document.getElementById('textInput'),
    colorDark: document.getElementById('colorDark'),
    colorLight: document.getElementById('colorLight'),
    colorDarkValue: document.getElementById('colorDarkValue'),
    colorLightValue: document.getElementById('colorLightValue'),
    sizeSlider: document.getElementById('sizeSlider'),
    sizeDisplay: document.getElementById('sizeDisplay'),
    addBorder: document.getElementById('addBorder'),
    qrcode: document.getElementById('qrcode'),
    qrcodeStatus: document.getElementById('qrcodeStatus'),
    saveBtn: document.getElementById('saveBtn'),
    generateBtn: document.getElementById('generateBtn'),
    themeToggle: document.getElementById('themeToggle'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    validationMessage: document.getElementById('validationMessage')
  };

  function saveSettings() {
    const settings = {
      colorDark: elements.colorDark.value,
      colorLight: elements.colorLight.value,
      size: elements.sizeSlider.value,
      addBorder: elements.addBorder.checked,
      darkMode: document.body.classList.contains('dark-mode')
    };
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(settings));
  }

  function loadSettings() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        elements.colorDark.value = settings.colorDark || CONFIG.DEFAULTS.colorDark;
        elements.colorLight.value = settings.colorLight || CONFIG.DEFAULTS.colorLight;
        elements.sizeSlider.value = settings.size || CONFIG.DEFAULTS.size;
        elements.addBorder.checked = settings.addBorder || false;
        if (settings.darkMode) {
          document.body.classList.add('dark-mode');
          elements.themeToggle.setAttribute('aria-label', 'Switch to light mode');
          elements.themeToggle.textContent = '☀️';
        }
        updateDisplayValues();
      } catch (e) {
        updateDisplayValues();
      }
    }
  }

  function updateDisplayValues() {
    elements.colorDarkValue.textContent = elements.colorDark.value;
    elements.colorLightValue.textContent = elements.colorLight.value;
    elements.sizeDisplay.textContent = `${elements.sizeSlider.value} x ${elements.sizeSlider.value} px`;
  }

  function showValidationMessage(message) {
    if (elements.validationMessage) {
      elements.validationMessage.textContent = message;
      elements.validationMessage.classList.add('visible');
    }
  }

  function hideValidationMessage() {
    if (elements.validationMessage) {
      elements.validationMessage.textContent = '';
      elements.validationMessage.classList.remove('visible');
    }
  }

  function announceQrStatus(message) {
    if (elements.qrcodeStatus) {
      elements.qrcodeStatus.textContent = message;
    }
  }

  function showLoading() {
    elements.loadingOverlay.classList.add('active');
  }

  function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
  }

  function getOptions(size) {
    size = size === undefined ? CONFIG.PREVIEW_SIZE : size;
    return {
      text: elements.textInput.value,
      width: size,
      height: size,
      colorDark: elements.colorDark.value,
      colorLight: elements.colorLight.value,
      correctLevel: QRCode.CorrectLevel.H
    };
  }

  function slugForFilename(text, maxLen) {
    maxLen = maxLen || 30;
    var s = text.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (s.length > maxLen) s = s.slice(0, maxLen);
    return s || 'qrcode';
  }

  function generateQR() {
    const text = elements.textInput.value.trim();

    if (!text) {
      showValidationMessage('Please enter some text or URL');
      return;
    }
    hideValidationMessage();

    elements.qrcode.innerHTML = '';
    if (elements.qrcodeStatus) elements.qrcodeStatus.textContent = '';
    const options = getOptions(CONFIG.PREVIEW_SIZE);
    new QRCode(elements.qrcode, options);

    elements.saveBtn.style.display = 'block';
    announceQrStatus('QR code generated');
    saveSettings();
  }

  function drawBorder(source, downloadSize) {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = downloadSize + (CONFIG.BORDER_SIZE * 2);
    finalCanvas.height = downloadSize + (CONFIG.BORDER_SIZE * 2);
    const ctx = finalCanvas.getContext('2d');
    ctx.fillStyle = elements.colorLight.value;
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(source, CONFIG.BORDER_SIZE, CONFIG.BORDER_SIZE);
    return finalCanvas.toDataURL('image/png');
  }

  function waitForQrElement(container, maxWaitMs) {
    maxWaitMs = maxWaitMs || CONFIG.SAVE_POLL_MAX_MS;
    const interval = CONFIG.SAVE_POLL_INTERVAL_MS;
    return new Promise(function (resolve) {
      var elapsed = 0;
      var t = setInterval(function () {
        var canvas = container.querySelector('canvas');
        var img = container.querySelector('img');
        if (canvas || img) {
          clearInterval(t);
          resolve(canvas || img);
          return;
        }
        elapsed += interval;
        if (elapsed >= maxWaitMs) {
          clearInterval(t);
          resolve(null);
        }
      }, interval);
    });
  }

  function saveQR() {
    const text = elements.textInput.value.trim();
    if (!text) {
      showValidationMessage('Please enter some text or URL');
      return;
    }
    hideValidationMessage();

    const downloadSize = parseInt(elements.sizeSlider.value, 10);
    const addBorder = elements.addBorder.checked;
    const isLargeQR = downloadSize > CONFIG.LOADING_THRESHOLD;

    if (isLargeQR) showLoading();

    const tempContainer = document.createElement('div');
    const options = getOptions(downloadSize);

    try {
      new QRCode(tempContainer, options);
      const delay = isLargeQR ? CONFIG.SAVE_DELAY_LARGE_MS : CONFIG.SAVE_DELAY_MS;

      setTimeout(function () {
        waitForQrElement(tempContainer).then(function (source) {
          if (!source) {
            hideLoading();
            console.error('QR code element not found after wait');
            alert('QR code could not be generated. Try a shorter text or smaller size.');
            return;
          }
          var dataUrl;
          try {
            dataUrl = addBorder ? drawBorder(source, downloadSize) : (source.tagName === 'CANVAS' ? source.toDataURL('image/png') : source.src);
          } catch (e) {
            hideLoading();
            console.error(e);
            alert('QR code could not be generated. Try a shorter text or smaller size.');
            return;
          }
          var slug = slugForFilename(text);
          var filename = 'qrcode-' + slug + '-' + downloadSize + 'px.png';
          var link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.click();
          hideLoading();
        });
      }, delay);
    } catch (error) {
      hideLoading();
      console.error(error);
      var msg = (error && error.message && error.message.indexOf('Too long') !== -1)
        ? 'Content is too long for a QR code. Try shorter text or a lower error correction level.'
        : 'QR code could not be generated. Try a shorter text or a smaller size.';
      alert(msg);
    }
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    var isDark = document.body.classList.contains('dark-mode');
    elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
    elements.themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    saveSettings();
  }

  function init() {
    elements.generateBtn.addEventListener('click', generateQR);
    elements.saveBtn.addEventListener('click', saveQR);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.sizeSlider.addEventListener('input', function () {
      updateDisplayValues();
      saveSettings();
    });
    elements.colorDark.addEventListener('input', function () {
      updateDisplayValues();
      saveSettings();
    });
    elements.colorLight.addEventListener('input', function () {
      updateDisplayValues();
      saveSettings();
    });
    elements.textInput.addEventListener('input', hideValidationMessage);
    elements.textInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') generateQR();
    });
    loadSettings();
    if (elements.themeToggle && !document.body.classList.contains('dark-mode')) {
      elements.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  init();
})();
