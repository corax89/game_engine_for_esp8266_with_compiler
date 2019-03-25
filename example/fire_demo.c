char f1[] = {0x20,0x22};
char f2[] = {0x20,0x77};
char f3[] = {0x20,0x88};
char f4[] = {0x20,0xff};
char f5[] = {0x20,0xcc};
char f6[] = {0x20,0xbb};
char f7[] = {0x20,0xbb};
char field[272];
char buf_field[256];
int colors[] = {f7, f7, f6, f6, f5, f5, f4, f4, f3, f3, f2, f2, f1, f1, f1};

int i,x,y;

void init(){
	setbgcolor(11);
	clearscreen();
	for(i = 0; i < 128; i++)
		field[i] = random(14);
}

void draw(){
	i = 64;
	for(y = 4; y < 16; y++)
		for(x = 0; x < 16; x++){
			i++;
			field[i] = buf_field[i];
			putimagerle(colors[field[i]], x * 8, y * 8, 8, 8);
		}
}

void step(){
	for(i = 240; i < 272; i++)
		field[i] = 10 + random(4);
	for(i = 0; i < 256; i++){
		if(field[i] == field[i + 16])
				buf_field[i] = 0;
			else
				buf_field[i] = ((field[i] + field[i + 16]) / 2);
	}
}

void main(){
	init();
	while(1){
		step();
		draw();
	}
}
					