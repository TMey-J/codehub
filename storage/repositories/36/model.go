package main

import (
	"math"
	"strconv"
	"strings"
)

type CalculatorModel struct{}

func (m *CalculatorModel) Evaluate(expr string) string {
	tokens, err := m.tokenize(expr)
	if err != nil {
		return "Error"
	}
	rpn, err := m.shuntingYard(tokens)
	if err != nil {
		return "Error"
	}
	result, err := m.evalRPN(rpn)
	if err != nil {
		return "Error"
	}
	// Format result without trailing .0 for integers
	if result == math.Trunc(result) {
		return strconv.FormatInt(int64(result), 10)
	}
	return strconv.FormatFloat(result, 'f', -1, 64)
}

func (m *CalculatorModel) tokenize(expr string) ([]string, error) {
	var tokens []string
	i := 0
	for i < len(expr) {
		c := expr[i]
		if c == ' ' {
			i++
			continue
		}
		if (c >= '0' && c <= '9') || c == '.' {
			start := i
			for i < len(expr) && ((expr[i] >= '0' && expr[i] <= '9') || expr[i] == '.') {
				i++
			}
			tokens = append(tokens, expr[start:i])
			continue
		}
		if strings.ContainsRune("+-*/^()", rune(c)) {
			tokens = append(tokens, string(c))
			i++
			continue
		}
		if c == 's' && strings.HasPrefix(expr[i:], "sqrt") {
			tokens = append(tokens, "sqrt")
			i += 4
			continue
		}
		return nil, ErrInvalidToken
	}
	return tokens, nil
}

func (m *CalculatorModel) shuntingYard(tokens []string) ([]string, error) {
	precedence := map[string]int{"+": 1, "-": 1, "*": 2, "/": 2, "^": 3, "sqrt": 4}
	assoc := map[string]string{"+": "L", "-": "L", "*": "L", "/": "L", "^": "R", "sqrt": "R"}
	var output []string
	var stack []string

	for _, token := range tokens {
		if isNumber(token) {
			output = append(output, token)
		} else if _, ok := precedence[token]; ok {
			for len(stack) > 0 {
				top := stack[len(stack)-1]
				if _, ok := precedence[top]; !ok {
					break
				}
				if (assoc[token] == "L" && precedence[token] <= precedence[top]) ||
					(assoc[token] == "R" && precedence[token] < precedence[top]) {
					output = append(output, stack[len(stack)-1])
					stack = stack[:len(stack)-1]
				} else {
					break
				}
			}
			stack = append(stack, token)
		} else if token == "(" {
			stack = append(stack, token)
		} else if token == ")" {
			found := false
			for len(stack) > 0 {
				top := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				if top == "(" {
					found = true
					break
				}
				output = append(output, top)
			}
			if !found {
				return nil, ErrMismatchedParens
			}
		} else if token == "sqrt" {
			stack = append(stack, token)
		} else {
			return nil, ErrUnknownToken
		}
	}
	for len(stack) > 0 {
		top := stack[len(stack)-1]
		if top == "(" || top == ")" {
			return nil, ErrMismatchedParens
		}
		output = append(output, top)
		stack = stack[:len(stack)-1]
	}
	return output, nil
}

func (m *CalculatorModel) evalRPN(rpn []string) (float64, error) {
	var stack []float64
	for _, token := range rpn {
		if isNumber(token) {
			val, err := strconv.ParseFloat(token, 64)
			if err != nil {
				return 0, err
			}
			stack = append(stack, val)
		} else {
			switch token {
			case "sqrt":
				if len(stack) < 1 {
					return 0, ErrInvalidExpression
				}
				a := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				stack = append(stack, math.Sqrt(a))
			case "+":
				if len(stack) < 2 {
					return 0, ErrInvalidExpression
				}
				b := stack[len(stack)-1]
				a := stack[len(stack)-2]
				stack = stack[:len(stack)-2]
				stack = append(stack, a+b)
			case "-":
				if len(stack) < 2 {
					return 0, ErrInvalidExpression
				}
				b := stack[len(stack)-1]
				a := stack[len(stack)-2]
				stack = stack[:len(stack)-2]
				stack = append(stack, a-b)
			case "*":
				if len(stack) < 2 {
					return 0, ErrInvalidExpression
				}
				b := stack[len(stack)-1]
				a := stack[len(stack)-2]
				stack = stack[:len(stack)-2]
				stack = append(stack, a*b)
			case "/":
				if len(stack) < 2 {
					return 0, ErrInvalidExpression
				}
				b := stack[len(stack)-1]
				a := stack[len(stack)-2]
				if b == 0 {
					return 0, ErrDivisionByZero
				}
				stack = stack[:len(stack)-2]
				stack = append(stack, a/b)
			case "^":
				if len(stack) < 2 {
					return 0, ErrInvalidExpression
				}
				b := stack[len(stack)-1]
				a := stack[len(stack)-2]
				stack = stack[:len(stack)-2]
				stack = append(stack, math.Pow(a, b))
			default:
				return 0, ErrUnknownOperator
			}
		}
	}
	if len(stack) != 1 {
		return 0, ErrInvalidExpression
	}
	return stack[0], nil
}

func isNumber(s string) bool {
	_, err := strconv.ParseFloat(s, 64)
	return err == nil
}

// Error types (simple constants)
var (
	ErrInvalidToken      = &calcError{"invalid token"}
	ErrMismatchedParens  = &calcError{"mismatched parentheses"}
	ErrUnknownToken      = &calcError{"unknown token"}
	ErrInvalidExpression = &calcError{"invalid expression"}
	ErrDivisionByZero    = &calcError{"division by zero"}
	ErrUnknownOperator   = &calcError{"unknown operator"}
)

type calcError struct{ msg string }

func (e *calcError) Error() string { return e.msg }
