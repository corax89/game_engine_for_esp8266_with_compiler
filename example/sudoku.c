//10x11
char cursor[] = {0x22,0x22,0x22,0x22,0x20,0x20,0x0,0x0,0x0,0x20,0x20,0x0,0x0,0x0,0x20,0x20,0x0,0x0,0x0,0x20,0x20,0x0,0x0,0x0,0x20,0x20,0x0,0x0,0x0,0x20,0x20,0x0,0x0,0x0,0x20,0x20,0x0,0x0,0x0,0x20,0x20,0x0,0x0,0x0,0x20,0x20,0x0,0x0,0x0,0x20,0x22,0x22,0x22,0x22,0x20};
int x, y, game, error;

int sudoku0[] = {0,7,5,0,9,0,0,0,6,0,2,3,0,8,0,0,4,0,8,0,0,0,0,3,0,0,1,5,0,0,7,0,2,0,0,0,0,4,0,8,0,6,0,2,0,0,0,0,9,0,1,0,0,3,9,0,0,4,0,0,0,0,7,0,6,0,0,7,0,5,8,0,7,0,0,0,1,0,3,9,0};
int sudoku1[] = {9,0,6,3,5,0,7,0,1,7,0,3,4,1,0,0,0,9,0,8,0,0,0,0,4,3,0,0,2,7,1,8,0,3,9,0,0,0,9,0,0,4,0,0,2,0,1,8,2,3,9,5,0,0,0,7,5,0,6,0,0,4,8,0,0,0,5,0,0,6,0,3,0,0,0,8,2,1,0,0,0};
int sudoku2[] = {3,0,6,5,0,8,4,0,0,5,2,0,0,0,0,0,0,0,0,8,7,0,0,0,0,3,1,0,0,3,0,1,0,0,8,0,9,0,0,8,6,3,0,0,5,0,5,0,0,9,0,6,0,0,1,3,0,0,0,0,2,5,0,0,0,0,0,0,0,0,7,4,0,0,5,2,0,6,3,0,0};
int sudoku_t[] = {sudoku0, sudoku1, sudoku2};

int sudoku[81];
int initsudoku[81];

void delay(int t){
	settimer(1, t);
	while(gettimer(1)){}
}

int is_complete() {
    for(int p = 0; p < 9; p++){
        for(int q = 0; q < 9; q++){
            if(sudoku[p *  9 + q] == 0){
                return 0;
			}
		}
	}
    return 1;
}

int is_safe(int n, int x, int y) {
	int i, j, a, b; 
	if(n == 0){
		return 1;
	}
    //vertical
    for(i = 0; i < 9; i++) {
        if(n == sudoku[x *  9 + i]){
			if(i != y){
				return 0;
			}
		}
    }
    //horizontal
    for(i = 0; i < 9; i++) {
        if(n == sudoku[i *  9 + y]){
			if(i != x){
				return 0;
			}
		}
    }
	a = (x / 3) * 3; 
    b = (y / 3) * 3;
	//square
    for(i = a; i < a + 3; i++) {
        for(j = b; j < b + 3; j++) {
            if(n == sudoku[i *  9 + j]){
				if(!(i == x && j == y)){
					return 0;
				}
			}
        }
    }
    return 1;
}

void print(int sudoku[]) {
	int p,q;
	error = 0;
	delayredraw();
	gotoxy(2,1);
    for(p = 0; p < 9;p++) {
        for(q = 0; q < 9; q++) {
			if(sudoku[p *  9 + q] > 0){
				if(initsudoku[p *  9 + q] > 0){
					setcolor(1);
				}
				else if(!is_safe(sudoku[p *  9 + q], p, q)){
					error++;
					setcolor(2);
				}
				else{
					setcolor(13);
				}
            	printf("%d ", sudoku[p *  9 + q]);
			}
			else{
				setcolor(1);
				printf("* ");
			}
        }
		if(!((p + 1) % 3)){
			printf("\n");
		}
        printf("\n  ");
    }
	setcolor(1);
	for(p = 0; p < 4; p++){
		line(8 + p * 36, 4, 8 + p * 36, 100);
		line(8, 4 + p * 32, 116, 4 + p * 32);
	}
}

void swap_rows(int x1, int x2){
	int i, n;
	if(x1 > 2){
		x2 = (x1 / 3) * 3 + x2;
	}
	if(x1 == x2){
		return;
	}
	x1 = x1 * 9;
	x2 = x2 * 9;
	for(i = 0; i < 9; i++){
		n = sudoku[x1 + i];
		sudoku[x1 + i] = sudoku[x2 + i];
		sudoku[x2 + i] = n;
	}
}

void swap_col(int y1, int y2){
	int i, n;
	if(y1 > 2){
		y2 = (y1 / 3) * 3 + y2;
	}
	if(y1 == y2){
		return;
	}
	for(i = 0; i < 9; i++){
		n = sudoku[y1 + i * 9];
		sudoku[y1 + i * 9] = sudoku[y2 + i * 9];
		sudoku[y2 + i * 9] = n;
	}
}

void swap_num(int n1, int n2){
	int i;
	if(n1 == n2){
		return;
	}
	for(i = 0; i < 81; i++){
		if(sudoku[i] == n1){
			sudoku[i] = n2;
		}
		else if(sudoku[i] == n2){
			sudoku[i] = n1;
		}
	}
}

void init(int s[]){
	int i;
	spritesetvalue(1, S_WIDTH, 10);
	spritesetvalue(1, S_HEIGHT, 11);
	getsprite(1, cursor);
	spritesetvalue(2, S_WIDTH, 10);
	spritesetvalue(2, S_HEIGHT, 11);
	getsprite(2, cursor);
	x = 0;
	y = 0;
	for(i = 0; i < 81; i++){
		sudoku[i] = s[i];
	}
	for(i = 0; i < 6; i++){
		swap_rows(random(8), random(2));
		swap_col(random(8), random(2));
		swap_num(1 + random(8), 1 + random(8));
	}
	for(i = 0; i < 81; i++){
		initsudoku[i] = sudoku[i];
	}
	game = 1;
}

int numberInput(){
	int key, cx, i;
	cx = 0;
	gotoxy(1, 14);
	printf("0 1 2 3 4 5 6 7 8 9");
	putsprite(2, 4 + cx * 12, 110);
	while(getkey() == KEY_A){}
	key = 0;
	while(key != KEY_A){
		key = getkey();
		if(key & KEY_LEFT){
			if(cx > 0){
				cx--;
			}
			else{
				cx = 9;
			}
		}
		if(key & KEY_RIGHT){
			if(cx < 9){
				cx++;
			}
			else{
				cx = 0;
			}
		}
		if(key){
			putsprite(2, 4 + cx * 12, 110);
			delay(200);
		}
		delayredraw();
	}
	spritesetvalue(2, S_LIVES, 0);
	gotoxy(1, 14);
	for(i = 0; i < 20; i++){
		putchar(' ');
	}
	return cx;
}

void step(){
	int key;
	key = getkey();
	if(key & KEY_UP && y > 0){
		y--;
	}
	if(key & KEY_DOWN && y < 8){
		y++;
	}
	if(key & KEY_LEFT && x > 0){
		x--;
	}
	if(key & KEY_RIGHT && x < 8){
		x++;
	}
	if(key & KEY_A){
		if(!initsudoku[y *  9 + x]){
			sudoku[y *  9 + x] = numberInput();
		}
		print(sudoku);
		if(is_complete() && error == 0){
			game = 0;
		}
	}
	putsprite(1, 10 + x * 12, 5 + y * 9 + (y / 3) * 5);
	if(key){
		delay(200);
	}
}

int main(void) {
	int i;
	while(1){
		init(sudoku_t[random(2)]);
	    print(sudoku);
		while(game){
			step();
			delayredraw();
		}
		gotoxy(6, 14);
		printf("you win!");
		delay(1000);
		while(!getkey()){}
	}
}
