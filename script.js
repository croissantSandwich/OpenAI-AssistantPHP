var interval;
let threadId = null;

var linkTargetBlankExtension = function () {
  return [
    {
      type: "html",
      regex: /<a href="(.+?)">/g,
      replace: '<a href="$1" target="_blank">',
    },
  ];
};

function updateButtonState() {
  document.getElementById("sendMessage").disabled =
    document.getElementById("messageInput").value.trim() === "";
}

document.addEventListener("DOMContentLoaded", function () {
  messageInput.addEventListener("input", updateButtonState);
  updateButtonState();
});

document
  .getElementById("messageInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("sendMessage").click();
    }
  });

document.getElementById("sendMessage").addEventListener("click", function () {
  const message = document.getElementById("messageInput").value;
  if (message.trim() === "") {
    return;
  }

  if (!threadId) {
    // First message, need to get threadId
    fetch("controller.php?action=post", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `message=${encodeURIComponent(message)}`,
    })
      .then((response) => response.json())
      .then((data) => {
        threadId = data.threadId;
        const messageId = data.messageId;
        runAssistant(threadId, messageId);
      });

    //Add the input to chat
    var chat = document.getElementById("chat");
    chat.innerHTML += `<div class="bubble right">${message}</div>`;
    document.getElementById("messageInput").value = "";
    document.getElementById("sendMessage").disabled = true;
  } else {
    continueChat(message);
  }
});

function runAssistant(threadId, messageId) {
  const chat = document.getElementById("chat");
  const sendMessageButton = document.getElementById("sendMessage");
  const loaderDiv = document.createElement("div");
  loaderDiv.className = "bubble left";
  loaderDiv.innerHTML = `<div class="loader"></div>`;
  chat.appendChild(loaderDiv);
  sendMessageButton.disabled = true;

  fetch("controller.php?action=run", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `threadId=${encodeURIComponent(
      threadId
    )}&messageId=${encodeURIComponent(messageId)}`,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      var converter = new showdown.Converter();
      converter.addExtension(linkTargetBlankExtension);
      data = converter.makeHtml(data);
      loaderDiv.innerHTML = data; // Replace loader with actual data
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      loaderDiv.remove();
    });
}

function continueChat(message) {
  // Implement the logic to continue the chat using the existing threadId
  var chat = document.getElementById("chat");
  chat.innerHTML += `<div class="bubble right">${message}</div>`;
  fetch("controller.php?action=post", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `threadId=${encodeURIComponent(
      threadId
    )}&message=${encodeURIComponent(message)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      const messageId = data.messageId;
      runAssistant(threadId, messageId);
    });

  document.getElementById("messageInput").value = "";
  document.getElementById("sendMessage").disabled = true;
}
