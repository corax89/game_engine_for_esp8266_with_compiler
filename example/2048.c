int arr[16];
int i,ii,j,score;
char key,r,ok,end,newn;

void init(){
	for(i = 0; i < 16; i++)
		arr[i] = 0;
	score = 0;
	gotoxy(3,3);
	printf("\n");
}

int shiftLeft(char n){
	for(ii = 0; ii < 4;ii++)
	for(i = n*4; i < n*4 + 3; i++)
		if(arr[i] == 0){
			arr[i] = arr[i + 1];
			arr[i + 1] = 0;
		}
	for(i = n*4; i < n*4 + 3; i++)
		if(arr[i] == arr[i + 1]){
			arr[i] = arr[i] * 2;
			score = score + arr[i];
			arr[i + 1] = 0;
		}
	for(ii = 0; ii < 4;ii++)
	for(i = n*4; i < n*4 + 3; i++)
		if(arr[i] == 0){
			arr[i] = arr[i + 1];
			arr[i + 1] = 0;
		}
}

int shiftRight(char n){
	for(ii = 0; ii < 4;ii++)
	for(i = n*4 + 3; i > n*4 ; i--)
		if(arr[i] == 0){
			arr[i] = arr[i - 1];
			arr[i - 1] = 0;
		}
	for(i = n*4 + 3; i > n*4 ; i--)
		if(arr[i] == arr[i - 1]){
			arr[i - 1] = arr[i - 1] * 2;
			score = score + arr[i - 1];
			arr[i] = 0;
		}
	for(ii = 0; ii < 4;ii++)
	for(i = n*4 + 3; i > n*4 ; i--)
		if(arr[i] == 0){
			arr[i] = arr[i - 1];
			arr[i - 1] = 0;
		}
}

int shiftUp(char n){
	for(ii = 0; ii < 4;ii++)
	for(i = n; i < n + 12; i = i + 4)
		if(arr[i] == 0){
			arr[i] = arr[i + 4];
			arr[i + 4] = 0;
		}
	for(i = n; i < n + 12; i = i + 4)
		if(arr[i] == arr[i + 4]){
			arr[i] = arr[i] * 2;
			score = score + arr[i];
			arr[i + 4] = 0;
		}
	for(ii = 0; ii < 4;ii++)
	for(i = n; i < n + 12; i = i + 4)
		if(arr[i] == 0){
			arr[i] = arr[i + 4];
			arr[i + 4] = 0;
		}
}

int shiftDown(char n){
	for(ii = 0; ii < 4;ii++)
	for(i = n + 12; i > n; i = i - 4)
		if(arr[i] == 0){
			arr[i] = arr[i - 4];
			arr[i - 4] = 0;
		}
	for(i = n + 12; i > n; i = i - 4)
		if(arr[i] == arr[i - 4]){
			arr[i - 4] = arr[i - 4] * 2;
			score = score + arr[i - 4];
			arr[i] = 0;
		}
	for(ii = 0; ii < 4;ii++)
	for(i = n + 12; i > n; i = i - 4)
		if(arr[i] == 0){
			arr[i] = arr[i - 4];
			arr[i - 4] = 0;
		}
}

void draw(){
	gotoxy(3,3);
	printf("score %d", score);
	gotoxy(0,5);
	for(j = 0; j < 4; j++){
		printf("\n\n");
		for(i = 0; i < 4; i++)
			printf("%d\t",arr[j * 4 + i]);
	}
}

void onkey(){
	for(j = 0; j < 4; j++)
	switch(key){
		case 1:
				shiftUp(j);
				break;
		case 2:
				shiftDown(j);
				break;
		case 4:
				shiftLeft(j);
				break;
		case 8:
				shiftRight(j);
				break;
	}
}

void rand(){
	ok = 1;
	j = 0;
	newn = 2;
	r = random(10);
	if(r == 1)
		newn = 4;
	while(ok){
		r = random(16);
		j++;
		if(arr[r] == 0){
			arr[r] = newn;
			ok = 0;
		}
		if(j > 1000){
			ok = 0;
			end = 1;
		}
	}
}
		
void main(){
	end = 0;
	init();
	rand();
	draw();
	while(1){
		key = getkey();
		if(key){
			onkey();
			rand();
			draw();
			while(getkey() != 0){};
		}
		if(end == 1){
			gotoxy(0,5);
			printf("\n game over \n");
			end = 0;
			init();
		}
	}
}		

					