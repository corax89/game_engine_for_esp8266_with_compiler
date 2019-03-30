void main(){
	char key;
	while(1){
		clearscreen();
		key = getkey();
		gotoxy(0,0);
		printf("key %d \n", key);
		if(key & KEY_UP)
			printf(" key up");
		if(key & KEY_DOWN)
			printf(" key down");
		if(key & KEY_LEFT)
			printf(" key left");
		if(key & KEY_RIGHT)
			printf(" key right");
		if(key & KEY_A)
			printf(" key A");
		if(key & KEY_B)
			printf("key B");
		delayredraw();
	}
}