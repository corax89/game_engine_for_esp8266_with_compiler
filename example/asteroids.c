char shatle[] = {0x4,0x0,0x0,0x0,0x0,0x0,0x0,0x1,0x40,0x0,0x0,0x0,0x0,0x0,0x76,0x66,0x66,0x65,0x0,0x0,0x0,0x1,0x11,0x40,0x0,0x0,0x0,0x0,0x1,0x11,0x14,0x44,0x40,0x0,0x0,0x1,0x11,0x11,0x11,0x14,0x44,0x0,0xbb,0xbb,0xbb,0x11,0x11,0xee,0x40,0xcc,0xcc,0xcc,0x11,0x11,0xee,0xf0,0x1,0x11,0x11,0x11,0x1f,0xff,0x0,0x1,0x11,0x1f,0xff,0xf0,0x0,0x0,0x1,0x11,0xf0,0x0,0x0,0x0,0x0,0x76,0x66,0x66,0x65,0x0,0x0,0x0,0x1,0xf0,0x0,0x0,0x0,0x0,0x0,0xf,0x0,0x0,0x0,0x0,0x0,0x0};
char bullet[] = {0x77,0x77,0x77,0x22,0x22,0x22};
char aster1[] = {0x0,0xf,0xff,0xff,0xff,0x0,0x0,0x0,0x0,0xfc,0xfc,0xcf,0xcc,0xbb,0x0,0x0,0xf,0xcf,0xcf,0xcc,0xcc,0xbc,0xbc,0x0,0xfc,0xfc,0xfc,0xcb,0xfc,0xcb,0xcb,0x0,0xff,0xbf,0xcc,0xcc,0xbf,0xcc,0xbc,0xb0,0xfc,0xfc,0xcc,0xcc,0xcb,0xfc,0xcb,0xb0,0xff,0xcc,0xcc,0xcc,0xcb,0xfc,0xbc,0xb0,0xfc,0xfc,0xcc,0xcc,0xcb,0xfc,0xcb,0xcb,0xff,0xcc,0xbc,0xcc,0xbf,0xcc,0xbc,0xbb,0xfc,0xfc,0xfb,0xbb,0xfc,0xcc,0xcb,0xcb,0xf,0xcc,0xcf,0xff,0xcc,0xcc,0xbc,0xbb,0x0,0xcc,0xcc,0xcc,0xcc,0xcb,0xcb,0xb0,0x0,0xc,0xcc,0xcc,0xcc,0xbc,0xbb,0x0,0x0,0x0,0xcc,0xcb,0xcb,0xcb,0xcb,0x0,0x0,0x0,0xb,0xbc,0xbc,0xbb,0xb0,0x0,0x0,0x0,0x0,0xb,0xbb,0xb0,0x0,0x0};
char aster2[] = {0x0,0x0,0x11,0x10,0x0,0x0,0x0,0x11,0x1f,0x11,0x10,0x0,0x11,0xf1,0xf1,0xfb,0x10,0x0,0x11,0x1f,0x1f,0xff,0xbf,0xc0,0x1f,0x11,0xff,0xff,0xff,0xc0,0x11,0xff,0xff,0xbf,0xfc,0xfc,0x1f,0xff,0xbb,0xff,0xcf,0xcc,0xff,0xff,0xff,0xfc,0xfc,0xfc,0xf,0xfc,0xff,0xcf,0xcc,0xc0,0xc,0xcf,0xcf,0xcc,0xc0,0x0,0x0,0xcc,0xcc,0xc0,0x0,0x0,0x0,0x0,0xcc,0x0,0x0,0x0};

int direction;
int speed;
char key,i,count;

void newObj(int arr,char x, char y, char w,char h, char l){
	char j;
	for(j = 3; j < 12; j++){
		if(spritegetvalue(j,S_LIVES) == 0){
			getsprite(j,arr);
			spritesetvalue(j,S_WIDTH,w);
			spritesetvalue(j,S_HEIGHT,h);
			spritesetvalue(j,S_SPEEDX,0);
			spritesetvalue(j,S_SPEEDY,random(1));
			spritesetvalue(j,S_SOLID,1);
			spritesetvalue(j,S_ANGLE,random(18) * 20);
			spritesetvalue(j,S_LIVES,l);
			putsprite(j,x,y);
			return;
		}
	}
}

void end();

void collisions(){
	char n,x,y;
	for(i = 3; i < 12; i++){
		if(spritegetvalue(i,S_X) < 0)
			spritesetvalue(i,S_X,127);
		else if(spritegetvalue(i,S_X) > 127)
			spritesetvalue(i,S_X,0);
		if(spritegetvalue(i,S_Y) < 0)
			spritesetvalue(i,S_Y,127);
		else if(spritegetvalue(i,S_Y) > 127)
			spritesetvalue(i,S_Y,0);
	}
	if(spritegetvalue(2,S_COLLISION) > 2){
		n = spritegetvalue(2,S_COLLISION);
		spritesetvalue(2,S_LIVES,0);
		count--;
		if(spritegetvalue(n,S_LIVES) == 2){
			x = spritegetvalue(n,S_X);
			y = spritegetvalue(n,S_Y);
			getsprite(n,aster2);
			spritesetvalue(n,S_WIDTH,12);
			spritesetvalue(n,S_HEIGHT,12);
			spritesetvalue(n,S_LIVES,1);
			newObj(aster2, x, y, 12, 12, 1);
			count += 2;
		}
		else
			spritesetvalue(n,S_LIVES,0);
	}
	if(spritegetvalue(1,S_COLLISION) > 2)
		end();
}

void init(){
	direction = 0;
	speed = 0;
	setparticle(0,6,200);
	getsprite(1,shatle);
	spritesetvalue(1,S_WIDTH,14);
	spritesetvalue(1,S_HEIGHT,13);
	getsprite(2,bullet);
	spritesetvalue(2,S_WIDTH,6);
	spritesetvalue(2,S_HEIGHT,2);
	spritesetvalue(2,S_SOLID,1);
	for(i = 3; i < 7; i++){
		newObj(aster1, 20 + random(90),random(100), 16, 16, 2);
	}
	count = 4;
	putsprite(1,10,60);
}

void end(){
	for(i = 3; i < 12; i++){
		spritesetvalue(i,S_LIVES,0);
	}
	gotoxy(6,6);
	if(count > 0)
		puts("game  end");
	else
		puts("game  win");
	while(getkey() > 0){};
	while(getkey() == 0){};
	clearscreen();
	init();
}

void main(){
init();
	while(1){
		if(spritegetvalue(1,S_X) < 0)
			spritesetvalue(1,S_X,127);
		else if(spritegetvalue(1,S_X) > 127)
			spritesetvalue(1,S_X,0);
		if(spritegetvalue(1,S_Y) < 0)
			spritesetvalue(1,S_Y,127);
		else if(spritegetvalue(1,S_Y) > 127)
			spritesetvalue(1,S_Y,0);
		collisions();
		if(count == 0)
			end();
		key = getkey();
		if(key & KEY_LEFT)
			direction-=8;
		else if(key & KEY_RIGHT)
			direction+=8;
		if(direction < 0)
			direction += 360;
		if(((key & KEY_UP) > 0 || (key & KEY_A) > 0)&& speed < 20)
			speed++;
		if((key & KEY_DOWN) > 0){
			if(speed > 8)
				speed--;
			else
				speed=0;
		}
		if(key & KEY_B > 0 && spritegetvalue(2,S_LIVES) <= 0){
			spritespeed(2,7,direction);
			spritesetvalue(2,S_ANGLE,direction);
			putsprite(2,spritegetvalue(1,S_X) + 7,spritegetvalue(1,S_Y) + 7);
		}
		if((spritegetvalue(2,S_X) < 0) || (spritegetvalue(2,S_X) > 127) 
				|| (spritegetvalue(2,S_Y) < 0) || (spritegetvalue(2,S_Y) > 127)){
					spritesetvalue(2,S_LIVES,0);
		}
		spritespeed(1,speed/4,direction);
		spritesetvalue(1,S_ANGLE,direction);
		setemitter(50,direction + 130, direction + 210, speed);
		drawparticle(spritegetvalue(1,S_X) + 7, spritegetvalue(1,S_Y) + 7, 3);
		delayredraw();
	}
}