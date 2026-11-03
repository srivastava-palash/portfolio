const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function setup() {
  const timers = new Map();
  let time = 0;
  let timerId = 0;
  class Element {
    constructor() {
      this.children = [];
      this.listeners = {};
      this.style = {};
      this.value = '';
      this.isConnected = true;
      const classes = new Set();
      this.classList = {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name)),
        contains: name => classes.has(name),
      };
    }
    appendChild(child) { this.children.push(child); }
    set innerHTML(value) { this.children = []; }
    addEventListener(event, listener) { (this.listeners[event] ??= []).push(listener); }
    removeEventListener(event, listener) {
      this.listeners[event] = (this.listeners[event] ?? []).filter(fn => fn !== listener);
    }
    dispatch(event, key) {
      for (const listener of [...(this.listeners[event] ?? [])]) listener({ key, preventDefault() {} });
    }
    remove() {
      this.isConnected = false;
      this.children.forEach(child => child.remove());
    }
    querySelectorAll() { return []; }
    focus() {}
  }
  const elements = new Map();
  const document = new Element();
  document.body = new Element();
  document.getElementById = id => {
    if (!elements.has(id)) elements.set(id, new Element());
    const element = elements.get(id);
    return element.isConnected ? element : null;
  };
  document.createElement = () => new Element();
  const overlay = document.getElementById('boot-overlay');
  overlay.appendChild(document.getElementById('boot-output'));
  overlay.appendChild(document.getElementById('boot-prompt-row'));
  overlay.appendChild(document.getElementById('skip-btn'));
  const context = vm.createContext({
    document,
    setTimeout(callback, delay = 0) {
      const id = ++timerId;
      timers.set(id, { callback, at: time + delay });
      return id;
    },
    clearTimeout: id => timers.delete(id),
  });
  vm.runInContext(readFileSync(require.resolve('../boot.js'), 'utf8'), context);
  function advance(ms) {
    const end = time + ms;
    while (true) {
      const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > end) break;
      time = next[1].at;
      timers.delete(next[0]);
      next[1].callback();
    }
    time = end;
  }
  const input = document.getElementById('dt-input');
  const output = document.getElementById('dt-body');
  return {
    document, advance, input, output,
    open() { vm.runInContext('DevopsTerminal.open()', context); advance(1000); },
    command(value) { input.value = value; input.dispatch('keydown', 'Enter'); },
    text() { return output.children.map(el => el.textContent).join('\n'); },
  };
}

test('skipping the boot screen cancels later DOM updates', () => {
  const app = setup();
  app.document.dispatch('DOMContentLoaded');
  app.document.dispatch('keydown', 'Escape');
  assert.doesNotThrow(() => app.advance(10000));
});

test('the boot prompt waits until all mode options have appeared', () => {
  const app = setup();
  app.document.dispatch('DOMContentLoaded');
  app.advance(1800);
  assert.notEqual(app.document.getElementById('boot-prompt-row').style.display, 'flex');
  app.advance(2000);
  assert.equal(app.document.getElementById('boot-prompt-row').style.display, 'flex');
});

test('prototype property names are rejected as commands and files', () => {
  const app = setup();
  app.open();
  app.command('__proto__');
  app.command('cat constructor');
  assert.match(app.text(), /command not found: __proto__/);
  assert.match(app.text(), /cat: constructor: No such file/);
});

test('clear cancels queued command output', () => {
  const app = setup();
  app.open();
  app.command('help');
  app.command('clear');
  app.advance(10000);
  assert.equal(app.text(), '');
});

test('closing cancels a deployment animation and reopening binds input once', () => {
  const app = setup();
  app.open();
  app.command('deploy');
  assert.equal(app.input.disabled, true);
  app.document.getElementById('dt-exit').dispatch('click');
  const text = app.text();
  app.advance(20000);
  assert.equal(app.text(), text);
  assert.equal(app.input.disabled, false);
  app.open();
  assert.equal(app.document.getElementById('devops-terminal').classList.contains('dt-exit'), false);
  app.command('whoami');
  assert.equal(app.output.children.filter(el => el.className === 'dt-line dt-cmd').length, 1);
});
