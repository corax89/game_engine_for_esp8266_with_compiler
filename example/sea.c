//6x4
char fish11[] = {0x0,0x50,0x0,0x5,0x55,0x5,0x54,0x55,0x50,0x5,0x59,0x5};
char fish12[] = {0x0,0x50,0x0,0x5,0x55,0x9,0x54,0xd5,0x59,0x5,0x59,0x9};
	
void init(){
	getsprite(1, fish11);
	spritesetvalue(1, S_WIDTH, 6);
	spritesetvalue(1, S_HEIGHT, 4);
	spritesetvalue(1, S_SOLID, 1);
	spritesetvalue(1, S_SPEEDY, 0);
	spritesetvalue(1, S_SPEEDX, 0);
	putsprite(1, 65, 60);
}

void main(){
	init();
	while(1){
		getsprite(1, fish11);
		delayredraw();
		delayredraw();
		delayredraw();
		delayredraw();
		getsprite(1, fish12);
		delayredraw();
		delayredraw();
		delayredraw();
		delayredraw();
	}
}
