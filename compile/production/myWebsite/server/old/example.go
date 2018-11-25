package old

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup

func loop(c chan int, target int) {
	for i := 0; i < target; i++{
		c <- i
	}
	close(c)
}

func printChannel(c chan int ){
	defer wg.Done()
	for item := range c {
		fmt.Println(item)
	}
}

func main() {
	c := make(chan int)
	clone := make(chan int)
	go loop(c, 10)
	go loop(clone, 20)
	wg.Add(2)
	go printChannel(c)
	go printChannel(clone)
	wg.Wait()
}