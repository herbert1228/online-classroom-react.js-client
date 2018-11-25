package old_server

import (
	"github.com/mitchellh/mapstructure"
	"strings"
	"sync"
)

type Channel struct {
	Id string `json:"id"`
	Name string `json:"name"`
}

type Point struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
}

type Stroke struct {
	ID string `json:"id"`
	Tool string `json:"tool"`
	Color string `json:"color"`
	Size int `json:"size"`
	Points []Point `json:"points"`
}

type User struct {
	//Id string `json:"id"`
	Name string `json:"name"`
	Whiteboard []Stroke `json:"whiteboard"`
}

type Chat struct {
	ID string `json:"id"`
	User string `json:"user"`
	Content string `json:"content"`
	Time string `json:"time"`
}

type Info struct {
	Users []User `json:"users"`
	Chat []Chat `json:"chat"`
}

var users []User

var chat []Chat

var chatLock sync.Mutex

func initialize(client *Client, data interface{}) {
	go func() {
		client.send <- Message{"init", Info{users, chat}}
	}()
}

func userDraw(client *Client, data interface{}) {
	var draw Stroke
	if err := mapstructure.Decode(data, &draw); err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	for i, u := range users {
		if u.Name == client.userName {
			userLock.Lock()
			u.Whiteboard = append(u.Whiteboard, draw)
			users = append(append(users[:i], u), users[i + 1:]...)
			client.BoardCastToAllExceptSource("draw to client", users)
			userLock.Unlock()
			break
		}
	}
}

func userLogin(client *Client, data interface{}) {
	var u User
	if err := mapstructure.Decode(data, &u); err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	u.Name = strings.TrimSpace(u.Name)
	if u.Name == "" {
		client.send <- Message{"Invalid User Name", ""}
		return
	}
	for _, c := range users { // duplicate names are not allowed
		if c.Name == u.Name {
			client.send <- Message{"Invalid User Name", ""}
			return
		}
	}
	client.userName = u.Name
	go func() {
		client.AddClientToLoginList()
		client.send <- Message{"Successful Login", client.userName}
	}()
}

func userChat(client *Client, data interface{}){
	var ch Chat
	if err := mapstructure.Decode(data, &ch); err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	ch.Content = strings.TrimSpace(ch.Content)
	if ch.Content == "" { // can send message to client
		return
	}
	func() {
		chatLock.Lock()
		chat = append(chat, ch)
		//log.Println(len(chat))
		chatLock.Unlock()
		BoardCastToAll("new chat", chat)
	}()
}