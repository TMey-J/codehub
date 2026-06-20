package main

import (
	"encoding/json"
	"net/http"
)

// CalculatorController handles HTTP requests and uses the model.
type CalculatorController struct {
	model *CalculatorModel
}

func NewCalculatorController() *CalculatorController {
	return &CalculatorController{model: &CalculatorModel{}}
}

// EvaluateRequest is the JSON structure sent from the frontend.
type EvaluateRequest struct {
	Expression string `json:"expression"`
}

// EvaluateResponse is the JSON structure returned to the frontend.
type EvaluateResponse struct {
	Result string `json:"result"`
}

// HandleEvaluate processes POST /evaluate requests.
func (c *CalculatorController) HandleEvaluate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req EvaluateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	result := c.model.Evaluate(req.Expression)
	resp := EvaluateResponse{Result: result}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
