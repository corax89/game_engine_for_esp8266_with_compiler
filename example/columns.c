//6x13
int field[78];
//8x8
char free[] = {0xff,0xff,0xff,0xfc,0xf1,0x11,0x11,0x1c,0xf1,0x11,0x11,0x1c,0xf1,0x11,0x11,0x1c,0xf1,0x11,0x11,0x1c,0xf1,0x11,0x11,0x1c,0xf1,0x11,0x11,0x1c,0xfc,0xcc,0xcc,0xcc};
char red[] = {0xff,0x22,0x22,0xfc,0xf2,0xa2,0xa2,0x2c,0x2a,0x27,0x22,0x22,0x22,0x72,0x22,0x22,0x2a,0x22,0x22,0x26,0x22,0x22,0x22,0x26,0xf2,0x22,0x22,0x6c,0xfc,0x22,0x66,0xcc};
char blue[] = {0xff,0x33,0x33,0xfc,0xf3,0xe3,0xe3,0x3c,0x3e,0x31,0x33,0x33,0x33,0x13,0x33,0x33,0x3e,0x33,0x33,0x36,0x33,0x33,0x33,0x36,0xf3,0x33,0x33,0x6c,0xfc,0x33,0x66,0xcc};
char green[] = {0xff,0x55,0x55,0xfc,0xf5,0xd5,0xd5,0x5c,0x5d,0x51,0x55,0x55,0x55,0x15,0x55,0x55,0x5d,0x55,0x55,0x59,0x55,0x55,0x55,0x59,0xf5,0x55,0x55,0x9c,0xfc,0x55,0x99,0xcc};
char yellow[] = {0xf7,0x11,0x11,0x7c,0x71,0x77,0x77,0x77,0x17,0x77,0x77,0x78,0x17,0x77,0x87,0x78,0x17,0x71,0x77,0x78,0x17,0x77,0x77,0x78,0x77,0x77,0x77,0x87,0xf7,0x88,0x88,0x7c};
char gray[]  = {0xf1,0x11,0x11,0x1c,0x11,0xc1,0xc4,0xcb,0x1c,0x1c,0xcc,0x4b,0x11,0xcc,0xcc,0xcb,0x1c,0xcc,0xcc,0xbb,0x14,0xcc,0xcb,0xcb,0x1c,0x4c,0xbc,0xbb,0xfb,0xbb,0xbb,0xbc};
char multi[] = {0xbb,0xbb,0x66,0x66,0xbb,0x11,0x1e,0x16,0xb1,0xc1,0x11,0x66,0xbb,0x11,0x1e,0x16,0xb1,0xc1,0x11,0x66,0xbb,0x11,0x1e,0x16,0xb1,0xc1,0x11,0x66,0xbb,0xbb,0x66,0x66};
char clear[] = {0x10,0x10,0x10,0x10,0x1,0x1,0x1,0x1,0x10,0x11,0x10,0x10,0x1,0x1,0x1,0x11,0x11,0x10,0x10,0x10,0x1,0x1,0x11,0x1,0x10,0x10,0x10,0x10,0x1,0x1,0x1,0x1};

int blocks[] = {free, red, blue, green, yellow, gray, multi};
char next[3];

int i,x,y,fx,fy,key,pos,prevkey,isdown,score;

void end();

void newFigure(){
	if(field[14] == 0){
		field[2] = next[0];
		field[8] = next[1];
		field[14] = next[2];
		fx = 2;
		fy = 2;
	}
	else
		end();
	next[0] = 1 + random(5);
	next[1] = 1 + random(5);
	next[2] = 1 + random(5);
}

void drawClear(){
	for(x = 0; x < 6; x++)
		for(y = 0; y < 13; y++)
			if(field[x + y * 6] == 15)
				putimage(clear, 8 + x * 8, 8 + y * 8, 8, 8);
}

void redraw(){
	for(x = 0; x < 6; x++)
		for(y = 0; y < 13; y++)
			putimage(blocks[field[x + y * 6]], 8 + x * 8, 8 + y * 8, 8, 8);
	gotoxy(12,1);
	printf("score:");
	gotoxy(12,3);
	printf("%d", score);
	gotoxy(12,5);
	printf("next:");
	for(y = 0; y < 3; y++)
		putimage(blocks[next[y]], 80, 60 + y * 8, 8, 8);
}

void goleft(){
	char pos = fx - 1 + fy * 6;
	if(field[pos] == 0 && field[pos - 6] == 0 && field[pos - 12] == 0){
		fx--;
		field[pos] = field[pos + 1];
		field[pos - 6] = field[pos - 5];
		field[pos - 12] = field[pos - 11];
		field[pos + 1] = 0;
		field[pos - 5] = 0;
		field[pos - 11] = 0;
	}
}

void goright(){
	char pos = fx + 1 + fy * 6;
	if(field[pos] == 0 && field[pos - 6] == 0 && field[pos - 12] == 0){
		fx++;
		field[pos] = field[pos - 1];
		field[pos - 6] = field[pos - 7];
		field[pos - 12] = field[pos - 13];
		field[pos - 1] = 0;
		field[pos - 7] = 0;
		field[pos - 13] = 0;
	}
}

void rotate(){
	char pos,buf; 
	pos = fx + fy * 6;
	buf = field[pos]
	field[pos] = field[pos - 6];
	field[pos - 6] = field[pos - 12];
	field[pos - 12] = buf;
}

void putDownColumn(int x){
	int i,y,pos;
	for(y = 12; y > 0; y--){
		pos = x + y * 6;
		while(field[pos] == 15){
			for(i = y; i > 0; i--){
				field[pos] = field[pos - 6];
				pos -= 6;
			}
			pos = x + y * 6;
		}
	}
	field[x] = 0;
	delayredraw();
}

void testField(){
	int pos, x, y, color;
	for(y = 0; y <= 12; y++){
		for(x = 0; x < 6; x++){
			pos = x + y * 6;
			if(field[pos] != 0){
				color = field[pos];
				if(x < 4 && color < 15){
					//---
					//+++
					//---
					if(field[pos] == field[pos + 1] && field[pos] == field[pos + 2]){
						isdown = 1;
						field[pos] = 15;
						pos++;
						x++;
						score+=2;
						while(x < 6 && field[pos] == color){
							field[pos] = 15;
							x++;
							pos++;
							score+=2;
						}
						drawClear();
					}
				}
				if(y <= 10 && color < 15){
					pos = x + y * 6;
					//-+-
					//-+-
					//-+-
					if(color == field[pos + 6] && field[pos] == field[pos + 12]){
						isdown = 1;
						field[pos] = 15;
						pos+=6;
						y++;
						score+=2;
						while(y <= 12 && field[pos] == color){
							field[pos] = 15;
							y++;
							pos+=6;
							score+=2;
						}
						drawClear();
					}
				}
				if(y <= 10 && x < 4 && color < 15){
					pos = x + y * 6;
					//+--
					//-+-
					//--+
					if(color == field[pos + 7] && field[pos] == field[pos + 14]){
							isdown = 1;
							field[pos] = 15;
							pos+=7;
							score+=2;
							while(x < 6 && field[pos] == color){
								field[pos] = 15;
								pos+=7;
								score+=2;
							}
							drawClear();
						}
					}
				if(y <= 10 && x > 1 && color < 15){
					pos = x + y * 6;
					//--+
					//-+-
					//+--
					if(color == field[pos + 5] && field[pos] == field[pos + 10]){
							isdown = 1;
							field[pos] = 15;
							pos+=5;
							score+=2;
							while(x < 6 && field[pos] == color){
								field[pos] = 15;
								pos+=5;
								score+=2;
							}
							drawClear();
						}
					}	
				}
			}
		}
	}
}

void step(){
	if(gettimer(1) == 0){
		settimer(1, 100);
		if(key == KEY_DOWN)
			settimer(0, 50);
		if(key != prevkey){
			if(key == KEY_LEFT && fx > 0)
				goleft();
			if(key == KEY_RIGHT && fx < 5)
				goright();
			if(key == KEY_B)
				rotate();	
			prevkey = key;
		}
		redraw();
	}
	if(gettimer(0) == 0){
		settimer(0, 1000);
		score++;
		pos = fx + fy * 6;
		if(fy < 12 && field[pos + 6] == 0){
			fy++;
			field[pos + 6] = field[pos];
			field[pos] = field[pos - 6];
			field[pos - 6] = field[pos - 12];
			field[pos - 12] = 0;
		} 
		else{
			isdown = 1;
			while(isdown){
				isdown = 0;
				testField();
				for(x = 0; x < 6; x++)
					putDownColumn(x);
			}
			newFigure();
		}
	}
}

void init(){
	clearscreen();
	next[0] = 1 + random(5);
	next[1] = 1 + random(5);
	next[2] = 1 + random(5);
	score = 0;
	for(y = 0; y <= 12; y++)
		for(x = 0; x < 6; x++)
			field[x + y * 6] = 0;
	newFigure();
}

void end(){
	gotoxy(10,11);
	printf("game over");
	settimer(1, 2000);
	while(gettimer(1)){}
	while(getkey() != 0){}
	init();
}

void main(){
	init();
	while(1){
		step();
		key = getkey();
	}
}
