const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export function createNetworkCommands(context) {
  const { ui, network, trace, missions, checkWinState } = context;

  return {
    probe: async args => {
      const targetIp = args[0] || trace.currentIp;
      if (!network.has(targetIp)) return ui.print(`Host ${targetIp} not found.`, 'warn');

      ui.print(`Initiating port probe on target [${targetIp}]...`);
      for (let step = 1; step <= 5; step += 1) {
        await delay(120);
        ui.printReplace(`PROBE: [${'='.repeat(step * 4)}${' '.repeat(20 - step * 4)}] ${step * 20}%`);
      }

      const node = network.get(targetIp);
      ui.print(`\nPROBE COMPLETE FOR ${node.hostname} (${targetIp}):`);
      node.ports.forEach(port => ui.print(`  PORT ${port}: OPEN`));

      const objectiveId = targetIp === '192.168.1.104' ? 'probe_bank' : targetIp === '10.0.99.1' ? 'probe_military' : null;
      if (objectiveId && missions.completeObjective(objectiveId)) {
        ui.print(`\n[OBJECTIVE UPDATED] Probed ${node.hostname}!`, 'warn');
        checkWinState();
      }
      if (missions.completeAction('probe')) checkWinState();
    },

    bounce: async args => {
      if (!args[0]) return ui.print('Usage: bounce <IP>');
      const result = network.addProxy(args[0]);
      if (!result.success) {
        return ui.print(result.reason === 'duplicate'
          ? `Proxy ${args[0]} already present in route.`
          : `[ERROR] IP '${args[0]}' is not an open proxy node.`, 'warn');
      }
      ui.print(`[PROXY ADDED] Active Chain: Localhost -> ${network.bounceChain.join(' -> ')}`);
      const objectiveId = args[0] === '10.0.8.2' ? 'add_proxy_us' : args[0] === '10.0.8.9' ? 'add_proxy_eu' : null;
      if (objectiveId && missions.completeObjective(objectiveId)) {
        ui.print('[OBJECTIVE UPDATED] Relay added to active route.', 'warn');
        checkWinState();
      }
      if (missions.completeAction('bounce')) checkWinState();
    },

    connect: async args => {
      if (!args[0]) return ui.print('Usage: connect <IP>');
      const targetIp = args[0];
      if (!network.has(targetIp)) return ui.print(`[ERROR] Connection failed: Target IP ${targetIp} unreachable.`, 'alert');

      const route = network.bounceChain.length ? `${network.bounceChain.join(' -> ')} -> ${targetIp}` : targetIp;
      ui.print(`Establishing route via: Localhost -> ${route}...`);
      await delay(500);
      if (!trace.connect(targetIp)) return;

      const node = network.get(targetIp);
      ui.print(`[CONNECTED] Session active on ${node.hostname}.`, 'warn');
      const relayObjective = targetIp === '10.0.8.2' ? 'connect_proxy_us' : targetIp === '10.0.8.9' ? 'connect_proxy_eu' : null;
      if (relayObjective && missions.completeObjective(relayObjective)) {
        ui.print('[OBJECTIVE UPDATED] Relay connection established.', 'warn');
        checkWinState();
      }
      if (missions.completeAction('connect')) checkWinState();
      if (node.baseTraceRate > 0) {
        ui.print(`WARNING: Security active! Base Trace: ${node.baseTraceRate}%/s | Effective Trace: ${trace.currentEffectiveRate.toFixed(1)}%/s (${network.bounceChain.length} Proxies)`);
      } else {
        ui.print('Secure Proxy Node. Trace inactive.');
      }
      ui.setPrompt(trace.currentIp, trace.getActiveVFS().getAbsolutePath(), network);
    },

    disconnect: async () => {
      if (trace.currentIp === '127.0.0.1') return ui.print('Already connected to localhost.');
      const disconnectedIp = trace.currentIp;
      trace.disconnect();
      network.bounceChain.length = 0;
      ui.print('[DISCONNECTED] Session terminated. Route chain reset.');
      ui.setPrompt(trace.currentIp, trace.getActiveVFS().getAbsolutePath(), network);

      const disconnectObjective = disconnectedIp === '192.168.1.104'
        ? 'disconnect_bank'
        : disconnectedIp === '10.0.99.1' && missions.objectives.find(item => item.id === 'disconnect_defense')?.completed
          ? 'return_home'
          : disconnectedIp === '10.0.99.1' ? 'disconnect_defense' : null;
      if (disconnectObjective && missions.completeObjective(disconnectObjective)) {
        ui.print('[OBJECTIVE UPDATED] Clean disconnection recorded.', 'warn');
        checkWinState();
      }
      if (missions.completeAction('disconnect')) checkWinState();
    }
  };
}
