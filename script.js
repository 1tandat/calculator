// Calculator state
let state = {
    value: null,
    displayValue: '0',
    operator: null,
    waitingForOperand: false
};

// Calculator operations
const CalculatorOperations = {
    '/': (prevValue, nextValue) => prevValue / nextValue,
    '*': (prevValue, nextValue) => prevValue * nextValue,
    '+': (prevValue, nextValue) => prevValue + nextValue,
    '-': (prevValue, nextValue) => prevValue - nextValue,
    '=': (prevValue, nextValue) => nextValue
};

// Function to create calculator UI
function createCalculator() {
    const app = document.getElementById('app');
    
    // Create calculator container
    const calculator = document.createElement('div');
    calculator.className = 'calculator';
    
    // Create display
    const display = document.createElement('div');
    display.className = 'calculator-display';
    display.textContent = state.displayValue;
    calculator.appendChild(display);
    
    // Create keypad
    const keypad = document.createElement('div');
    keypad.className = 'calculator-keypad';
    
    // Input keys (function keys + digit keys)
    const inputKeys = document.createElement('div');
    inputKeys.className = 'input-keys';
    
    // Function keys
    const functionKeys = document.createElement('div');
    functionKeys.className = 'function-keys';
    functionKeys.innerHTML = `
        <button class="calculator-key key-clear">AC</button>
        <button class="calculator-key key-sign">±</button>
        <button class="calculator-key key-percent">%</button>
    `;
    inputKeys.appendChild(functionKeys);
    
    // Digit keys
    const digitKeys = document.createElement('div');
    digitKeys.className = 'digit-keys';
    digitKeys.innerHTML = `
        <button class="calculator-key key-0">0</button>
        <button class="calculator-key key-dot">●</button>
        <button class="calculator-key key-1">1</button>
        <button class="calculator-key key-2">2</button>
        <button class="calculator-key key-3">3</button>
        <button class="calculator-key key-4">4</button>
        <button class="calculator-key key-5">5</button>
        <button class="calculator-key key-6">6</button>
        <button class="calculator-key key-7">7</button>
        <button class="calculator-key key-8">8</button>
        <button class="calculator-key key-9">9</button>
    `;
    inputKeys.appendChild(digitKeys);
    
    keypad.appendChild(inputKeys);
    
    // Operator keys
    const operatorKeys = document.createElement('div');
    operatorKeys.className = 'operator-keys';
    operatorKeys.innerHTML = `
        <button class="calculator-key key-divide">÷</button>
        <button class="calculator-key key-multiply">×</button>
        <button class="calculator-key key-subtract">−</button>
        <button class="calculator-key key-add">+</button>
        <button class="calculator-key key-equals">=</button>
    `;
    keypad.appendChild(operatorKeys);
    
    calculator.appendChild(keypad);
    app.appendChild(calculator);
}

// Update display
function updateDisplay() {
    const display = document.querySelector('.calculator-display');
    const language = navigator.language || 'en-US';
    let formattedValue = parseFloat(state.displayValue).toLocaleString(language, {
        useGrouping: true,
        maximumFractionDigits: 6
    });

    const match = state.displayValue.match(/\.\d*?(0*)$/);
    if (match) {
        formattedValue += (/[1-9]/).test(match[0]) ? match[1] : match[0];
    }

    display.textContent = formattedValue;

    // Auto-scaling
    const displayWidth = display.offsetWidth;
    const textWidth = display.scrollWidth;
    const scale = displayWidth / textWidth;
    if (scale < 1) {
        display.style.transform = `scale(${scale}, ${scale})`;
        display.style.transformOrigin = 'right';
    } else {
        display.style.transform = 'scale(1, 1)';
    }
}

// Calculator logic functions
function clearAll() {
    state = {
        value: null,
        displayValue: '0',
        operator: null,
        waitingForOperand: false
    };
    updateDisplay();
}

function clearDisplay() {
    state.displayValue = '0';
    updateDisplay();
}

function clearLastChar() {
    state.displayValue = state.displayValue.substring(0, state.displayValue.length - 1) || '0';
    updateDisplay();
}

function toggleSign() {
    const newValue = parseFloat(state.displayValue) * -1;
    state.displayValue = String(newValue);
    updateDisplay();
}

function inputPercent() {
    const currentValue = parseFloat(state.displayValue);
    if (currentValue === 0) return;
    const fixedDigits = state.displayValue.replace(/^-?\d*\.?/, '');
    const newValue = currentValue / 100;
    state.displayValue = String(newValue.toFixed(fixedDigits.length + 2));
    updateDisplay();
}

function inputDot() {
    if (!(/\./).test(state.displayValue)) {
        state.displayValue += '.';
        state.waitingForOperand = false;
        updateDisplay();
    }
}

function inputDigit(digit) {
    if (state.waitingForOperand) {
        state.displayValue = String(digit);
        state.waitingForOperand = false;
    } else {
        state.displayValue = state.displayValue === '0' ? String(digit) : state.displayValue + digit;
    }
    updateDisplay();
}

function performOperation(nextOperator) {
    const inputValue = parseFloat(state.displayValue);
    if (state.value == null) {
        state.value = inputValue;
    } else if (state.operator) {
        const currentValue = state.value || 0;
        const newValue = CalculatorOperations[state.operator](currentValue, inputValue);
        state.value = newValue;
        state.displayValue = String(newValue);
    }
    state.waitingForOperand = true;
    state.operator = nextOperator;
    updateDisplay();
}

// Event handlers
function handleKeyDown(event) {
    let { key } = event;
    if (key === 'Enter') key = '=';

    if ((/\d/).test(key)) {
        event.preventDefault();
        inputDigit(parseInt(key, 10));
    } else if (key in CalculatorOperations) {
        event.preventDefault();
        performOperation(key);
    } else if (key === '.') {
        event.preventDefault();
        inputDot();
    } else if (key === '%') {
        event.preventDefault();
        inputPercent();
    } else if (key === 'Backspace') {
        event.preventDefault();
        clearLastChar();
    } else if (key === 'Clear') {
        event.preventDefault();
        if (state.displayValue !== '0') {
            clearDisplay();
        } else {
            clearAll();
        }
    }
}

function handleClick(event) {
    const target = event.target;
    if (!target.classList.contains('calculator-key')) return;

    if (target.classList.contains('key-clear')) {
        if (state.displayValue !== '0') {
            clearDisplay();
            target.textContent = 'AC';
        } else {
            clearAll();
        }
    } else if (target.classList.contains('key-sign')) {
        toggleSign();
    } else if (target.classList.contains('key-percent')) {
        inputPercent();
    } else if (target.classList.contains('key-dot')) {
        inputDot();
    } else if (target.classList.contains('key-0')) {
        inputDigit(0);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-1')) {
        inputDigit(1);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-2')) {
        inputDigit(2);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-3')) {
        inputDigit(3);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-4')) {
        inputDigit(4);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-5')) {
        inputDigit(5);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-6')) {
        inputDigit(6);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-7')) {
        inputDigit(7);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-8')) {
        inputDigit(8);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-9')) {
        inputDigit(9);
        document.querySelector('.key-clear').textContent = 'C';
    } else if (target.classList.contains('key-divide')) {
        performOperation('/');
    } else if (target.classList.contains('key-multiply')) {
        performOperation('*');
    } else if (target.classList.contains('key-subtract')) {
        performOperation('-');
    } else if (target.classList.contains('key-add')) {
        performOperation('+');
    } else if (target.classList.contains('key-equals')) {
        performOperation('=');
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', () => {
    createCalculator();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
});