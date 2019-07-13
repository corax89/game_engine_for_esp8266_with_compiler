# game engine for esp8266 game console with compiler

Firmware for gaming console on esp8266 [https://github.com/corax89/game_engine_for_esp8266_with_compiler](https://github.com/corax89/game_engine_for_esp8266_with_compiler)

![columns](/img/columns.gif) ![snake](/img/snake.gif) ![race](/img/race.gif) ![gameoflife](/img/gameoflife.gif) ![mars_attack](/img/mars_attack.gif) ![tile](/img/tile.gif)
 ![clicker](/img/clicker.gif) ![flappybird](/img/flappybird.gif) ![towerdefence](/img/towerdef.gif) ![cityrunner](/img/cityrunner.gif)
 ![galaxies](/img/galaxies.gif) ![memories](/img/memories.gif)

Gaming device that can be programmed directly from the browser. Here is the compiler of the subset C into bytecode and the virtual machine written in js. 
VM has access to 65,534 bytes of memory, only 20,000 bytes are available on the device itself, since the remaining memory goes to the screen  buffer and library. 
The screen has a size of 128x128 pixels, each pixel can take one of the 16 colors of the palette. The first color is transparent. There are 32 soft sprites available. 
The compiler supports int and unsigned char types, one-dimensional arrays, debugging

![палитра](/img/IMG_0001_2.png)

Попытка сделать игровое устройство, которое можно программировать прямо из браузера. Здесь находится компилятор подмножества си в байткод и виртуальная машина, написанные на js.
VM имеет доступ к 65 534 байтам памяти, на самом устройстве доступно лишь 20 000 байт, т.к. остальная память уходит на буфер экрана и библиотеки.
Экран имеет размер 128x128 пикселей, каждый пиксель может принимать один из 16 цветов палитры. Первый цвет является прозрачным. Доступно 32 софтовых спрайта. 

Компилятор поддерживает типы int и unsignet char, одномерные массивы, создание и вызов функций, отладку

Игровая консоль сделана на основе корпуса gameboy

![esp8266 game console](/img/IMG_0001_1.jpg)


