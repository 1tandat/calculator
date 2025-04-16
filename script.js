const { Component } = React;
const { render } = ReactDOM;

class AutoScalingText extends Component {
    state = {
        scale: 1
    };

    componentDidUpdate() {
        const { scale } = this.state;
        const node = this.node;
        const parentNode = node.parentNode;

        const availableWidth = parentNode.offsetWidth;
        const actualWidth = node.offsetWidth;
        const actualScale = availableWidth / actualWidth;

        if (scale === actualScale) return;

        if (actualScale < 1) {
            this.setState({ scale: actualScale });
        } else if (scale < 1) {
            this.setState({ scale: 1 });
        }
    }

    render() {
        const { scale } = this.state;
        return React.createElement(
            'div',
            {
                className: 'auto-scaling-text',
                style: { transform: `scale(${scale},${scale})` },
                ref: node => this.node = node
            },
            this.props.children
        );
    }
}

class CalculatorDisplay extends Component {
    render() {
        const { value, ...props } = this.props;
        const language = navigator.language || 'en-US';
        let formattedValue = parseFloat(value).toLocaleString(language, {
            useGrouping: true,
            maximumFractionDigits: 6
        });

        const match = value.match(/\.\d*?(0*)$/);
        if (match) {
            formattedValue += (/[1-9]/).test(match[0]) ? match[1] : match[0];
        }

        return React.createElement(
            'div',
            { className: 'calculator-display', ...props },
            React.createElement(AutoScalingText, null, formattedValue)
        );
    }
}

class CalculatorKey extends Component {
    render() {
        const { onClick, className, children, ...props } = this.props;
        return React.createElement(
            'button',
            { className: `calculator-key ${className}`, onClick: onClick, ...props },
            children
        );
    }
}

const CalculatorOperations = {
    '/': (prevValue, nextValue) => prevValue / nextValue,
    '*': (prevValue, nextValue) => prevValue * nextValue,
    '+': (prevValue, nextValue) => prevValue + nextValue,
    '-': (prevValue, nextValue) => prevValue - nextValue,
    '=': (prevValue, nextValue) => nextValue
};

class Calculator extends Component {
    state = {
        value: null,
        displayValue: '0',
        operator: null,
        waitingForOperand: false
    };

    clearAll() {
        this.setState({
            value: null,
            displayValue: '0',
            operator: null,
            waitingForOperand: false
        });
    }

    clearDisplay() {
        this.setState({
            displayValue: '0'
        });
    }

    clearLastChar() {
        const { displayValue } = this.state;
        this.setState({
            displayValue: displayValue.substring(0, displayValue.length - 1) || '0'
        });
    }

    toggleSign() {
        const { displayValue } = this.state;
        const newValue = parseFloat(displayValue) * -1;
        this.setState({
            displayValue: String(newValue)
        });
    }

    inputPercent() {
        const { displayValue } = this.state;
        const currentValue = parseFloat(displayValue);
        if (currentValue === 0) return;

        const fixedDigits = displayValue.replace(/^-?\d*\.?/, '');
        const newValue = parseFloat(displayValue) / 100;
        this.setState({
            displayValue: String(newValue.toFixed(fixedDigits.length + 2))
        });
    }

    inputDot() {
        const { displayValue } = this.state;
        if (!(/\./).test(displayValue)) {
            this.setState({
                displayValue: displayValue + '.',
                waitingForOperand: false
            });
        }
    }

    inputDigit(digit) {
        const { displayValue, waitingForOperand } = this.state;
        if (waitingForOperand) {
            this.setState({
                displayValue: String(digit),
                waitingForOperand: false
            });
        } else {
            this.setState({
                displayValue: displayValue === '0' ? String(digit) : displayValue + digit
            });
        }
    }

    performOperation(nextOperator) {
        const { value, displayValue, operator } = this.state;
        const inputValue = parseFloat(displayValue);

        if (value == null) {
            this.setState({
                value: inputValue
            });
        } else if (operator) {
            const currentValue = value || 0;
            const newValue = CalculatorOperations[operator](currentValue, inputValue);
            this.setState({
                value: newValue,
                displayValue: String(newValue)
            });
        }

        this.setState({
            waitingForOperand: true,
            operator: nextOperator
        });
    }

    handleKeyDown = (event) => {
        let { key } = event;
        if (key === 'Enter') key = '=';

        if ((/\d/).test(key)) {
            event.preventDefault();
            this.inputDigit(parseInt(key, 10));
        } else if (key in CalculatorOperations) {
            event.preventDefault();
            this.performOperation(key);
        } else if (key === '.') {
            event.preventDefault();
            this.inputDot();
        } else if (key === '%') {
            event.preventDefault();
            this.inputPercent();
        } else if (key === 'Backspace') {
            event.preventDefault();
            this.clearLastChar();
        } else if (key === 'Clear') {
            event.preventDefault();
            if (this.state.displayValue !== '0') {
                this.clearDisplay();
            } else {
                this.clearAll();
            }
        }
    };

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    render() {
        const { displayValue } = this.state;
        const clearDisplay = displayValue !== '0';
        const clearText = clearDisplay ? 'C' : 'AC';

        return React.createElement(
            'div',
            { className: 'calculator' },
            React.createElement(CalculatorDisplay, { value: displayValue }),
            React.createElement(
                'div',
                { className: 'calculator-keypad' },
                React.createElement(
                    'div',
                    { className: 'input-keys' },
                    React.createElement(
                        'div',
                        { className: 'function-keys' },
                        React.createElement(CalculatorKey, {
                            className: 'key-clear',
                            onClick: () => clearDisplay ? this.clearDisplay() : this.clearAll()
                        }, clearText),
                        React.createElement(CalculatorKey, {
                            className: 'key-sign',
                            onClick: () => this.toggleSign()
                        }, '±'),
                        React.createElement(CalculatorKey, {
                            className: 'key-percent',
                            onClick: () => this.inputPercent()
                        }, '%')
                    ),
                    React.createElement(
                        'div',
                        { className: 'digit-keys' },
                        React.createElement(CalculatorKey, {
                            className: 'key-0',
                            onClick: () => this.inputDigit(0)
                        }, '0'),
                        React.createElement(CalculatorKey, {
                            className: 'key-dot',
                            onClick: () => this.inputDot()
                        }, '.'),
                        React.createElement(CalculatorKey, {
                            className: 'key-1',
                            onClick: () => this.inputDigit(1)
                        }, '1'),
                        React.createElement(CalculatorKey, {
                            className: 'key-2',
                            onClick: () => this.inputDigit(2)
                        }, '2'),
                        React.createElement(CalculatorKey, {
                            className: 'key-3',
                            onClick: () => this.inputDigit(3)
                        }, '3'),
                        React.createElement(CalculatorKey, {
                            className: 'key-4',
                            onClick: () => this.inputDigit(4)
                        }, '4'),
                        React.createElement(CalculatorKey, {
                            className: 'key-5',
                            onClick: () => this.inputDigit(5)
                        }, '5'),
                        React.createElement(CalculatorKey, {
                            className: 'key-6',
                            onClick: () => this.inputDigit(6)
                        }, '6'),
                        React.createElement(CalculatorKey, {
                            className: 'key-7',
                            onClick: () => this.inputDigit(7)
                        }, '7'),
                        React.createElement(CalculatorKey, {
                            className: 'key-8',
                            onClick: () => this.inputDigit(8)
                        }, '8'),
                        React.createElement(CalculatorKey, {
                            className: 'key-9',
                            onClick: () => this.inputDigit(9)
                        }, '9')
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'operator-keys' },
                    React.createElement(CalculatorKey, {
                        className: 'key-divide',
                        onClick: () => this.performOperation('/')
                    }, '÷'),
                    React.createElement(CalculatorKey, {
                        className: 'key-multiply',
                        onClick: () => this.performOperation('*')
                    }, '×'),
                    React.createElement(CalculatorKey, {
                        className: 'key-subtract',
                        onClick: () => this.performOperation('-')
                    }, '−'),
                    React.createElement(CalculatorKey, {
                        className: 'key-add',
                        onClick: () => this.performOperation('+')
                    }, '+'),
                    React.createElement(CalculatorKey, {
                        className: 'key-equals',
                        onClick: () => this.performOperation('=')
                    }, '=')
                )
            )
        );
    }
}

render(
    React.createElement(Calculator, null),
    document.getElementById('app')
);