export class TerminalUI {
  constructor(outputEl, promptEl, inputEl) {
    this.outputEl = outputEl;
    this.promptEl = promptEl;
    this.inputEl = inputEl;
    this.history = [];
    this.historyIdx = -1;
    this.isProcessing = false;
  }

  print(text, className = '') {
    const line = document.createElement('div');
    if (className) line.className = className;
    line.textContent = text;
    this.outputEl.appendChild(line);
    this.scrollToBottom();
  }

  printReplace(text) {
    if (this.outputEl.lastElementChild) {
      this.outputEl.lastElementChild.textContent = text;
    } else {
      this.print(text);
    }
    this.scrollToBottom();
  }

  clear() {
    this.outputEl.innerHTML = '';
  }

  setPrompt(ip, path, network) {
    const host = network.get(ip).hostname.toLowerCase();
    this.promptEl.textContent = `root@${host}:${path}#`;
  }

  scrollToBottom() {
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }
}
