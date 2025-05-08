document.addEventListener("DOMContentLoaded", () => {
    // Theme toggle functionality
    const themeToggle = document.querySelector(".theme-toggle")
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme")
      localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light")
    })
  
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme")
    }
  
    // Mobile sidebar toggle
    const createSidebarToggle = () => {
      const toggleButton = document.createElement("button")
      toggleButton.className = "sidebar-toggle"
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `
      toggleButton.style.cssText = `
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: transparent;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        z-index: 20;
        display: none;
      `
  
      document.body.appendChild(toggleButton)
  
      toggleButton.addEventListener("click", () => {
        const sidebar = document.querySelector(".chat-sidebar")
        sidebar.classList.toggle("open")
      })
  
      // Show/hide toggle based on screen size
      const updateToggleVisibility = () => {
        if (window.innerWidth <= 768) {
          toggleButton.style.display = "block"
        } else {
          toggleButton.style.display = "none"
          document.querySelector(".chat-sidebar").classList.remove("open")
        }
      }
  
      window.addEventListener("resize", updateToggleVisibility)
      updateToggleVisibility()
    }
  
    createSidebarToggle()
  
    // Auto-resize textarea
    const textarea = document.getElementById("prompt")
    textarea.addEventListener("input", function () {
      this.style.height = "auto"
      this.style.height = this.scrollHeight + "px"
    })
  })
  
  async function enviar() {
    const prompt = document.getElementById("prompt").value.trim()
    if (!prompt) return
  
    const chatBox = document.getElementById("chat-box")
    const resposta = document.getElementById("resposta")
    resposta.textContent = "Carregando..."
  
    // Remove welcome message if present
    const welcomeMessage = document.querySelector(".welcome-message")
    if (welcomeMessage) {
      welcomeMessage.remove()
    }
  
    // Create message container for user message
    const userMessageContainer = document.createElement("div")
    userMessageContainer.classList.add("message-container")
  
    // Add message header
    const userHeader = document.createElement("div")
    userHeader.classList.add("message-header")
    userHeader.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span>Você</span>
    `
    userMessageContainer.appendChild(userHeader)
  
    // Add user message
    const userMessage = document.createElement("div")
    userMessage.classList.add("user-message")
    userMessage.textContent = prompt
    userMessageContainer.appendChild(userMessage)
  
    chatBox.appendChild(userMessageContainer)
  
    // Reset textarea height
    const textarea = document.getElementById("prompt")
    textarea.value = ""
    textarea.style.height = "auto"
  
    // Scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight
  
    try {
      // Create message container for AI response
      const lmMessageContainer = document.createElement("div")
      lmMessageContainer.classList.add("message-container")
  
      // Add message header
      const lmHeader = document.createElement("div")
      lmHeader.classList.add("message-header")
      lmHeader.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.29 7 12 12 20.71 7"></polyline>
          <line x1="12" y1="22" x2="12" y2="12"></line>
        </svg>
        <span>Chat</span>
      `
      lmMessageContainer.appendChild(lmHeader)
  
      // Add AI message with loading indicator
      const lmMessage = document.createElement("div")
      lmMessage.classList.add("lm-message")
      lmMessage.textContent = "Pensando..."
      lmMessageContainer.appendChild(lmMessage)
  
      chatBox.appendChild(lmMessageContainer)
      chatBox.scrollTop = chatBox.scrollHeight
  
      // Call the backend
      const response = await fetch("proxy.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
  
      const data = await response.json()
  
      // Update the AI message with the response
      lmMessage.innerHTML = data.html || data.resposta || "Erro na resposta."
  
      // Add copy button
      const copyBtn = document.createElement("button")
      copyBtn.classList.add("copy-btn")
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `
      copyBtn.title = "Copiar"
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(data.resposta)
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          `
        }, 2000)
      }
      lmMessage.appendChild(copyBtn)
    } catch (error) {
      const errorMessageContainer = document.createElement("div")
      errorMessageContainer.classList.add("message-container")
  
      const errorHeader = document.createElement("div")
      errorHeader.classList.add("message-header")
      errorHeader.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.29 7 12 12 20.71 7"></polyline>
          <line x1="12" y1="22" x2="12" y2="12"></line>
        </svg>
        <span>LM Studio</span>
      `
      errorMessageContainer.appendChild(errorHeader)
  
      const errorMessage = document.createElement("div")
      errorMessage.classList.add("lm-message")
      errorMessage.textContent = "Erro ao conectar com o servidor."
      errorMessageContainer.appendChild(errorMessage)
  
      chatBox.appendChild(errorMessageContainer)
    }
  
    // Scroll to the bottom and clear loading indicator
    chatBox.scrollTop = chatBox.scrollHeight
    resposta.textContent = ""
  }
  