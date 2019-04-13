//16x9rle
char leftinput[] = {0x8,0x55,0x8,0x0,0x82,0x10,0x2,0x0,0x82,0x10,0x4,0x0,0x86,0x1,0x0,0x1,0x0,0x1,0x4,0x0,0x2,0x10,0x8b,0x0,0x11,0x10,0x11,0x10,0x1,0x0,0x1,0x0,0x1,0x3,0x0,0x82,0x10,0x2,0x0,0x82,0x10,0xc,0x0,0x8,0x55};
char rightinput[] = {0x8,0x55,0xc,0x0,0x85,0x11,0x0,0x1,0x10,0x4,0x0,0x82,0x10,0x2,0x0,0x82,0x10,0x4,0x0,0x82,0x10,0x2,0x0,0x82,0x10,0x4,0x0,0x82,0x10,0x2,0x0,0x8a,0x10,0x1,0x0,0x1,0x0,0x11,0x0,0x1,0x10,0x2,0x0,0x82,0x1,0x5,0x0,0x8,0x55};
//12x9rle
char endinput[] = {0x6,0x55,0x6,0x0,0x86,0x11,0x0,0x11,0x0,0x1,0x6,0x10,0x82,0x0,0x2,0x10,0x85,0x11,0x0,0x10,0x0,0x5,0x10,0x84,0x0,0x11,0x0,0x2,0x10,0x83,0x1,0x10,0x6,0x0,0x6,0x55};
//10x3
char cursor[] = {0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa,0xaa};

char operators[] = {'>', '<', '+', '-', '.', ',', '[', ']'};

char screen[256];
char mem[1024];

int key, prevkey, x, pos, lastpos, i, mempos, screenpos, bracketcount;

void init(){
	setimagesize(3);
	putimagerle(leftinput, 0, 102, 16,9);
	putimagerle(rightinput, 48, 102, 16,9);
	putimagerle(endinput, 96, 102, 12,9);
	setimagesize(1);
	getsprite(1, cursor);
	spritesetvalue(1, S_WIDTH, 10);
	spritesetvalue(1, S_HEIGHT, 2);
	putsprite(1, 0, 105);
	getsprite(2, cursor);
	spritesetvalue(2, S_WIDTH, 10);
	spritesetvalue(2, S_HEIGHT, 2);
	putsprite(2, 0, 124);
}

void cls(){
	setbgcolor(0);
	for(i = 0; i < 12; i++){
		gotoxy(0,i);
		putchar(10);
	}
}

void redraw(){
	setbgcolor(0);
	gotoxy(0,0);
	for(i = 0; i < 252; i++){
		putchar(screen[i]);
	}
}

void run(){
	char op;
	mempos = 0;
	screenpos = 0;
	gotoxy(0,1);
	for(i = 0; i < 1024; i++)
		mem[i] = 0;
	while(1){
		op = screen[screenpos];
		switch(op){
			case '>':
				mempos++;
				break;
			case '<':
				mempos--;
				break;
			case '+':
				mem[mempos] += 1;
				break;
			case '-':
				mem[mempos] -= 1;
				break;
			case '.':
				putchar(mem[mempos]);
				break;
			case ',':
				mem[mempos] = getchar();
				break;
			case '[':
				if(mem[mempos] == 0){
					bracketcount = 1;
					while(bracketcount){
						screenpos++;
						if(screenpos > 252)
							return;
						if(screen[screenpos] == '[')
							bracketcount++;
						else if(screen[screenpos] == ']')
							bracketcount--;
					}
				}
				break;
			case ']':
				if(mem[mempos] != 0){
					bracketcount = 1;
					while(bracketcount){
						screenpos--;
						if(screenpos < 0)
							return;
						if(screen[screenpos] == ']')
							bracketcount++;
						else if(screen[screenpos] == '[')
							bracketcount--;
					}
					screenpos--;
				}
				break;
			default:
				settimer(1, 1000);
				while(gettimer(1) != 0){};
				while(getkey() == 0){};
				return;
		}
		screenpos++;
	}
}

void delite(){
	setbgcolor(0);
	gotoxy(pos % 21, pos / 21);
	for(i = pos; i < 252; i++){
		screen[i] = screen[i + 1];
		putchar(screen[i]);
	}
	setbgcolor(10);
	gotoxy(pos % 21, pos / 21);
	putchar(screen[pos]);
}

void insert(){
	for(i = 251; i > pos; i--){
		screen[i] = screen[i - 1];
		if(screen[i] > 0)
			putchar(screen[i]);
	}
}

void keyTest(){
	key = getkey();
	if(key != prevkey){
		if(key == KEY_LEFT){
			if(x > 0)
				x--;
		}
		else if(key == KEY_RIGHT){
			if(x < 10)
				x++;
		}
		if(key == KEY_UP){
			if(pos > 0){
				setbgcolor(0);
				gotoxy(pos % 21, pos / 21);
				putchar(screen[pos]);
				pos--;
				setbgcolor(10);
				gotoxy(pos % 21, pos / 21);
				putchar(screen[pos]);
			}
		}
		else if(key == KEY_DOWN){
			if(pos < lastpos){
				setbgcolor(0);
				gotoxy(pos % 21, pos / 21);
				putchar(screen[pos]);
				pos++;
				setbgcolor(10);
				putchar(screen[pos]);
			}
		}
		else if((key == KEY_A || key == KEY_B) && pos < 252){
			if(x < 8){
				setbgcolor(0);
				insert();
				gotoxy(pos % 21, pos / 21);
				putchar(operators[x]);
				screen[pos] = operators[x];
				if(lastpos < 250)
					lastpos++;
				pos++;				
				setbgcolor(10);
				putchar(screen[pos]);
			}
			else if(x == 8){
				delite();
				if(lastpos > 0)
					lastpos--;
			}
			else if(x == 9){
					cls();
					run();
					redraw();
				}
			else if(x == 10){
					for(i = 0; i < 253; i++)
						screen[i] = 0;
					cls();
					pos = 0;
					lastpos = 0;
				}
		}
		putsprite(1, x * 12, 105);
		putsprite(2, x * 12, 124);
	}
	prevkey = key;
}

void main(){
	init();
	redraw();
	while(1){
		keyTest();
	}
}
