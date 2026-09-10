export class InputController {
  constructor(inputEl, ui, commands) {
    this.inputEl = inputEl;
    this.ui = ui;
    this.commands = commands;
    inputEl.addEventListener('keydown', event => this.handleKeydown(event));
  }

  async handleKeydown(event) {
    if (this.ui.isProcessing) return;

    if (event.key === 'Enter') {
      const rawInput = this.inputEl.value;
      this.inputEl.value = '';
      if (!rawInput.trim()) return;

      this.ui.print(`${this.ui.promptEl.textContent} ${rawInput}`);
      this.ui.history.push(rawInput);
      this.ui.historyIdx = this.ui.history.length;

      const tokens = rawInput.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      const commandName = tokens[0].toLowerCase();
      const args = tokens.slice(1).map(argument => argument.replace(/^"|"$/g, ''));
      const command = this.commands[commandName];

      if (!command) {
        this.ui.print(`Command not recognized: '${commandName}'`, 'warn');
        return;
      }

      this.ui.isProcessing = true;
      this.inputEl.disabled = true;
      try {
        await command(args);
      } catch (error) {
        this.ui.print(`Execution error: ${error.message}`, 'warn');
      }
      this.inputEl.disabled = false;
      this.ui.isProcessing = false;
      this.inputEl.focus();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.ui.historyIdx > 0) {
        this.ui.historyIdx -= 1;
        this.inputEl.value = this.ui.history[this.ui.historyIdx];
      }
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.ui.historyIdx < this.ui.history.length - 1) {
        this.ui.historyIdx += 1;
        this.inputEl.value = this.ui.history[this.ui.historyIdx];
      } else {
        this.ui.historyIdx = this.ui.history.length;
        this.inputEl.value = '';
      }
    }
  }
}
