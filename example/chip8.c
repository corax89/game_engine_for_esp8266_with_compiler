#define DEBUG		0
//cycles per frame
#define CYCLES		30
//load and store operations leave ri unchanged
#define L_S_STORE 0
//<<= and >>= modify vx in place and ignore vy
#define SHIFT_X 1

/* 		keys
1	2	3	C
4	5	6	D
7	8	9	E
A	0	B	F		*/

#define K_LEFT		7
#define K_UP			5
#define K_RIGHT	9
#define K_DOWN		8
#define K_A			0
#define K_B			15

char Letter[512] = { 
	0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
  0x20, 0x60, 0x20, 0x20, 0x70, // 1
  0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
  0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
  0x90, 0x90, 0xF0, 0x10, 0x10, // 4
  0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
  0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
  0xF0, 0x10, 0x20, 0x40, 0x40, // 7
  0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
  0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
  0xF0, 0x90, 0xF0, 0x90, 0x90, // A
  0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
  0xF0, 0x80, 0x80, 0x80, 0xF0, // C
  0xE0, 0x90, 0x90, 0x90, 0xE0, // D
  0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
  0xF0, 0x80, 0xF0, 0x80, 0x80, // F 
  //8x10
  0x00, 0x3C, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C, 0x00, //0
  0x00, 0x08, 0x38, 0x08, 0x08, 0x08, 0x08, 0x08, 0x3E, 0x00, //1
  0x00, 0x38, 0x44, 0x04, 0x08, 0x10, 0x20, 0x44, 0x7C, 0x00, //2
  0x00, 0x38, 0x44, 0x04, 0x18, 0x04, 0x04, 0x44, 0x38, 0x00, //3
  0x00, 0x0C, 0x14, 0x24, 0x24, 0x7E, 0x04, 0x04, 0x0E, 0x00, //4
  0x00, 0x3E, 0x20, 0x20, 0x3C, 0x02, 0x02, 0x42, 0x3C, 0x00, //5
  0x00, 0x0E, 0x10, 0x20, 0x3C, 0x22, 0x22, 0x22, 0x1C, 0x00, //6
  0x00, 0x7E, 0x42, 0x02, 0x04, 0x04, 0x08, 0x08, 0x08, 0x00, //7
  0x00, 0x3C, 0x42, 0x42, 0x3C, 0x42, 0x42, 0x42, 0x3C, 0x00, //8
  0x00, 0x3C, 0x42, 0x42, 0x42, 0x3E, 0x02, 0x04, 0x78, 0x00, //9
  0x00, 0x18, 0x08, 0x14, 0x14, 0x14, 0x1C, 0x22, 0x77, 0x00, //A
  0x00, 0x7C, 0x22, 0x22, 0x3C, 0x22, 0x22, 0x22, 0x7C, 0x00, //B
  0x00, 0x1E, 0x22, 0x40, 0x40, 0x40, 0x40, 0x22, 0x1C, 0x00, //C
  0x00, 0x78, 0x24, 0x22, 0x22, 0x22, 0x22, 0x24, 0x78, 0x00, //D
  0x00, 0x7E, 0x22, 0x28, 0x38, 0x28, 0x20, 0x22, 0x7E, 0x00, //E
  0x00, 0x7E, 0x22, 0x28, 0x38, 0x28, 0x20, 0x20, 0x70, 0x00  //F
};

char Memory[3583] = {
0x12, 0x4E, 0x08, 0x19, 0x01, 0x01, 0x08, 0x01, 0x0F, 0x01, 0x01, 0x09, 0x08, 0x09, 0x0F, 0x09, 
0x01, 0x11, 0x08, 0x11, 0x0F, 0x11, 0x01, 0x19, 0x0F, 0x19, 0x16, 0x01, 0x16, 0x09, 0x16, 0x11, 
0x16, 0x19, 0xFC, 0xFC, 0xFC, 0xFC, 0xFC, 0xFC, 0xFC, 0x00, 0xA2, 0x02, 0x82, 0x0E, 0xF2, 0x1E, 
0x82, 0x06, 0xF1, 0x65, 0x00, 0xEE, 0xA2, 0x02, 0x82, 0x0E, 0xF2, 0x1E, 0x82, 0x06, 0xF1, 0x55, 
0x00, 0xEE, 0x6F, 0x10, 0xFF, 0x15, 0xFF, 0x07, 0x3F, 0x00, 0x12, 0x46, 0x00, 0xEE, 0x00, 0xE0, 
0x62, 0x00, 0x22, 0x2A, 0xF2, 0x29, 0xD0, 0x15, 0x70, 0xFF, 0x71, 0xFF, 0x22, 0x36, 0x72, 0x01, 
0x32, 0x10, 0x12, 0x52, 0xF2, 0x0A, 0x22, 0x2A, 0xA2, 0x22, 0xD0, 0x17, 0x22, 0x42, 0xD0, 0x17, 
0x12, 0x64
};

char Registers[16];   // registers
char RegistersRDL[16];
char key_pressed[16];
int  StackC[16];

int ri,i,PCr,SPr,delay_timer,last_key,opcodea,opcodeb,offset,key;

void initChip(){
	for(i=0;i<16;i++){
		StackC[i] = 0;
		Registers[i] = 0;
		RegistersRDL[i] = 0;
		key_pressed[i] = 0;
	}
	ri = 512;        	// I register
	SPr = 0;          // stack counter
	StackC[0] = 512; 	// bug with all stack is 0
	PCr = 512;        // mem offset counter
	delay_timer = 0;  // delay timer;
	last_key = 99;
	if(DEBUG){
		offset = 0;
	}
	else{
		offset = 32;
	}
}

int keyWait(int reg){
	if(last_key == 99){
		PCr -= 2;
	}
	else{
		Registers[reg] = last_key;
		last_key = 99;
	}
}

void SE(int x, int y){
	if(x == y)
		PCr += 2;
}

void SNE(int x,int y){
	if(x!=y)
		PCr += 2;
}

void setPixel(int x, int y, int pix) {
	int redraw;
	x = x % 64;
	y = y % 32;
	redraw = getpixel(x * 2, offset + y * 2);
	if(redraw == 1 && pix > 0)
		Registers[0xf] = 1;
	if(pix > 0 && redraw == 0)//если есть переполнение тогда закрашиваем фоном
		setcolor(1);
	else
		setcolor(0);
	putpixel(x * 2, offset + y * 2);
	putpixel(x * 2 + 1, offset + y * 2);
	putpixel(x * 2, offset + y * 2 + 1);
	putpixel(x * 2 + 1, offset + y * 2 + 1);
}

void DRW(int registerX, int registerY, int length){
	int sprt, pixel, x, y;
	sprt = 0;
	Registers[0xF] = 0;
	for(y = 0; y < length; y++) {
		if(ri > 512){
			sprt = Memory[ri - 512 + y];
		}
		else{
			sprt = Letter[ri + y];
		}
		for(x = 0; x < 8; x++) {
			pixel = sprt & 0x80;
			if(pixel>0)
				setPixel(registerX + x, registerY + y, pixel);
			sprt = sprt << 1;
		}
	}
}

void DRWsprite(int registerX, int registerY){
	int sprt, x, y;
	sprt = 0;
	Registers[0xF] = 0;
	for(y = 0; y < 16; y++) {
		if(ri > 512)
			sprt = Memory[ri - 512 + y];
		else{
			sprt = Letter[ri + y];
		}
		for(x = 0; x < 8; x++) {
			if((sprt & 0x80) > 0) {
				setPixel(registerX + x, registerY + y, 1);
			}
		sprt = sprt << 1;;
		}
	}
}

void CLS(){
	int x,y;
	if(DEBUG){
		setcolor(0);
		for(x = 0; x < 128; x++)
			for(y = 0; y < 64; y++)
				putpixel(x, offset + y);
	}
	else{
		clearscreen();
	}
}

void RET(){
	if(SPr > 0){
		SPr--;
		PCr = StackC[SPr];
	}
}

void ADDVxVy(int x, int y){
	int s;
	s = Registers[x] + Registers[y];
	if(s > 255){
		Registers[0xf] = 1;
		Registers[x] = s;
	}
	else{
		Registers[0xf] = 0;
		Registers[x] = s;
	}
}

void SUB(int x, int y){
	int s;
	s = Registers[x] - Registers[y];
	if(s >= 0){
		Registers[0xf] = 1; 
		Registers[x] = s;
	}
	else{
		Registers[0xf] = 0;
		Registers[x] = s;
	}
}

void SHR(int x, int y){
	if(SHIFT_X){
		Registers[0xF] = Registers[x] & 0x1;
		Registers[x] = (Registers[x] >> 1);
	}
	else{
		Registers[0xF] = Registers[y] & 0x1;
		Registers[x] = (Registers[y] >> 1);
	}
}

void SUBN(int x, int y){
	if(Registers[x] > Registers[y]){
		Registers[0xf] = 0;
	}
	else{
		Registers[0xf] = 1;
	} 
	Registers[x] = Registers[y] - Registers[x];
}

void SHL(char x, char y){
	if(SHIFT_X){
		Registers[0xF] = (Registers[x] & 0x80) >> 7;
		Registers[x] = (Registers[x] << 1);
	}
	else{
		Registers[0xF] = (Registers[y] & 0x80) >> 7;
		Registers[x] = (Registers[y] << 1);
	}
}

void ADDI(int x){
	ri += x;
	Registers[0xf] = 0;
}

void LDB(int n){
	int j;
	for(j = 3; j > 0; j--) {
		if(ri + j - 1 >= 512){
			Memory[ri - 512 - 1 + j] = n % 10;
			n = n/10;
		}
	}
}

void LDI(int x){
	int j;
	for(j = 0; j <= x; j++) {
		if(ri + j >= 512)
			Memory[ri - 512 + j] = Registers[j];
	}
	if(L_S_STORE){
		ri += x + 1;
	}
}

void LDV(int x){
	int j;
	for(j = 0; j <= x; j++) {
		if(ri + j >= 512)
			Registers[j] = Memory[ri - 512 + j];
		else
			Registers[i] = 0;
	}
	if(L_S_STORE){
		ri += x + 1;
	}
}

void registerSave(int x){
	for(int i=0;i<=x;i++)
		RegistersRDL[i] = Registers[i];
}

void registerLoad(int x){
	for(int i=0;i<=x;i++)
		Registers[i] = RegistersRDL[i];
}

void debug(){
	int i;
	gotoxy(0,9);
	printf("pc:%d ri:%d ", PCr, ri);
	for(i = 0; i < 16; i++)
		printf("r%d:%d ", i, Registers[i]);
	delayredraw();
}

void sweight(){
	switch (opcodeb & 0xf) {
		case 0x0:
			Registers[(opcodea & 0xf)] = Registers[((opcodeb & 0xf0) >> 4)];
			break;//8XY0
		case 0x1:
			Registers[(opcodea & 0xf)] = Registers[(opcodea & 0xf)] | Registers[((opcodeb & 0xf0) >> 4)];
			break;//8XY1
		case 0x2:
			Registers[(opcodea & 0xf)] = Registers[(opcodea & 0xf)] & Registers[((opcodeb & 0xf0) >> 4)];
			break;//8XY2
		case 0x3:
			Registers[(opcodea & 0xf)] = Registers[(opcodea & 0xf)] ^ Registers[((opcodeb & 0xf0) >> 4)];
			break;//8XY3
		case 0x4:
			ADDVxVy((opcodea & 0xf), ((opcodeb & 0xf0) >> 4));
			break;//8XY4
		case 0x5:
			SUB((opcodea & 0xf), ((opcodeb & 0xf0) >> 4));
			break;//8XY5
		case 0x6:
			SHR((opcodea & 0xf), ((opcodeb & 0xf0) >> 4));
			break;//8XY6
		case 0x7:
			SUBN((opcodea & 0xf), ((opcodeb & 0xf0) >> 4));
			break;//8XY7
		case 0xE:
			SHL((opcodea & 0xf), ((opcodeb & 0xf0) >> 4));
			break;//8XYE
	}
}

void swf(){
	switch (opcodeb) {
		case 0x7:
			Registers[(opcodea & 0xf)] = delay_timer;
			break;  
		case 0xA:
			keyWait(opcodea & 0xf);
			break;//FX0A   
		case 0x15:
			delay_timer = Registers[(opcodea & 0xf)];
			break;//FX15
		/*
		case 0x18:
			//set sound timer
			break;//FX18
		*/
		case 0x1e:
			ADDI(Registers[(opcodea & 0xf)]);
			break;//FX1E
		case 0x29:
			ri = 5 * Registers[(opcodea & 0xf)];
			break;
		case 0x30:
			ri = 80 + 10 * Registers[(opcodea & 0xf)];
			break;
		case 0x33:
			LDB(Registers[(opcodea & 0x0f)]);
			break;//FX33
		case 0x55:
			LDI(opcodea & 0x0f);
			break;//FX55
		case 0x65:
			LDV(opcodea & 0x0f);
			break;//FX65
		case 0x75:
			registerSave(opcodea & 0x0f);
			break;//LD R, VX
		case 0x85:
			registerLoad(opcodea & 0x0f);
			break;//LD VX, R
	}
}

void nextOpcode(){
	opcodea = Memory[PCr - 512];
	opcodeb = Memory[PCr - 511];
	PCr += 2;
	switch (opcodea & 0xf0){
		case 0x0:
			if(opcodeb == 0xe0)
				CLS();
			else if(opcodeb == 0xee)
				RET();
			break;
		case 0x10:
			PCr = ((opcodea & 0xf) << 8) + opcodeb; 
			break;    // 1NNN
		case 0x20:
			StackC[SPr] = PCr;
			SPr++;
			PCr = (((opcodea & 0xf) << 8) + opcodeb);
			break;  // 2NNN
		case 0x30:
			SE(Registers[(opcodea & 0xf)], opcodeb);
			break;  // 3XKK, VX = KK
		case 0x40:
			SNE(Registers[(opcodea & 0xf)], opcodeb);
			break; // 4XKK, VX! = KK
		case 0x50:
			SE(Registers[(opcodea & 0xf)], Registers[((opcodeb & 0xf0) >> 4)]);
			break;   // 5XKK, VX = VY
		case 0x60:
			/*LD*/
			Registers[(opcodea & 0xf)] = opcodeb;
			break;  //6XKK
		case 0x70:
			/*ADD*/
			Registers[(opcodea & 0xf)] = (Registers[(opcodea & 0xf)] + opcodeb);
			break; //7XKK
		case 0x80:
			sweight();
			break;
		case 0x90:
			SNE(Registers[(opcodea & 0xf)], Registers[((opcodeb & 0xf0) >> 4)]);
			break;  //9XY0,VX != VY
		case 0xA0:
			ri = (((opcodea & 0xf) << 8) + opcodeb);
			break; //ANNN
		case 0xB0:
			PCr = (((opcodea & 0xf) << 8) + opcodeb + Registers[0]);
			break; //BNNN NNN + V0
		case 0xC0:
			Registers[(opcodea & 0xf)] = (random(255) & opcodeb);
			break; //CXKK
		case 0xD0:
			if((opcodeb & 0xf)>0)
				DRW(Registers[(opcodea & 0x0f)],Registers[((opcodeb & 0xf0) >> 4)], (opcodeb & 0xf));
			else 
				DRWsprite(Registers[(opcodea & 0xf)], Registers[((opcodeb & 0xf0) >> 4)]);
			break;//DXYN
		case 0xE0:
			if(opcodeb == 0x9e){
				if(key_pressed[(Registers[(opcodea & 0xf)])] == 1)
					PCr += 2;// EX9E
			}
			else if(opcodeb == 0xA1){
				if(key_pressed[(Registers[(opcodea & 0xf)])] == 0)
					PCr += 2;// EXA1 
			}
			break;
		case 0xF0:
			swf();
			break;
	}
}	

void timerCount(){
	if(gettimer(0) == 0){
		settimer(0, 16);
		if(delay_timer > 0){
			delay_timer--;
		}
	}
}

void testKey(){
	key = getkey();
	last_key = 99;
	if(key & KEY_UP){
		key_pressed[K_UP] = 1;
		last_key = K_UP;
	}
	else
		key_pressed[K_UP] = 0;
	if(key & KEY_DOWN){
		key_pressed[K_DOWN] = 1;
		last_key = K_DOWN;
	}
	else
		key_pressed[K_DOWN] = 0;
	if(key & KEY_LEFT){
		key_pressed[K_LEFT] = 1;
		last_key = K_LEFT;
	}
	else
		key_pressed[K_LEFT] = 0;
	if(key & KEY_RIGHT){
		key_pressed[K_RIGHT] = 1;
		last_key = K_RIGHT;
	}
	else
		key_pressed[K_RIGHT] = 0;
	if(key & KEY_A){
		key_pressed[K_A] = 1;
		last_key = K_A;
	}
	else
		key_pressed[K_A] = 0;
	if(key & KEY_B){
		key_pressed[K_B] = 1;
		last_key = K_B;
	}
	else
		key_pressed[K_B] = 0;
}

void main(){
	initChip();
	while(1){
		for(i = 0; i < CYCLES; i++){
			nextOpcode();
			timerCount();
		}
		testKey();
		if(DEBUG)		
			debug();
		delayredraw();
	}
}	
					