package old

import (
	"testing"
	"net/http/httptest"
	"encoding/json"
	"bytes"
)

//func TestUniqueID(t *testing.T) {
//	if false {
//		t.Error("Expected unique id to ")
//	}
//}

//func TestTableCalculate(t *testing.T) {
//	var tests = []struct{
//		input	 int
//		expected int
//	}{
//		{2, 4},
//		{-1, 1},
//		{0, 2},
//		{99999, 100001},
//	}
//
//	for _, test := range tests{
//		if output := Calculate(test.input); output != test.expected {
//			t.Error("Test Failed: {} inputted, {} expected, received: {}", test.input, test.expected, output)
//		}
//	}
//}

func TestGetResources(t *testing.T) {
	target := struct {
		ID string
		Title string
		Desc string
		Content string
	}{"1", "Title", "Desc", "Content"}

	b, _ := json.Marshal(&target)
	br := bytes.NewReader(b)

	req := httptest.NewRequest("POST", "/api/res", br)
	w := httptest.NewRecorder()

	getResources(w, req)

	t.Logf("HTTP %d", w.Code)
	t.Logf("Body: %v", w.Body.String())

	if w.Code != 200 {
		t.Error("Invalid response")
	}
}