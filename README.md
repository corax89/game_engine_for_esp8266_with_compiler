# game engine for esp8266 game console with compiler

Посмотреть в работе можно тут [https://corax89.github.io/esp8266Game/](https://corax89.github.io/esp8266Game/index.html)

![test collision](/img/collision.gif) ![snake](/img/snake.gif) ![race](/img/race.gif) ![pi](/img/pi.gif) ![rpg](/img/rpg.gif) ![tile](/img/tile.gif)
 ![clicker](/img/clicker.gif) ![flappybird](/img/flappybird.gif) ![towerdefence](/img/towerdef.gif)

Попытка сделать игровое устройство, которое можно программировать прямо из браузера. Здесь находится компилятор подмножества си в байткод и виртуальная машина, написанные на js.
VM имеет доступ к 65 534 байтам памяти, на самом устройстве доступно лишь 20 000 байт, т.к. остальная память уходит на буфер экрана и библиотеки.
Экран имеет размер 128x128 пикселей, каждый пиксель может принимать один из 16 цветов палитры. Первый цвет является прозрачным. Доступно 32 софтовых спрайта. 

![палитра](/img/IMG_0001_2.png)

Компилятор поддерживает типы int и unsignet char, одномерные массивы, создание и вызов функций, отладку

Игровая консоль сделана на основе корпуса brick game

![esp8266 game console](/img/IMG_0001_1.jpg)


