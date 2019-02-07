char snake[100];
char eatx,eaty;
char snake_length;
char snake_spr[] = {0x11,0x10,0x11,0x10,0x11,0x10};
char eat_spr[] = {0x22,0x20,0x22,0x20,0x22,0x20};
char snake_clr[] = {0xbb,0xb0,0xbb,0xb0,0xbb,0xb0};
char snake_dir;
int i,key, game_end;

void delay(int n){
	settimer(1, n);
	while(gettimer(1)){
		if(key == 0)
			key = getkey();
	}
}

void init_game(){
	game_end = 0;
	snake_length = 6;
	snake_dir = 0;
	snake[0] = 1;
	snake[1] = 3;
	snake[2] = 1;
	snake[3] = 2;
	snake[4] = 1;
	snake[5] = 1;
	snake[6] = 1;
	snake[7] = 1;	
	eatx = 10 + random(30);
	eaty = 10 + random(30);
	putimage(eat_spr, eatx * 3, eaty * 3, 3, 3);
}

int restart(){
	gotoxy(4, 8);
	puts("game over");
	gotoxy(4, 9);
	puts("score ");
	putn(snake_length / 2 - 3);
	while(getkey() == 0){
		i = 0;	
	};
	clearscreen();
	init_game();
}

void redraw(){
	i = 0;
	for(i; i < snake_length; i++){
		putimage(snake_spr, snake[i] * 3, snake[i + 1] * 3, 3, 3); 
		i++;
	} 
	putimage(snake_clr, snake[snake_length] * 3, snake[snake_length + 1] * 3, 3, 3);
}

void action(){
	if((key == 1) && (snake_dir != 3))
		snake_dir = 1;
	else if((key == 4) && (snake_dir != 0))
		snake_dir = 2;
	else if((key == 2) && (snake_dir != 1))
		snake_dir = 3;
	else if((key == 8) && (snake_dir != 2))
		snake_dir = 0;
	key = 0;
	i = snake_length + 1;
	if(snake_dir == 0){
		snake[0] = snake[0] + 1;
		if(snake[0] >= 41){
			snake[0] = 1;}
	}
	else if(snake_dir == 1){
		snake[1] = snake[1] - 1;
		if(snake[1] <= 1){
			snake[1] = 41;}
	}
	else if(snake_dir == 2){
		snake[0] = snake[0] - 1;
		if(snake[0] <= 1){
			snake[0] = 41;}
	}
	else if(snake_dir == 3){
		snake[1] = snake[1] + 1;
		if(snake[1] >= 41){
			snake[1] = 1;}
	}
	if(getpixel(snake[0] * 3 + 1, snake[1] * 3 + 1) == 1)
		game_end = 1; 
	if((snake[0] == eatx) && (snake[1] == eaty)){
		eatx = 2 + random(38);;
		eaty = 2 + random(38);;
		putimage(eat_spr, eatx * 3, eaty * 3, 3, 3);
		snake_length++;
		snake_length++;
	}
	while(i > 1){
		snake[i] = snake[i - 2]; 
		i--;
		snake[i] = snake[i - 2];
		i--;
	}
	i = 0;
}

void main(){
	init_game();
	while(1){
		if(game_end){
			restart();
		}
		action();
		redraw();
		delay(200);
	}
}