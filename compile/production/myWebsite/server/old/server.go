package main

import (
	"net/http"
	"fmt"
	"encoding/json"
	"github.com/gorilla/mux"
	"strconv"
	"github.com/withmandala/go-log"
	"os"
	"io/ioutil"
	"math"
	"github.com/rs/cors"
)

type Resource struct {
	ID string `json:"id"`
	Title string `json:"title"`
	Desc string `json:"desc"`
	Content string `json:"content"`
}

type Chat struct {
	ID string `json:"id"`
	User string `json:"user"`
	Content string `json:"content"`
	Time string `json:"time"`
}

type RawJson struct {
	Resources []Resource `json:"resources"`
	Chat []Chat `json:"chat"`
}

var res []Resource

var chat []Chat

var rawJson RawJson

// Debug mode(Debug, Trace), Error, Fatal, Warn, Info
// Without Caller Info (Warn, Info, Trace)
var logger = log.New(os.Stderr).WithColor() //switch between logger.Quiet and logger.NoQuiet if logs are annoying

func serverConsole(s string, err ...string){
	if err == nil {
		logger.Trace(s)
		return
	}
	logger.Warn(s + " item not found, request id:" + err[0])
}

func uniqueID() int {
	id := math.MinInt8
	for _, item := range res{
		itemId, _ := strconv.Atoi(item.ID)
		if itemId > id{
			id = itemId
		}
	}
	id += 1
	return id
}

func readJsonFile() {
	jsonFile, err := os.Open("./src/server/resources.json")
	if err != nil {
		logger.Error(err)
	}
	defer jsonFile.Close()
	byteValue, _ := ioutil.ReadAll(jsonFile)
	json.Unmarshal(byteValue, &rawJson)
	res = rawJson.Resources
	chat = rawJson.Chat
}

func writeJsonFile() {
	rawJson.Resources = res
	rawJson.Chat = chat
	byteValue, err := json.Marshal(rawJson)
	if err != nil {
		logger.Error(err)
	}
	ioutil.WriteFile("./src/server/resources.json", byteValue, 0644) //TODO release lock here
}

func homePage(w http.ResponseWriter, r *http.Request)  {
	fmt.Fprint(w, "Homepage")
}

func getResources(w http.ResponseWriter, r *http.Request)  {
	readJsonFile()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
	serverConsole("GET Items")
}

func getItem(w http.ResponseWriter, r *http.Request)  {
	readJsonFile()
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	for _, item := range res {
		if item.ID == params["id"] {
			json.NewEncoder(w).Encode(item)
			serverConsole("GET Item ID:" + item.ID)
			return
		}
	}
	json.NewEncoder(w).Encode(&Resource{})
	serverConsole("GET", params["id"])
}

func uploadResources(w http.ResponseWriter, r *http.Request)  {
	readJsonFile() //TODO lock res until finished writing
	w.Header().Set("Content-Type", "application/json")
	var item Resource
	_ = json.NewDecoder(r.Body).Decode(&item)
	item.ID = strconv.Itoa(uniqueID())
	res = append(res, item)
	serverConsole("UPLOAD Item ID:" + item.ID)
	writeJsonFile()

	json.NewEncoder(w).Encode(item)
}

func updateResources(w http.ResponseWriter, r *http.Request)  {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r);
	for index, item := range res {
		if item.ID == params["id"] {
			var newItem Resource
			_ = json.NewDecoder(r.Body).Decode(&newItem)
			newItem.ID = params["id"]

			res = append(res[:index], res[index + 1:]...)
			res = append(res, newItem)
			json.NewEncoder(w).Encode(res)
			serverConsole("UPDATE Item ID:" + item.ID)
			writeJsonFile()
			return
		}
	}
	serverConsole("UPDATE", params["id"])
}

func deleteResource(w http.ResponseWriter, r *http.Request)  {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	for index, item := range res {
		if item.ID == params["id"] {
			res = append(res[:index], res[index + 1:]...)
			serverConsole("DELETE Item ID:" + item.ID)
			json.NewEncoder(w).Encode(res)
			writeJsonFile()
			return
		}
	}
	//json.NewEncoder(w).Encode(res)
	serverConsole("DELETE", params["id"])
}

func getChat(w http.ResponseWriter, r *http.Request)  {
	readJsonFile()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chat)
	serverConsole("GET Chat")
}

func uploadChat(w http.ResponseWriter, r *http.Request)  {
	readJsonFile() //TODO lock chat until finished writing
	w.Header().Set("Content-Type", "application/json")
	var comment Chat
	_ = json.NewDecoder(r.Body).Decode(&comment)
	comment.ID = strconv.Itoa(uniqueID())
	chat = append(chat, comment)
	serverConsole("UPLOAD Chat ID:" + comment.ID)
	writeJsonFile()
	json.NewEncoder(w).Encode(comment)
}

func handleRequests() {
	r := mux.NewRouter().StrictSlash(true)

	r.HandleFunc("/", homePage)
	r.HandleFunc("/api/res", getResources).Methods("GET") // url "/api/res/" is invalid
	r.HandleFunc("/api/res/{id}", getItem).Methods("GET")
	r.HandleFunc("/api/res", uploadResources).Methods("POST") // url "/api/res/" is invalid
	r.HandleFunc("/api/res/{id}", updateResources).Methods("PUT")
	r.HandleFunc("/api/res/{id}", deleteResource).Methods("DELETE")

	r.HandleFunc("/api/chat", getChat).Methods("GET")
	r.HandleFunc("/api/chat", uploadChat).Methods("POST")

	c := cors.New(cors.Options{
		AllowedMethods: []string{"GET", "POST", "DELETE", "PUT"},
	})
	myRouter := c.Handler(r) //myRouter := cors.Default().Handler(r)
	logger.Fatal(http.ListenAndServe(":8080", myRouter))
}

func main()  {
	logger.WithDebug() //Debug
	handleRequests()
}