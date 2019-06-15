#define RED_F  1
#define BLUE_F 2
//14x13
char redF[] = {0x0,0x0,0x2,0x22,0x0,0x0,0x0,0x0,0x2,0x22,0x22,0x22,0x0,0x0,0x0,0x22,0x22,0x22,0x22,0x20,0x0,0x2,0x22,0x22,0x22,0x22,0x20,0x0,0x2,0x22,0x22,0x22,0x22,0x22,0x0,0x22,0x22,0x22,0x22,0x22,0x22,0x20,0x22,0x22,0x22,0x22,0x22,0x22,0x20,0x22,0x22,0x22,0x22,0x22,0x22,0x20,0x2,0x22,0x22,0x22,0x22,0x22,0x0,0x2,0x22,0x22,0x22,0x22,0x22,0x0,0x0,0x22,0x22,0x22,0x22,0x20,0x0,0x0,0x2,0x22,0x22,0x22,0x0,0x0,0x0,0x0,0x2,0x22,0x0,0x0,0x0};
char blueF[] = {0x0,0x0,0x3,0x33,0x0,0x0,0x0,0x0,0x3,0x30,0x0,0x33,0x0,0x0,0x0,0x30,0x0,0x0,0x0,0x30,0x0,0x3,0x0,0x3,0x33,0x0,0x3,0x0,0x3,0x0,0x30,0x30,0x30,0x3,0x0,0x30,0x3,0x3,0x3,0x3,0x0,0x30,0x30,0x3,0x30,0x30,0x33,0x0,0x30,0x30,0x3,0x3,0x3,0x3,0x0,0x30,0x3,0x0,0x30,0x30,0x30,0x3,0x0,0x3,0x0,0x3,0x33,0x0,0x3,0x0,0x0,0x30,0x0,0x0,0x0,0x30,0x0,0x0,0x3,0x30,0x0,0x33,0x0,0x0,0x0,0x0,0x3,0x33,0x0,0x0,0x0};

int field[42];
int weightArray[7];
int indexWArray[7];
int key,lastkey,x,y,cursorx,game,freeCell,ywin,cwin;

void sort(){
	int i, j, min_i, temp, tempx; 
	for (i = 0; i < 6; i++) {
		min_i = i;
		for (j = i + 1; j < 7; j++) {
			if (weightArray[j] < weightArray[min_i]) {
				min_i = j;
			}
		}
		temp = weightArray[i];
		tempx = indexWArray[i];
		weightArray[i] = weightArray[min_i];
		indexWArray[i] = indexWArray[min_i];
		weightArray[min_i] = temp;
		indexWArray[min_i] = tempx;
	}
}	

void init(){
	int x,y,i;
	clearscreen();
	for(i = 0; i < 42; i++)
		field[i] = 0;
	for(x = 0; x <= 7; x++)
		for(y = 0; y <= 6; y++){
			line(x * 16 + 8, y * 16 + 14, 8, y * 16 + 14);
			line(x * 16 + 8, 15, x * 16 + 8, y * 16 + 14);
		}
	gotoxy(1,14);
	printf("Win: you %d", ywin);
	gotoxy(6,15);
	printf("computer %d ", cwin);
	getsprite(1, redF);
	spritesetvalue(1, S_WIDTH, 14);
	spritesetvalue(1, S_HEIGHT, 13);
	spritesetvalue(1, S_SPEEDY, 0);
	spritesetvalue(1, S_SPEEDX, 0);
	putsprite(1,10,0);
	game = 1;
	freeCell = 42;
	cursorx = 0;
}

int testField(int newF, int newX, int newY){
	int i,j,count,maxCount;
	count = 0;
	maxCount = 0;
	//test vertical
	for(i = 0; i < 6; i++){
		if(field[newX + i * 7] == newF){
			count++;
			if(count > maxCount)
				maxCount = count;
		}
		else if(field[newX + i * 7] != 0){
			i = 6;
		}
	}
	count = 0;
	//test horisontal
	for(i = newX; i < 7; i++){
		if(field[i + newY * 7] == newF){
			count++;
		}
		else{
			i = 7;
		}
	}
	for(i = newX - 1; i >= 0; i--){
		if(field[i + newY * 7] == newF){
			count++;
		}
		else{
			i = -1;
		}
	}
	if(count > maxCount)
		maxCount = count;
	/*test diagonal
		--/
		-/-
		/--
	*/
	count = 0;
	j = y;
	for(i = x; i < 7; i++){
		if(j >= 0){
			if(field[i + j * 7] == newF){
				count++;
			}
			else{
				i = 7;
			}
		}
		else
			i = 7;
		j--;
	}
	j = y;
	for(i = x - 1; i >= 0; i--){
		j++;
		if(j < 6){
			if(field[i + j * 7] == newF){
				count++;
			}
			else{
				i = 0;
			}
		}
		else
			i = 0;
	}
	if(count > maxCount)
		maxCount = count;
	/*test diagonal2
		\--
		-\-
		--\
	*/
	count = 0;
	j = y;
	for(i = x; i < 7; i++){
		if(j < 6){
			if(field[i + j * 7] == newF){
				count++;
			}
			else{
				i = 7;
			}
		}
		else
			i = 7;
		j++;
	}
	j = y;
	for(i = x - 1; i >= 0; i--){
		j--;
		if(j >= 0){
			if(field[i + j * 7] == newF){
				count++;
			}
			else{
				i = 0;
			}
		}
		else
			i = 0;
	}	
	if(count > maxCount)
		maxCount = count;
	return maxCount;
}

void animation(int fig, int nx, int ny){
	int i;
	if(fig == BLUE_F)
		getsprite(1, blueF);
	for(i = 0; i < 12; i++){
		putsprite(1,nx, i * 8);
		delayredraw();
		if((16 + i * 8) > ny)
			i = 12;
	}
	getsprite(1, redF);
}

void dropFigure(int fig){
	int i;
	for(i = 5; i >= 0; i--)
		if(field[x + i * 7] == 0){
			field[x + i * 7] = fig;
			animation(fig, 10 + x * 16, 16 + i * 16); 
			if(fig == BLUE_F)
				putimage(blueF, 10 + x * 16, 16 + i * 16, 14, 13);
			else
				putimage(redF, 10 + x * 16, 16 + i * 16, 14, 13);
			y = i;
			return;
		}
	y = -1;
}

int testDropFigure(){
	int i;
	for(i = 5; i >= 0; i--)
		if(field[x + i * 7] == 0){
			field[x + i * 7] = BLUE_F;
			y = i;
			return i;
		}
	return (-1);
}

void step(){
	int moveMade;
	moveMade = 0;
	while(moveMade == 0){
		key = getkey();
		if(key != lastkey){
			lastkey = key;
			if(key == KEY_LEFT && cursorx > 0)
				cursorx--;
			if(key == KEY_RIGHT && cursorx < 6)
				cursorx++;
			if(key == KEY_A || key == KEY_B || key == KEY_DOWN){
				if(field[cursorx] == 0){
					moveMade = 1;
					x = cursorx;
					dropFigure(RED_F);
				}
			}
			putsprite(1,10 + cursorx * 16,0);
		}
	}
}

void aistep(){
	int i,j,saveX, saveY, maxCount;
	maxCount = 0;
	for(i = 0; i < 7; i++){
		x = i;
		if(testDropFigure() > -1){
			weightArray[x] = testField(BLUE_F, x, y);
			if(weightArray[x] > 3)
				weightArray[x] = 99;
			else{
				saveX = x;
				saveY = y;
				for(j = 0; j < 7; j++){
					x = j;
					if(testDropFigure() > -1){
						field[x + y * 7] = RED_F;
						if(testField(RED_F, x, y) > 3)
							weightArray[saveX] = -9;
						field[x + y * 7] = 0;
					}
				}
				x = saveX;
				y = saveY;
			}
			field[x + y * 7] = RED_F;
			weightArray[x] = weightArray[x] + (testField(RED_F, x, y) * 2);
			field[x + y * 7] = 0;
		}
		else{
			weightArray[x] = 0;
		}
		indexWArray[x] = x;
	}
	sort();
	for(i = 5; i >= 0; i--){
		if(weightArray[i] == weightArray[6]){
			maxCount++;
		}
		else{
			i = 0;
		}
	}
	i = 6 - random(maxCount);
	x = indexWArray[i];
	dropFigure(BLUE_F);
}

void testWin(int newF){
	int l;
	l = testField(newF, x, y);
	if(l > 3){
		game = 0;
		spritesetvalue(1, S_LIVES, 0);
		gotoxy(5,0);
		if(newF == BLUE_F){
			puts("Computer win!");
			cwin++;
		}
		else{
			puts("You win!");
			ywin++;
		}
	}
	freeCell--;
	if(freeCell <= 0)
		game = 0;
}

void main(){
	ywin = 0;
	cwin = 0;
	while(1){
		init();
		while(game){
			step();
			testWin(RED_F);
			if(game){
				aistep();
				testWin(BLUE_F);
			}
		}
		settimer(0,1000);
		while(gettimer(0) != 0){}
		while(getkey() == 0){}
	}
}
