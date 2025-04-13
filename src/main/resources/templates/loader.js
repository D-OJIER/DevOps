function loadTitleScreen(containerId, url) {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        document.getElementById(containerId).innerHTML = data;
      })
      .catch(error => console.error('Error loading title screen:', error));
  }
  