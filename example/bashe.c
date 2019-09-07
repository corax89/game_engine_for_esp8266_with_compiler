int stickCount;
char key,previouseKey,takenSticks;

void redraw(){
	int i;
	//выбираем красный цвет
	setcolor(2);
	//рисуем видимые палочки
	for(i = 0; i < stickCount; i++)
		line(22 + i * 6, 74, 22 + i * 6, 84);
	//выбираем серый цвет
	setcolor(11);
	//рисуем выброшенные
	for(i = stickCount; i < 15; i++)
		line(22 + i * 6, 74, 22 + i * 6, 84);
	//возвращаем белый цвет как основной
	setcolor(1);
	//ждем перерисовки экрана
	delayredraw();
}

void playersMove(){
	//если код кнопки равен предыдущему, значит она еще не отпущена. Ждем
	while(key == previouseKey){
		key = getkey();
	}
	while(key != KEY_LEFT && key != KEY_DOWN && key != KEY_RIGHT){
		key = getkey();
	}
	if(key & KEY_LEFT){
		takenSticks = 1;
	}else if(key & KEY_DOWN){
		takenSticks = 2;
	}else{
		takenSticks = 3;
	}
	printf("%d, ", takenSticks);
	stickCount -= takenSticks;
	previouseKey = key;
}

void computersMove(){
	if(stickCount % 4){
		//компьютер реализует выигрышную стратегию, если выпала возможность
		takenSticks = stickCount % 4;
	}else{
		//компьютер ждет возможности реализовать выигрышную стратегию
		takenSticks = 2;
	}
	stickCount -= takenSticks;
	printf("%d, ", takenSticks);
}

void game(){
	//инициализация
	stickCount = 15;
	clearscreen();
	//переводим каретку на восьмой символ нулевой строки
	gotoxy(8,0);
	puts("Баше");
	gotoxy(2,1);
	puts("Возьмите 1,2 или 3 палочки. Проигрывает тот,  кому   нечего  брать. Управление:\n");
	//коды 27,25 и 26 соответствуют стрелкам
	printf(" %c 1    %c 2    %c 3", 27, 25, 26);
	gotoxy(0,12);
	redraw();
	while(1){
		playersMove();
		if(stickCount <= 0){
			gotoxy(3,8);
			puts("Вы выиграли");
			return;
		}
		redraw();
		computersMove();
		redraw();
		if(stickCount <= 0){
			gotoxy(3,8);
			puts("Компьютер выиграл");
			return;
		}
	}
}

void main(){
	while(1){
		game();
		//ждем секунду
		settimer(1,1000);
		while(gettimer(1)){}
		while(getkey() == 0){}
		previouseKey = key;
	}
}
