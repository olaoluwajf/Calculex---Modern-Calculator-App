class Calculator{
constructor (previousOperandTextElement, currentOperandTextElement) {
this.previousOperandTextElement = previousOperandTextElement
this.currentOperandTextElement = currentOperandTextElement
this.clear()
this.loadHistoryFromStorage()
}
clear () {
this.currentOperand = '';
this.previousOperand = '';
this.operation = undefined;
}
delete () {
this.currentOperand = this.currentOperand.toString().slice(0, -1)
}
appendNumber (number) {
if (number === '.' && this.currentOperand.includes('.')) return //to enable a user type "." once
this.currentOperand = this.currentOperand.toString() + number.toString()
}
chooseOperation(operation) {
if (this.currentOperand === '') return
if (this.previousOperand !== '') {
this.compute()
}
this.operation = operation
this.previousOperand = this.currentOperand
this.currentOperand = ''
}
compute () {
let computation
const prev = parseFloat(this.previousOperand)
const current = parseFloat(this.currentOperand)
if (isNaN(prev) || isNaN(current)) return
switch (this.operation) {
case '+':
computation = prev + current
break
case '-':
computation = prev - current
break
case '*':
computation = prev * current
break
case '÷':
    computation = prev / current
    break
    default:
        return
}
this.currentOperand = computation
this.operation = undefined
this.previousOperand = ''
}

getDisplayNumber(number){
const stringNumber = number.toString()
const integerDigits = parseFloat(stringNumber.split('.')[0])
const decimalDigits = stringNumber.split('.')[1]
let integerDisplay
if (isNaN(integerDigits)) {
integerDisplay = ''
} else {
integerDisplay = integerDigits.toLocaleString('en', {
maximumFractionDigits: 0
})
}
if (decimalDigits != null) {
return `${integerDisplay}.${decimalDigits}`
}else {
return integerDisplay
}
}
updateDisplay () {
    this.currentOperandTextElement.innerText = 
    this.getDisplayNumber(this.currentOperand) 
    if (this.operation != null) {
        this.previousOperandTextElement.innerText = 
        `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
    } else {
        this.previousOperandTextElement.innerText = ''
    }
}

addToHistory(expression, result) {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    const li = document.createElement('li');
    li.textContent = `${expression} = ${result}`;
    historyList.prepend(li);

    // Save to localStorage
    let history = JSON.parse(localStorage.getItem('calc-history') || '[]');
    history.unshift({ expression, result });
    localStorage.setItem('calc-history', JSON.stringify(history));
}

loadHistoryFromStorage() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    historyList.innerHTML = '';
    let history = JSON.parse(localStorage.getItem('calc-history') || '[]');
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.expression} = ${item.result}`;
        historyList.appendChild(li);
    });
}

clearHistory() {
    localStorage.removeItem('calc-history');
    const historyList = document.getElementById('history-list');
    if (historyList) historyList.innerHTML = '';
}
}
const numberButtons = document.querySelectorAll('[data-number]') //To get the number buttons
const operationButtons = document.querySelectorAll('[data-operation]') //To get the operators
const deleteButton = document.querySelector('[data-delete]')
const allClearButton = document.querySelector('[data-all-clear]')
const equalsButton = document.querySelector('[data-equals]')
const previousOperandTextElement = document.querySelector('[data-pre-operand]')
const currentOperandTextElement = document.querySelector('[data-cnt-operand]')
const calculator = new Calculator (previousOperandTextElement, currentOperandTextElement)
numberButtons.forEach(button => {
button.addEventListener('click', () => {
calculator.appendNumber(button.innerText)
calculator.updateDisplay()
})
}
)
operationButtons.forEach(button => {
button.addEventListener('click', () => {
calculator.chooseOperation(button.innerText)
calculator.updateDisplay()
})
}
)
equalsButton.addEventListener('click', button => {
    // Save operands and operation before compute (since compute clears them)
    const prev = calculator.previousOperand;
    const op = calculator.operation;
    const curr = calculator.currentOperand;
    calculator.compute();
    calculator.updateDisplay();
    // Only add to history if a valid operation was performed
    if (prev !== '' && op != null && curr !== '') {
        const expression = `${prev} ${op} ${curr}`;
        calculator.addToHistory(expression, calculator.currentOperand);
    }
})
allClearButton.addEventListener('click', button => {
calculator.clear()
calculator.updateDisplay()
})
deleteButton.addEventListener('click', button => {
calculator.delete()
calculator.updateDisplay()
})
// Add event listener for clear history button
const clearHistoryBtn = document.getElementById('clear-history-btn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        calculator.clearHistory();
    });
}

// Responsive history toggle for mobile
const toggleHistoryBtn = document.getElementById('toggle-history-btn');
const historyPanel = document.getElementById('history-panel');
if (toggleHistoryBtn && historyPanel) {
    toggleHistoryBtn.addEventListener('click', () => {
        historyPanel.classList.toggle('open');
    });
}

document.addEventListener('keydown', (event) => {
    // Ignore if focused on an input or textarea
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

    const key = event.key;
    if (!isNaN(key)) {
        // Number keys
        calculator.appendNumber(key);
        calculator.updateDisplay();
    } else if (key === '.' || key === ',') {
        calculator.appendNumber('.');
        calculator.updateDisplay();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        // Map '/' to '÷' if that's your button
        const op = key === '/' ? '÷' : key;
        calculator.chooseOperation(op);
        calculator.updateDisplay();
    } else if (key === 'Enter' || key === '=') {
        // Equals
        const prev = calculator.previousOperand;
        const op = calculator.operation;
        const curr = calculator.currentOperand;
        calculator.compute();
        calculator.updateDisplay();
        if (prev !== '' && op != null && curr !== '') {
            const expression = `${prev} ${op} ${curr}`;
            calculator.addToHistory(expression, calculator.currentOperand);
        }
    } else if (key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    } else if (key.toLowerCase() === 'c') {
        calculator.clear();
        calculator.updateDisplay();
    }
});