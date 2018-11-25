package main

import (
	"log"
	"time"
)

func g1(ch chan string) {
	log.Println(time.Now().Format(time.Stamp))
	ch <- "hello world"
	log.Println(time.Now().Format(time.Stamp))

}

func g2(ch chan string) {
	time.Sleep(time.Second * 5)
	item := <-ch
	log.Println(item)
}

func main() {
	ch := make(chan string)
	go g1(ch)
	go g2(ch)
	time.Sleep(time.Second * 6)
}