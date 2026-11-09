'use strict';
const categories = {
  speed: {units: {kt:['Knots (kt)',1],kmh:['Kilometers/hour (km/h)',1/1.852],mph:['Miles/hour (mph)',1/1.150779448],ms:['Meters/second (m/s)',1/0.514444444]},defaults:['kt','kmh'],reference:[['1 knot','1.852 km/h'],['1 knot','1.15078 mph'],['100 knots','51.4444 m/s']]},
  distance: {units:{nm:['Nautical miles (NM)',1],km:['Kilometers (km)',1/1.852],mi:['Statute miles (mi)',1/1.150779448],m:['Meters (m)',1/1852]},defaults:['nm','km'],reference:[['1 nautical mile','1.852 km'],['1 nautical mile','1.15078 statute mi'],['1 kilometer','0.539957 NM']]},
  altitude: {units:{ft:['Feet (ft)',1],m:['Meters (m)',1/3.280839895],km:['Kilometers (km)',1/3280.839895]},defaults:['ft','m'],reference:[['1 foot','0.3048 m'],['1,000 feet','304.8 m'],['1 meter','3.28084 ft']]},
  temperature:{units:{c:['Celsius (°C)',1],f:['Fahrenheit (°F)',1],k:['Kelvin (K)',1]},defaults:['c','f'],reference:[['0 °C','32 °F'],['15 °C (ISA sea level)','59 °F'],['−40 °C','−40 °F']]},
  pressure:{units:{hpa:['Hectopascals (hPa)',1],inhg:['Inches mercury (inHg)',33.8638866667],kpa:['Kilopascals (kPa)',10],mmhg:['Millimeters mercury (mmHg)',1.33322387415]},defaults:['hpa','inhg'],reference:[['1013.25 hPa (ISA)','29.9213 inHg'],['1 inHg','33.8639 hPa'],['100 kPa','1000 hPa']]}
};
const $ = id => document.getElementById(id);
let category = 'speed';
function convert(value,from,to) {
  if (!Number.isFinite(value)) return NaN;
  if (category === 'temperature') {
    const c = from === 'c' ? value : from === 'f' ? (value - 32) * 5 / 9 : value - 273.15;
    return to === 'c' ? c : to === 'f' ? c * 9 / 5 + 32 : c + 273.15;
  }
  const u = categories[category].units;
  return value * u[from][1] / u[to][1];
}
function format(n) {
  if (!Number.isFinite(n)) return '—';
  return Number(n.toPrecision(9)).toLocaleString('en-US',{maximumFractionDigits:7});
}
function refresh() {
  const raw = $('fromValue').value;
  const from = $('fromUnit').value, to = $('toUnit').value;
  const value = raw.trim() === '' ? NaN : Number(raw);
  $('toValue').value = format(convert(value,from,to));
  const sample = convert(1,from,to);
  $('formula').textContent = '1 ' + from + ' = ' + format(sample) + ' ' + to;
}
function setup(cat) {
  category = cat;
  document.querySelectorAll('.tab').forEach(b => {
    const active = b.dataset.cat === cat;
    b.classList.toggle('active',active);
    b.setAttribute('aria-selected',String(active));
  });
  const data = categories[cat];
  for (const id of ['fromUnit','toUnit']) {
    $(id).replaceChildren(...Object.entries(data.units).map(([key,[label]]) => new Option(label,key)));
  }
  [$('fromUnit').value,$('toUnit').value] = data.defaults;
  $('fromValue').value = cat === 'speed' ? '120' : cat === 'distance' ? '50' : cat === 'altitude' ? '10000' : cat === 'temperature' ? '15' : '1013.25';
  $('references').replaceChildren(...data.reference.map(([a,b]) => {
    const row = document.createElement('div'); row.className = 'reference-row';
    const l = document.createElement('span'), r = document.createElement('span');
    l.textContent = a; r.textContent = b; row.append(l,r); return row;
  }));
  refresh();
}
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click',() => setup(b.dataset.cat)));
['fromValue','fromUnit','toUnit'].forEach(id => $(id).addEventListener('input',refresh));
$('swap').addEventListener('click',() => {
  const f = $('fromUnit').value, t = $('toUnit').value;
  const raw = $('fromValue').value;
  const converted = raw.trim() === '' ? NaN : convert(Number(raw),f,t);
  $('fromUnit').value = t;
  $('toUnit').value = f;
  if (raw.trim() !== '' && Number.isFinite(converted)) $('fromValue').value = Number(converted.toPrecision(9));
  refresh();
});
$('copy').addEventListener('click',async () => {
  const value = $('toValue').value;
  if (value === '—') return;
  try {
    await navigator.clipboard.writeText(value);
    $('copy').textContent = '✓ Copied';
    setTimeout(() => $('copy').textContent = 'Copy result ↗',1500);
  } catch { $('toValue').select(); }
});
$('year').textContent = new Date().getFullYear();
setup('speed');


// Independent four-function calculator. Expressions are parsed without eval.
let expression = '';
let lastAnswer = 0;
let justEvaluated = false;
function calculate(text) {
  const tokens = text.match(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?|[+*/()%\-]/gi) || [];
  if (tokens.join('') !== text.replace(/\s/g,'')) throw Error('Invalid expression');
  let pos = 0;
  function primary() {
    const t = tokens[pos++];
    if (t === '-') return -primary();
    if (t === '+') return primary();
    if (t === '(') {
      const n = sum();
      if (tokens[pos++] !== ')') throw Error('Unclosed bracket');
      return n;
    }
    if (!t || !/^(?:\d|\.)/.test(t)) throw Error('Invalid number');
    return Number(t);
  }
  function product() {
    let n = primary();
    while (tokens[pos] === '*' || tokens[pos] === '/' || tokens[pos] === '%') {
      const op = tokens[pos++];
      const rhs = primary();
      n = op === '*' ? n * rhs : op === '/' ? n / rhs : n * rhs / 100;
    }
    return n;
  }
  function sum() {
    let n = product();
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      const op = tokens[pos++];
      const rhs = product();
      n = op === '+' ? n + rhs : n - rhs;
    }
    return n;
  }
  const result = sum();
  if (pos !== tokens.length || !Number.isFinite(result)) throw Error('Invalid calculation');
  return result;
}
function calcFormat(n) {
  return Number.isFinite(n) ? String(Number(n.toPrecision(11))) : 'Error';
}
function updateCalculator() {
  $('calcExpression').textContent = expression || '0';
  if (!expression) { $('calcDisplay').textContent = '0'; return; }
  try {
    $('calcDisplay').textContent = calcFormat(calculate(expression));
  } catch {
    $('calcDisplay').textContent = '…';
  }
}
function calcKey(key) {
  if (key === 'clear') { expression = ''; justEvaluated = false; updateCalculator(); return; }
  if (key === 'back') { expression = expression.slice(0,-1); justEvaluated = false; updateCalculator(); return; }
  if (key === 'sign') {
    try { expression = String(-calculate(expression)); } catch { expression = expression ? '-(' + expression + ')' : '-'; }
    justEvaluated = false; updateCalculator(); return;
  }
  if (key === '=') {
    try {
      lastAnswer = calculate(expression);
      expression = calcFormat(lastAnswer);
      justEvaluated = true;
      updateCalculator();
    } catch { $('calcDisplay').textContent = 'Error'; }
    return;
  }
  if (!/^[0-9.+*/%\-]$/.test(key) || expression.length >= 80) return;
  if (justEvaluated && /[0-9.]/.test(key)) expression = '';
  justEvaluated = false;
  if (/[+*/]/.test(key) && (!expression || /[+*/.\-]$/.test(expression))) return;
  if (key === '.' && /(?:^|[+*/%\-])\d*\.\d*$/.test(expression)) return;
  expression += key;
  updateCalculator();
}
$('calcKeys').addEventListener('click',event => {
  const button = event.target.closest('button[data-key]');
  if (button) calcKey(button.dataset.key);
});
document.addEventListener('keydown',event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.matches('input, select, textarea, button')) return;
  const key = event.key === 'Enter' ? '=' : event.key === 'Escape' ? 'clear' : event.key === 'Backspace' ? 'back' : event.key;
  if (/^[0-9.+*/%\-=]$/.test(key) || ['clear','back'].includes(key)) {
    event.preventDefault(); calcKey(key);
  }
});
$('useResult').addEventListener('click',() => {
  try {
    const n = calculate(expression);
    $('fromValue').value = String(Number(n.toPrecision(11)));
    refresh();
    document.getElementById('converter').scrollIntoView({behavior:'smooth',block:'start'});
  } catch { $('calcDisplay').textContent = 'Error'; }
});
