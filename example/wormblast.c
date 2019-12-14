/*settings*{"name":"wormblast","author":"Corax","image":[51,51,51,51,51,55,51,51,51,51,51,51,51,51,51,51,55,51,51,51,51,51,51,51,51,51,51,51,51,115,51,51,51,51,51,51,51,51,51,51,51,67,51,51,51,51,51,51,51,51,51,51,57,68,51,51,51,51,51,51,51,51,51,51,159,196,67,51,51,51,51,51,51,51,51,57,255,204,68,51,51,51,51,51,136,131,51,57,252,204,68,51,51,136,136,120,136,136,51,51,156,196,67,51,56,136,136,136,136,136,51,51,52,68,51,51,136,136,136,136,136,136,131,51,51,51,51,51,136,135,136,136,136,136,115,51,51,51,51,51,136,120,120,136,136,135,135,51,51,51,51,56,136,135,136,136,136,136,120,136,136,120,136,136,136,136,136,136,136,136,136,136,136,136,136,136,136,136,136,135,136,136,136,136,136,136,136,136,136,136,136,120]}*/
//6x6
char bomb[] = {0x0,0xb9,0x0,0xb,0x9b,0x90,0xb9,0xb9,0x9c,0x9b,0x9c,0x9c,0x9,0xc9,0xc0,0x0,0xcc,0x0};
//32x10
char wave[] = {0x0,0x0,0x99,0x99,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x9,0x99,0x99,0x90,0x0,0x0,0x9,0x66,0x66,0x90,0x0,0x9,0x99,0x90,0x0,0x0,0x96,0x66,0x66,0x69,0x0,0x9,0x96,0x66,0x66,0x69,0x9,0x96,0x66,0x69,0x0,0x99,0x66,0x66,0x66,0x66,0x90,0x96,0x66,0x66,0x66,0x66,0x96,0x66,0x66,0x66,0x99,0x66,0x66,0x66,0x66,0x66,0x69,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66};
//6x8
char worm1[] = {0x0,0x55,0x50,0x5,0x51,0xa1,0x5,0xa1,0xa1,0x0,0xaa,0xa0,0x0,0xaa,0x0,0x0,0xa,0xa0,0xaa,0xaa,0xa0,0xa,0xaa,0x0};
char worm2[] = {0x0,0x55,0x50,0x5,0x51,0xa1,0x5,0xa1,0xa1,0x0,0xaa,0xa0,0x0,0xa,0xa0,0x0,0xa,0xaa,0x0,0xaa,0xaa,0xa,0xaa,0xa0};
int worm[] = {worm1, worm2};
//32x32rle
char ground[] = {0x11,0x88,0x82,0x87,0x8,0x88,0x82,0x78,0x6,0x88,0x83,0x71,0x78,0x6,0x88,0x83,0x87,0x17,0x6,0x88,0x82,0x87,0x8,0x88,0x82,0x78,0x1a,0x88,0x83,0x87,0x78,0xe,0x88,0x83,0x78,0x17,0x7,0x88,0x83,0x87,0x78,0x5,0x88,0x83,0x87,0x78,0x7,0x88,0x83,0x78,0x17,0xe,0x88,0x83,0x87,0x78,0x49,0x88,0x83,0x87,0x77,0xe,0x88,0x84,0x78,0x81,0x78,0xd,0x88,0x84,0x71,0x11,0x78,0x5,0x88,0x82,0x87,0x7,0x88,0x83,0x87,0x77,0x6,0x88,0x83,0x71,0x78,0xe,0x88,0x82,0x87,0x4b,0x88,0x82,0x78,0x8,0x88,0x82,0x87,0x5,0x88,0x83,0x87,0x17,0x8,0x88,0x83,0x71,0x78,0x5,0x88,0x82,0x78,0x2,0x88,0x84,0x87,0x77,0x78,0x3,0x88,0x82,0x87,0x9,0x88,0x84,0x78,0x88,0x17,0xd,0x88,0x84,0x87,0x11,0x17,0xe,0x88,0x83,0x77,0x78,0x3d,0x88};

char boom[] = "t:d=32,o=4,b=600:8a,a,a,a,a,a,a,a,4f,4f,f,f,f,f,f,f,f,f,f,f,a,a,a,a,a,a,a,a";

int i,cadr,key,score,maxscore;

void init();

void printScore(){
	gotoxy(0,0);
	setcolor(1);
	setbgcolor(3);
	printf("score %d max %d ", score, maxscore);
}

void plot_circle(int x, int y, int x_center, int  y_center){
    putpixel(x_center+x,y_center+y);
	putpixel(x_center+x,y_center+y + 1);
    putpixel(x_center+x,y_center-y);
	putpixel(x_center+x,y_center-y + 1);
    putpixel(x_center-x,y_center+y);
	putpixel(x_center-x,y_center+y + 1);
    putpixel(x_center-x,y_center-y);
	putpixel(x_center-x,y_center-y + 1);
}

void circle(int x_center, int y_center, int radius){
    int x,y,delta;
    x = 0;
    y = radius;
    delta = 3 - 2 * radius;
    while(x<y) {
        plot_circle(x,y,x_center,y_center);
        plot_circle(y,x,x_center,y_center);
        if(delta<0)
            delta += 4*x+6;
        else {
            delta += 4*(x-y)+10;
            y--;
        }
        x++;
    }
    if(x==y) 
		plot_circle(x,y,x_center,y_center);
}

void drawWave(){
	int x;
	x = spritegetvalue(3,S_X);
	x++;
	if(x >= 0)
		x = -32;
	for(i = 0; i < 5; i++){
		spritesetvalue(3 + i,S_X, x + i * 32);
	}
}

void drawWorm(){
	int x,y;
	x = spritegetvalue(1, S_X);
	y = spritegetvalue(1, S_Y);
	if(getpixel(x + 3, y + 8) == 3)
		spritesetvalue(1,S_Y,y + 1);
	getsprite(1,worm[cadr]);
	key = getkey();
	if(key == KEY_LEFT){
		cadr = 1 - cadr;
		if(getpixel(x - 1, y + 4) == 3 && x > 1){
			spritesetvalue(1,S_X,x - 1);
			if(getpixel(x - 1, y + 6) != 3)
				spritesetvalue(1,S_Y,y - 1);
		}
	}
	if(key == KEY_RIGHT){
		cadr = 1 - cadr;
		if(getpixel(x + 7, y + 4) == 3 && x < 122){
			spritesetvalue(1,S_X,x + 1);
			if(getpixel(x + 7, y + 6) != 3)
				spritesetvalue(1,S_Y,y - 1);
		}
	}
	if(y > 116){
		savedata("wormblast", &maxscore, 2);
		init();
	}
}

void bang(int x, int y){
	int r;
	r = 1;
	loadrtttl(boom,0);
	playrtttl();
	while(r < 12){
		setcolor(1);
		circle(x,y,r + 1);
		setcolor(3);
		circle(x,y,r);
		r++;
		settimer(1, 15);
		while(gettimer(1) > 0){}
		drawWorm();
		drawWave();
	}
	circle(x,y,r);
}

void bombCollision(char n){
	if(spritegetvalue(2, S_COLLISION) == 1){
		if(spritegetvalue(2, S_X) < spritegetvalue(1, S_X)){
			spritesetvalue(2, S_X, spritegetvalue(2, S_X) - 3);
		}
		else{
			spritesetvalue(2, S_X, spritegetvalue(2, S_X) + 3);
		}
	}
}

void step(){
	int x,y;
	if(gettimer(0) == 0){
		settimer(0, 15);
		if(spritegetvalue(2, S_LIVES) <= 0){
			putsprite(2, spritegetvalue(1, S_X) + random(3), 0);
			spritesetvalue(2,S_LIVES,90);
		}
		x = spritegetvalue(2, S_X);
		y = spritegetvalue(2, S_Y);
		if(getpixel(x + 3, y + 6) == 3 || y < 32)
			spritesetvalue(2,S_Y,y + 1);
		else{
			spritesetvalue(2,S_LIVES,spritegetvalue(2,S_LIVES) - 1);
			if(spritegetvalue(2,S_LIVES) <= 0){
				bang(x, y);
				score++;
				if(score > maxscore){
					maxscore = score;
				}
			}
		}
		drawWorm();
		drawWave();
		printScore();
	}
}

void init(){
	int x,y;
	score = 0;
	cadr = 0;
	setbgcolor(3);
	clearscreen();
	setcolor(3);
	for(y = 48; y < 128; y+=32)
		for(x = 0; x < 127; x+=32)
			putimagerle(ground,x,y,32,32);
	getsprite(1,worm[0]);
	spritesetvalue(1,S_WIDTH,6);
	spritesetvalue(1,S_HEIGHT,8);
	spritesetvalue(1,S_SPEEDX,0);
	spritesetvalue(1,S_SPEEDY,0);
	putsprite(1, 61, 40);
	getsprite(2,bomb);
	spritesetvalue(2,S_LIVES,0);
	spritesetvalue(2,S_WIDTH,6);
	spritesetvalue(2,S_HEIGHT,6);
	spritesetvalue(2,S_ON_COLLISION,bombCollision);
	for(i = 0; i < 5; i++){
		getsprite(3 + i,wave);
		spritesetvalue(3 + i,S_WIDTH,32);
		spritesetvalue(3 + i,S_HEIGHT,10);
		spritesetvalue(3 + i,S_SPEEDX,0);
		spritesetvalue(3 + i,S_SPEEDY,0);
		putsprite(3 + i, i * 32 - 31, 120 - i % 2);
	}
	loaddata("wormblast", &maxscore);
	setcolor(1);
	gotoxy(0, 0);
	printf("press any key");
	settimer(1, 1000);
	while(gettimer(1)){}
	while(getkey() == 0){}
}

void main(){
	init();
	while(1){
		step();
	}
}