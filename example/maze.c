char wall0[] = {0xaa,0xba,0xaa,0xaa,0xbb,0xbb,0xbb,0xbb,0xaa,0xaa,0xab,0xaa,0xaa,0xaa,0xab,0xaa,0xbb,0xbb,0xbb,0xbb,0x99,0xb9,0x99,0x99,0xbb,0xbb,0xbb,0xbb,0x99,0x99,0x9b,0x99};
char wall1[] = {0xaa,0xba,0xaa,0xaa,0xbb,0xbb,0xbb,0xbb,0xaa,0xaa,0xab,0xaa,0xaa,0xaa,0xab,0xaa,0xbb,0xbb,0xbb,0xbb,0xaa,0xba,0xaa,0xca,0xaa,0xbc,0xcc,0xca,0xaa,0xba,0xaa,0xca};
char wall2[] = {0xff,0xff,0xff,0xff,0xfc,0xff,0xff,0xff,0xff,0xfc,0xff,0xcf,0xff,0xff,0xff,0xff,0xff,0xff,0xcf,0xff,0xfc,0xff,0xff,0xff,0xff,0xff,0xfc,0xff,0xff,0xff,0xff,0xff};

int maze[225];
char stack[100];
char stackpoint = 0;
char x,y,i;
char generate = 1;
int s[4];

char randomCell(){
	char n = random(3);
	if(x == 1)
		s[2] = 1;
	else
		s[2] = maze[x - 2 + y * 15];
	if(x == 13)
		s[0] = 1;
	else
		s[0] = maze[x + 2 + y * 15];
	if(y == 1)
		s[1] = 1;
	else
		s[1] = maze[x + (y - 2) * 15];
	if(y == 13)
		s[3] = 1;
	else
		s[3] = maze[x + (y + 2) * 15];
	if(s[n] != 0){
		i = 8;
		while(i){
			n++;
			if(n > 3)
				n = 0;
			if(s[n] == 0)
				return n;
			i--;
		}
	}
	else
		return n;
	return 4;
}

void nextCell(){
	char n = randomCell();
	if(n == 0){
		x++;
		maze[x + y * 15] = wall2;
		x++;
		maze[x + y * 15] = wall2;
	}
	else if(n == 1){
		y--;
		maze[x + y * 15] = wall2;
		y--;
		maze[x + y * 15] = wall2;
	}
	else if(n == 2){
		x--;
		maze[x + y * 15] = wall2;
		x--;
		maze[x + y * 15] = wall2;
	}
	else if(n == 3){
		y++;
		maze[x + y * 15] = wall2;
		y++;
		maze[x + y * 15] = wall2;
	}
	if(n == 4){
		if(stackpoint < 2){
			generate = 0;
			return;
		}
		stackpoint--;
		y = stack[stackpoint];
		stackpoint--;
		x = stack[stackpoint];
	}
	else{
		stack[stackpoint] = x;
		stackpoint++;
		stack[stackpoint] = y;
		stackpoint++;
	}
	if(n < 4){
		drawtile(4 ,4);
		delayredraw();
	}
}

void main(){
while(1){
	for(x = 0; x < 15; x++){
		for(y = 0; y < 15; y++){
			if(((x + 1) % 2 == 0) & ((y + 1) % 2 == 0))
				maze[x + y * 15] = 0;
			else
				maze[x + y * 15] = wall1;
		}
	}
	loadtile(maze, 8, 8, 15, 15);
	drawtile(4 ,4);
	x = 1;
	y = 1;
	maze[x + y * 15] = wall2;
	while(generate){
		nextCell();
	}
	for(x = 1; x < 14; x++){
		for(y = 0; y < 14; y++){
			if((maze[x + y * 15] == wall1) && (maze[x + (y + 1) * 15] == wall2))
				maze[x + y * 15] = wall0;
		}
	}
	drawtile(4 ,4);
	while(getkey() != KEY_B){}
	generate = 1;
}
}				
					