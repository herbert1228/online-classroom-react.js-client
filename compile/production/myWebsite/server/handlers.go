package main

import (
	"github.com/mitchellh/mapstructure"
	"strings"
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
	KeyFromClient *Client `json:"keyFromClient"`
	Whiteboard []Stroke `json:"whiteboard"`
}

type Chat struct {
	ID string `json:"id"`
	User string `json:"user"`
	Content string `json:"content"`
	Time string `json:"time"`
}

type Info struct {
	Users []*User `json:"users"`
	Chat []*Chat `json:"chat"`
}

func initialize(client *Client, data interface{}) {
	go func() {
		client.controller.msgChan <- Message{"init client", client}
	}()
}

func userDraw(client *Client, data interface{}) {
	var draw Stroke
	if err := mapstructure.Decode(data, &draw); err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}

	ch := make(chan interface{})
	client.controller.msgChan <- Message{"user draw", ch}
	ch <- client
	ch <- draw
	close(ch)
}

func userLogin(client *Client, data interface{}) { //Todo request data not match with this func
	//var u User
	var name string
	if err := mapstructure.Decode(data, &name); err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	name = strings.TrimSpace(name)
	if name == "" {
		client.send <- Message{"Invalid User Name", ""}
		return
	}
	for _, c := range client.controller.users { // duplicated name disallowed // place this to controller
		if c.KeyFromClient.userName == name {
			client.send <- Message{"Invalid User Name", ""}
			return
		}
	}
	client.userName = name
	go func() {
		client.controller.msgChan <- Message{"user join", &User{client, []Stroke{}}}
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
	client.controller.msgChan <- Message{"new chat", &ch}
}