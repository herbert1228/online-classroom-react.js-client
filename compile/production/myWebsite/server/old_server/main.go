package old_server

import "net/http"

func main() {
	router := NewRouter()

	router.Handle("init", initialize)
	router.Handle("user login", userLogin)
	router.Handle("user chat", userChat)
	router.Handle("draw", userDraw)

	http.Handle("/", router)
	http.ListenAndServe(":4000", nil)
}