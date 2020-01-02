/*settings*{"name":"microbasic","author":"corax","image":[102,102,102,102,102,102,102,102,102,102,102,102,54,102,54,51,54,99,54,99,51,102,99,54,51,99,54,99,102,54,99,99,102,54,54,99,54,54,54,99,102,54,102,99,51,102,54,99,54,102,54,99,102,54,99,99,102,54,54,99,54,102,54,51,54,99,54,99,102,54,99,54,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,51,54,102,99,102,102,51,102,51,54,99,54,54,99,102,54,54,99,102,54,99,102,54,99,54,99,99,102,99,99,102,102,99,102,54,102,51,54,99,51,51,102,51,102,99,102,54,102,54,99,99,102,99,102,102,54,99,102,54,102,54,99,99,102,99,99,102,54,99,102,54,99,51,54,99,102,99,102,51,102,51,54,99,54,102,102,102,102,102,102,102,102,102,102,102,102]}*/
#define INPUT_SIZE  1024
#define TOKENS_SIZE 512
#define STRING_SIZE 128
#define BUFFER_SIZE 128
#define STACK_SIZE  64

//char input[] = "\n500 A=1\n510 B=2\n520 I=0\n530 I=I+1\n540 PRINT A\n550 PRINT \" \"\n560 PRINT B\n570 PRINT \" \"\n580A=A+B\n590B=A+B\n600 IF I<=9 THEN GOTO 530\n610 END";
char input[1024];
char helpstr[] = "Support command:\nNEW LIST RUN PRINT   GOTO IF THEN\nVariable A-Z\n";
char tittlestr[] = "Micro basic\nenter HELP\nfor information\n";
int tokens[TOKENS_SIZE];
int strings[STRING_SIZE];
int stringsEd[STRING_SIZE];
int stringsNumber[STRING_SIZE];
int stack[STACK_SIZE];
int variable[26];
char stringBuffer[BUFFER_SIZE];
int tSize, sSize, thisToken, thisString, stackPointer, stringBufLen, isIf;
int tl = 1;
int lastString = 0;

void clearInput(){
	int i;
	input[0] = 0xA;
	for(i = 1; i < INPUT_SIZE; i++){
		input[i] = 0;
	}
}

int findStringNumber(int n){
	int i;
	for(i = 0; i < lastString; i++){
		if(stringsNumber[i] == n)
			return i;
	}
	return (-1);
}

int isChar(int c){
	if(c >= 0x41 && c <= 0x7A){
		return 1;
	}
	return 0;
}

int isNumber(int c){
	if(c >= 0x30 && c <= 0x39){
		return 1;
	}
	return 0;
}

int isOperator(int c){
	if((c >= 0x21 && c <= 0x2F) || (c >= 0x3A && c <= 0x3F)){
		return 1;
	}
	return 0;
}

void tokenize(){
	int i,j,c,t,s,num;//i,j,char,token,string
	int lastType = 0;
	s = 0;
	strings[s] = 0;
	t = 0;
	tokens[t] = 0;
	for(i = 0; i < TOKENS_SIZE; i++){
		c = input[i];
		if(c == 0){
			tSize = t;
			sSize = s + 1;
			t++;
			tokens[t] = i;
			return;
		}
		else if(c == 0x0A){//new line
			s++;
			t++;
			strings[s] = t + 1;
			tokens[t] = i;
			lastType = 0;
			j = 1;
			num = 0;
			while(j < 6 && isNumber(input[i + j])){
				num = num * 10 + (input[i + j] - 0x30);
				j++;
			}
			stringsNumber[s - 1] = num;
		}
		else if(c == 0x20){//space
			while(input[i + 1] == ' ') {
				i++;
			}
			lastType = 0;
		}
		else if(c == '"'){//string
			t++;
			tokens[t] = i;
			i++;
			while(input[i] != '"') {
				i++;
			}
			lastType = 0;
		}
		else if(isChar(c)){
			if(lastType != 1){
				lastType = 1;
				t++;
				tokens[t] = i;
			}
		}
		else if(isNumber(c)){
			if(lastType != 2){
				lastType = 2;
				t++;
				tokens[t] = i;
			}
		}
		else if(isOperator(c)){
			if(lastType != 3){
				lastType = 3;
				t++;
				tokens[t] = i;
			}
		}
	}
	tSize = t;
	sSize = s + 1;
	t++;
	tokens[t] = i;
}

void getToken(int n){
	int i = 0;
	if(n < tSize){
		if(input[(tokens[n])] != '"'){
			while(tokens[n] + i < tokens[n + 1] && input[(tokens[n] + i)] != ' ' && i < BUFFER_SIZE){
				stringBuffer[i] = input[(tokens[n] + i)];
				i++;
			}
		}
		else{
			i++;
			while(tokens[n] + i < tokens[n + 1] && input[(tokens[n] + i)] != '"' && i < BUFFER_SIZE){
				stringBuffer[i - 1] = input[(tokens[n] + i)];
				i++;
			}
			i--;
		}
		stringBuffer[i] = 0;
		stringBufLen = i;
	}
}

int nextToken(){
	if(thisToken < tSize){
		thisToken++;
		return 1;
	}
	return 0;
}

int compare(char s1[], char s2[]){
	char i;
	i = 0;
	while(s1[i] != 0 || s2[i] != 0){
		if(s1[i] != s2[i] || i >= 128){
			return 0;
		}
		i++;
	}
	return 1;
}

void pushStack(int n){
	int i;
	if(stackPointer < STACK_SIZE){
		stack[stackPointer] = n;
		stackPointer++;
	}
	else{
		printf("\nstack:\n");
		for(i = 0; i < 64; i++){
			printf("%d",stack[i]);
			putchar(',');
		}
		thisToken = tSize;
	}
}

int popStack(){
	if(stackPointer > 0){
		stackPointer--;
		return stack[stackPointer];
	}
	return 0;
}

void gotoadr(int n){
	int i;
	i = findStringNumber(n);
	if(i >= 0){
		thisToken = strings[i + 1];
	}
	else{
		printf("\nerror: string %d not found", n);
	}
}

int execToken(){
	int c, j, number, a, b;
	getToken(thisToken);
	/*
	puts(stringBuffer);		
	putchar('[');
	putn(thisToken);
	putchar(']');
	*/
	c = stringBuffer[0];
	if(c == 0xA){
		stackPointer = 0;
		nextToken();
		execToken();
		thisString = popStack();
		if(isIf){
			isIf = 0;
			printf("Error. After IF expected THEN in string %d\n", thisString);
			thisToken = tSize;
		}
	}
	else if(isOperator(c)){
		if(c == '='){
			nextToken();
			execToken();
			if(isIf){
				nextToken();
				execToken();
				a = popStack();
				b = popStack();
				pushStack(b == a);
			}
		}
		else if(c == '+'){
			nextToken();
			execToken();
			a = popStack();
			b = popStack();
			pushStack(a + b);
		}
		else if(c == '-'){
			nextToken();
			execToken();
			a = popStack();
			b = popStack();
			pushStack(b - a);
		}
		else if(c == '*'){
			nextToken();
			execToken();
			a = popStack();
			b = popStack();
			pushStack(a * b);
		}
		else if(c == '/'){
			nextToken();
			execToken();
			a = popStack();
			b = popStack();
			pushStack(b / a);
		}
		else if(c == '<'){
			if(stringBuffer[1] == '='){
				nextToken();
				execToken();
				a = popStack();
				b = popStack();
				pushStack(b <= a);
			}
			else if(stringBuffer[1] == '>'){
				nextToken();
				execToken();
				a = popStack();
				b = popStack();
				pushStack(b != a);
			}
			else{
				execToken();
				a = popStack();
				b = popStack();
				pushStack(b < a);
			}
		}
		else if(c == '>'){
			if(stringBuffer[1] == '='){
				nextToken();
				execToken();
				a = popStack();
				b = popStack();
				pushStack(b >= a);
			}
			else{
				execToken();
				a = popStack();
				b = popStack();
				pushStack(b > a);
			}
		}
	}
	else if(isNumber(c)){
		j = 0;
		number = 0;
		while(j < 5 && stringBuffer[j] != 0){
			number = number * 10 + (stringBuffer[j] - 0x30);
			j++;
		}
		pushStack(number);
	}
	else if(stringBufLen == 1 && isChar(c)){
		number = c - 0x41;
		if(input[(tokens[thisToken + 1])] == '=' && isIf == 0){
			nextToken();
			while(input[(tokens[thisToken])] != 0xA){
				execToken();
				nextToken();
			}
			thisToken--;
			variable[number] = popStack();
		}
		else{
			pushStack(variable[number]);
		}
	}
	else if(compare(stringBuffer, "GOTO")){
		nextToken();
		execToken();
		gotoadr(popStack());
	}
	else if(compare(stringBuffer, "IF")){
		isIf = 1;
	}
	else if(compare(stringBuffer, "THEN")){
		isIf = 0;
		if(popStack() == 0){
			while(input[(tokens[thisToken])] != 0xA){
				nextToken();
			}
		}
	}
	else if(compare(stringBuffer, "PRINT")){
		nextToken();
		if(input[(tokens[thisToken])] == '"'){
			getToken(thisToken);
			printf("%s",stringBuffer);
			nextToken();
		}
		else{
			while(input[(tokens[thisToken])] != 0xA){
				execToken();
				nextToken();
			}
			thisToken--;
			putn(popStack());
		}
	}
	else if(compare(stringBuffer, "LET")){
	}
	else {
		printf("Error. Unknown token %s in string %d\n", stringBuffer, thisString);
		thisToken = tSize;
	}
}

void execute(){
	int i;
	isIf = 0;
	thisToken = 0;
	stackPointer = 0;
	for(i = 0; i < 27; i++){
		variable[i] = 0;
	}
	settimer(1,1000);
	while(nextToken()){
		if(gettimer(1) == 0 && getkey()){
			return;
		}
		execToken();
	}
	putchar(10);
	settimer(1,1000);
	while(gettimer(1));
	while(getkey() == 0);
}

char toUpperCase(char c){
	if(c > 0x60 && c < 0x7B){
		c -= 0x20;
	}
	return c;
}

void edit(){
	int i,j,c,n,k,num;
	input[0] = 0xA;
	while(1){
		putchar('>');
		i = 0;
		c = 0;
		while(c != 0xA && i < BUFFER_SIZE){
			c = toUpperCase(getchar());
			stringBuffer[i] = c;
			putchar(c);
			i++;
		}
		stringBuffer[i] = 0;
		if(compare(stringBuffer, "RUN\n")){
			clearscreen();
			gotoxy(0,0);
			return;
		}
		else if(compare(stringBuffer, "HELP\n")){
			printf("%s",helpstr);
			delayredraw();
		}
		else if(compare(stringBuffer, "LIST\n")){
			for(j = 0; j < tl; j++){
				putchar(input[j]);
			}
		}
		else if(compare(stringBuffer, "NEW\n")){
			tl = 1;
			lastString = 0;
			clearInput();
		}
		else if(isNumber(stringBuffer[0])){
			j = 0;
			num = 0;
			while(j < 5 && isNumber(stringBuffer[j])){
				num = num * 10 + (stringBuffer[j] - 0x30);
				j++;
			}
			n = findStringNumber(num);
			if(n >= 0){
				k = stringsEd[n + 1] - stringsEd[n];
				for(j = stringsEd[n]; j < tl - k; j++){
					input[j] = input[j + k];
				}
				tl = tl - k;
				for(j = tl; j >= stringsEd[n]; j--){
					input[j + i] = input[j];
				}
				for(j = 0; j < i; j++){
					input[(stringsEd[n] + j)] = stringBuffer[j];
					tl++;
				}
			}
			else{
				stringsEd[lastString] = tl;
				stringsNumber[lastString] = num;
				lastString++;
				for(j = 0; j < i; j++){
					input[tl] = stringBuffer[j];
					tl++;
				}
				stringsEd[lastString] = tl;
			}
		}
		else{
			printf("Error.Line must begin with a number.\n");
		}
		delayredraw();
	}
}

void main(){
	printf("%s",tittlestr);
	delayredraw();
	while(1){
		edit();
		tokenize();
		execute();
	}
}
