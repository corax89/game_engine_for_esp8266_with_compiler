//16x11rle
char leftn[] = {0x88,0x11,0x10,0x0,0x10,0x11,0x10,0x11,0x3,0x10,0x86,0x0,0x10,0x0,0x10,0x0,0x3,0x10,0x86,0x0,0x10,0x11,0x10,0x1,0x3,0x10,0x82,0x0,0x2,0x10,0x2,0x0,0x8a,0x10,0x11,0x10,0x0,0x10,0x11,0x10,0x11,0x10,0x8,0x0,0x88,0x11,0x10,0x11,0x10,0x11,0x10,0x11,0x2,0x10,0x83,0x0,0x10,0x2,0x0,0x3,0x10,0x8a,0x11,0x10,0x11,0x10,0x0,0x10,0x11,0x10,0x0,0x3,0x10,0x82,0x0,0x3,0x10,0x88,0x11,0x10,0x11,0x10,0x0,0x10,0x11};
char rightn[] = {0x2,0x10,0x4,0x0,0x83,0x1,0x0,0x2,0x10,0x82,0x1,0x3,0x0,0x2,0x10,0x86,0x11,0x10,0x11,0x10,0x11,0x2,0x10,0x2,0x0,0x83,0x10,0x1,0x3,0x0,0x2,0x10,0x83,0x0,0x10,0x4,0x0,0x82,0x1,0x9,0x0,0x83,0x11,0x10,0x6,0x0,0x4,0x10,0x8a,0x0,0x10,0x11,0x10,0x11,0x10,0x1,0x0,0x1,0x4,0x0,0x4,0x10,0x86,0x0,0x11,0x10,0x11,0x10,0x6,0x0};
//16x3
char cursor1[] = {0xd0,0x0,0x0,0x0,0x0,0x0,0x0,0xd,0xd0,0x0,0x0,0x0,0x0,0x0,0x0,0xd,0xdd,0xdd,0xdd,0xdd,0xdd,0xdd,0xdd,0xdd};
char cursor2[] = {0xdd,0xdd,0xdd,0xdd,0xdd,0xdd,0xdd,0xdd,0xd0,0x0,0x0,0x0,0x0,0x0,0x0,0xd,0xd0,0x0,0x0,0x0,0x0,0x0,0x0,0xd};

char input[] = {'0','1','2','3','4','+','-','c','5','6','7','8','9','*','/','='};

char source[20];
char reverse1[21];
char reverse2[21];
int buffer[41];
int output[41];

int ch, inverse, action, key, prevkey, x, y, i, j, len, length1, length2, length3, position;

void init(){
	getsprite(1, cursor1);
	spritesetvalue(1, S_WIDTH, 16);
	spritesetvalue(1, S_HEIGHT, 3);
	putsprite(1, 0, 83);
	getsprite(2, cursor2);
	spritesetvalue(2, S_WIDTH, 16);
	spritesetvalue(2, S_HEIGHT, 3);
	putsprite(2, 0, 62);
	position = 0;
	for(i = 0; i < 20; i++){
		source[i] = '0';
	}
}

int max(int a, int b){
	if(a > b)
		return a;
	return b;
}

void mathAdd(){
	char l, n;
	l = max(length1, length2);
	for(i = 0; i < l; i++){
		n = reverse1[i] + reverse2[i] + output[i];
		output[i] = n % 10;
		output[i + 1] = n / 10;
	}
	if(n > 9){
		l++;
	}
	length3 = l;
}

void mathSub(){
	int l, n;
	l = max(length1, length2);
	inverse = 0;
	if(length1 < length2)
		inverse = 1;
	else if(length1 == length2 && reverse1[l - 1] < reverse2[l - 1])
		inverse = 1;
	for(i = 0; i < l; i++){
		if(inverse)
			n = reverse2[i] - reverse1[i] + output[i];
		else
			n = reverse1[i] - reverse2[i] + output[i];
		if(n >= 0)
			output[i] = n;
		else{
			output[i + 1] = -1;
			output[i] = n + 10;
		}
	}
	l = 20;
	while(l > 0 && (output[l] <= 0 || output[l] > 9)){
		output[l] = 0;
		l = l - 1;
	}
	length3 = l + 1;
}

void mathMul(){
	int l, n;
	l = max(length1, length2);
	for(i = 0; i < length2; i++){
		for(j = 0; j < length1; j++){
			n = reverse1[j] * reverse2[i] + buffer[i + j];
			buffer[i + j] = n % 10;
			buffer[i + j + 1] = n / 10; 
		}
		if(l <= i + j)
			l = i + j + 1;
		for(j = 0; j < l; j++){
			n = buffer[j] + output[j];
			output[j] = n % 10;
			output[j + 1] = output[j + 1] + (n / 10);
			buffer[j] = 0;
		}
	}
	length3 = l;
}

void mathDiv(){
	int p, n;
	len = length1 - length2;
	length3 = length1;
	p = 0;
	if(len < 0){
		return;
	}
	for(j = 20 - len; j >= 0 ; j--){
		reverse2[j + len] = reverse2[j];
	}	
	for(j = 0; j < len; j++)
		reverse2[j] = 0;
	length2 = length1;
	while(1){
		n = 0;
		while((reverse1[length2] * 10 + reverse1[length2 - 1]) >= reverse2[length2 - 1]){
			mathSub();
			n++;	
			for(j = 0; j < 20; j++){
				reverse1[j] = output[j];
				output[j] = 0;
			}
		}
		len--;
		buffer[p] = n;
		p++;
		if(reverse1[length1 - 1] <= 0)
			length1--;
		length2--;
		for(j = 0; j <= length2; j++){
			reverse2[j] = reverse2[j + 1];
		}
		reverse2[length2] = 0;
		reverse2[length2 + 1] = 0;
		if(len < 0){
			for(j = 0; j <= p; j++){
				output[j] = buffer[p - j - 1];
			}
			length3 = p;
			return;
		}
	}
}

void reverseSource(){
	if(position == 0){
		for(i = 0; i < length1; i++){
			reverse1[length1 - 1 - i] = source[i] - 48;
			source[i] = '0';
		}
	}
	else if(position == 1){
		for(i = 0; i < length2; i++){
			reverse2[length2 - 1 - i] = source[i] - 48;
			source[i] = '0';
		}
	}
}

void addAction(char c){
	if(position == 0){
		if(c != '='){
			action = c;
			gotoxy(18, 2);
			putchar(c);
			reverseSource();
			position = 1;
		}
	}
	else if(c == '='){	
		reverseSource();
		position = 2;
		gotoxy(18, 4);
		putchar('=');
		if(action == '+')
			mathAdd();
		if(action == '-')
			mathSub();
		if(action == '*')
			mathMul();
		if(action == '/')
			mathDiv();
	}
}

void printSource(){
	if(position == 0){
		gotoxy(0, 1);
		putchar(10);
		gotoxy(20 - length1, 1);
		for(i = 0; i < length1; i++)
			putchar(source[i]);
	}
	else if(position == 1){
		gotoxy(0, 3);
		putchar(10);
		gotoxy(20 - length2, 3);
		for(i = 0; i < length2; i++)
			putchar(source[i]);
	}
	else if(position == 2){
		gotoxy(0, 5);
		putchar(10);
		gotoxy(0, 5);
		if(action == '-' && inverse)
			putchar('-');
		for(i = length3 - 1; i >= 0; i--)
			putchar(output[i] + 48);
	}
}

void clear(){
	gotoxy(0,0);
	for(i = 0; i < 7; i++)
		putchar(10);
	position = 0;
	length1 = 0;
	length2 = 0;
	for(i = 0; i < 40; i++)
		output[i] = 0;
}

void del(){
	if(position == 0){
		if(length1 > 0){
			length1--;
			source[length1] = 0;
		}
	}
	else if(position == 1){
		if(length2 > 0){
			length2--;
			source[length2] = 0;
		}
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
			if(x < 7)
				x++;
		}
		if(key == KEY_UP){
			if(y > 0)
				y--;
		}
		else if(key == KEY_DOWN){
			if(y < 1)
				y++;
		}
		else if(key == KEY_A){
			ch = input[x + y * 8];
			if(position == 2){
				clear();
			}			
			if(ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '=')
				addAction(ch);
			else if(ch == 'c')
				clear();
			else if(position == 0){
				if(length1 < 20){
					source[length1] = ch;
					length1++;
				}
			}
			else if(position == 1){
				if(length2 < 20){
					source[length2] = ch;
					length2++;
				}
			}
			printSource();
		}
		else if(key == KEY_B){
			del();
			printSource();
		}
		putsprite(1, x * 16, 83 + y * 24);
		putsprite(2, x * 16, 62 + y * 24);
	}
	prevkey = key;
}

void main(){
	init();
	setimagesize(4);
	putimagerle(leftn, 2, 64, 16,11);
	putimagerle(rightn, 66, 64, 16,11);
	while(1){
		keyTest();
	}
}