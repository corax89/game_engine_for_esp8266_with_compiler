char m0[] = "Mozart:d=16,o=5,b=125:16d#,c#,c,c#,8e,8p,f#,e,d#,e,8g#,8p,a,g#,g,g#,d#6,c#6,c6,c#6,d#6,c#6,c6,c#6,4e6,8c#6,8e6,32b,32c#6,d#6,8c#6,8b,8c#6,32b,32c#6,d#6,8c#6,8b,8c#6,32b,32c#6,d#6,8c#6,8b,8a#,4g#,d#,32c#,c,c#,8e,8p,f#,e,d#,e,8g#,8p,a,g#,g,g#,d#6,c#6,c6,c#6,d#6,c#6,c6,c#6,4e6,8c#6,8e6,32b,32c#6,d#6,8c#6,8b,8c#6,32b,32c#6,d#6,8c#6,8b,8c#6,32b,32c#6,d#6,8c#6,8b,8a#,4g#";
char m1[] = "Deep Purple:d=4,o=4,b=112:c,d#,f.,c,d#,8f#,f,p,c,d#,f.,d#,c,2p,8p,c,d#,f.,c,d#,8f#,f,p,c,d#,f.,d#,c"
char m2[] = "Mission Impossible:d=16,o=5,b=100:32d,32d#,32d,32d#,32d,32d#,32d,32d#,32d,32d,32d#,32e,32f,32f#,32g,g,8p,g,8p,a#,p,c6,p,g,8p,g,8p,f,p,f#,p,g,8p,g,8p,a#,p,c6,p,g,8p,g,8p,f,p,f#,p,a#,g,2d,32p,a#,g,2c#,32p,a#,g,2c,p,a#4,c";

int position,key,prevkey;

void printName0(){
	int i = 0;
	while(m0[i] != 0 && m0[i] != ':'){
		putchar(m0[i]);
		i++;
	}
}

void printName1(){
	int i = 0;
	while(m1[i] != 0 && m1[i] != ':'){
		putchar(m1[i]);
		i++;
	}
}

void printName2(){
	int i = 0;
	while(m2[i] != 0 && m2[i] != ':'){
		putchar(m2[i]);
		i++;
	}
}

void main(){
	position = 0;
	loadrtttl(m0,1);
	playrtttl();
	int color,i,l;
	color = 0;
	setcolor(3);
	gotoxy(2,1);
	printName0();
	gotoxy(2,3);
	printName1();
	gotoxy(2,5);
	printName2();
	gotoxy(4,9);
	puts("key A - play,\n    key B - tone");
	setpallette(2, 0);
	while(1){
		setcolor(2);
		line(4, 16 + position * 16, 123, 16 + position * 16);
		key = getkey();
		if(key != prevkey){
			if(key == KEY_DOWN && position < 2)
				position++;
			if(key == KEY_UP && position > 0)
				position--;
			if(key == KEY_A){
				if(position == 0)
					loadrtttl(m0,1);
				else if(position == 1)
					loadrtttl(m1,1);
				else if(position == 2)
					loadrtttl(m2,1);
				playrtttl();
			}
			prevkey = key;
		}
		if(key == KEY_B)
			tone(300,600);
		setcolor(3);
		line(4, 16 + position * 16, 123, 16 + position * 16);
		color = color + 10;
		setledcolor(color);
		setpallette(1, color);
		for(i = 0; i < 16; i++){
			setcolor(2);
			line(i * 8, 127, i * 8, 102);
			setcolor(1);
			line(i * 8, 127, i * 8, 122 - random(20));
		}
		delayredraw();
	}
}
