char sp[] = {0x0,0x22,0x22,0x0,0x2,0x22,0x22,0x20,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x2,0x22,0x22,0x20,0x0,0x22,0x22,0x0};
char bl[] = {0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55};

int t[] ={
	bl,0,0,0,0,0,0,0,0,0,0,0,0,0,0,bl,
	bl,0,0,0,0,0,0,0,0,0,0,0,0,0,0,bl,
	bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,
	bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl,bl
}

char j,x;
int a = 0;

void main(){
	loadtile(t,8,8,16,4);
	drawtile(0,100);
	for (j = 0; j < 32; j++){
		getsprite(j,sp);
		putsprite(j, 30 + (j/4)*9 + (j % 4) * 3, 40 + (j % 4) * 12);
		spritespeedx(j, 0);
		spritespeedy(j, 0);
		spritesetvalue(j,S_WIDTH,8);
		spritesetvalue(j,S_HEIGHT,8);
		spritesetvalue(j,S_SOLID,1);
		spritesetvalue(j,S_SPEEDX,random(32) - 16);
		spritesetvalue(j,S_SPEEDY,random(32) - 16);
		spritesetvalue(j,S_GRAVITY,1);
	}
	while(1){
		for (j = 0; j < 32; j++){
			spritesetvalue(j,S_ANGLE,a);
			if(spritegetvalue(j, S_X) < 2)
				spritespeedx(j, 1);
			if(spritegetvalue(j, S_X) >118)
				spritespeedx(j, -1);
			if(spritegetvalue(j, S_Y) < 2)
				spritespeedy(j, 1);
			if(spritegetvalue(j, S_Y) > 118)
				spritespeedy(j, -1);
		}
		delayredraw();
	}
}


