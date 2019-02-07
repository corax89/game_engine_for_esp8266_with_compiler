"use strict";

var timers = [];

function Cpu(){
	var mem = [];			//память, максимум 65 534 байта
	var reg = [];			//16 регистров, нулевой используется как указатель стека
	var regx = 0;			//неявный регистр, указывает на Х позицию символа в текстовом режиме
	var regy = 0;			//Y позиция символа
	var imageSize = 1;		//влияет на множитель размера выводимой картинки, не относится к спрайтам
	var pc = 0;				//указатель на текущую команду
	var carry = 0;			//флаг переполнения
	var zero = 0;			//флаг нуля
	var negative = 0;		//флаг отрицательности
	var redraw = 0;			//флаг, устанавливаемый после перерисовки
	var sprites = [];		//массив адресов и координат спрайтов
	var particles = [];		//массив для частиц
	var maxParticles = 32;	//максимальное количество частиц
	var emitter = [];		//настройки для частиц
	var bgcolor = 0;		//фоновый цвет
	var color = 1;			//цвет рисования
	var charArray = [];		//массив символов, выводимых на экран
	
	function init(){
		for(var i = 0; i < 0xffff; i++)
			mem[i] = 0;
		for(var i = 1; i < 16; i++)
			reg[i] = 0;
		//указываем последнюю ячейку памяти для стека, если памяти меньше то и значение соответственно меняется
		reg[0] = 0xffff;
		pc = 0;
		regx = 0;
		regy = 0;
		imageSize = 1;
		//задаем начальные координаты спрайтов вне границ экрана
		for(var i = 0; i < 32; i++){
			sprites[i]  = {address: 0, x: 255, y: 255, speedx: 0, speedy: 0, height: 8, width: 8, angle: 0};	
		}
		for(var i = 0; i < maxParticles; i++){
			particles[i] = {time: 0, x: 0, y: 0, gravity: 0, speedx: 0, speedy: 0, color: 0};
		}
		emitter = { time: 0, timer: 0, timeparticle: 0, count: 0, x: 0, y: 0, gravity: 0, speedx: 0, speedy: 0, speedx1: 0, speedy1: 0, color: 0};
		for(var i = 0; i < 420; i++)
			charArray[i] = '';
		for(var i = 0; i < 8; i++)
			timers[i] = 0;
	}
	//загрузка программы
	function load(arr){
		for(var i = 0; i < arr.length; i++)
			mem[i] = arr[i];
	}
	
	function writeInt(adr, n){
		writeMem(adr + 1, (n & 0xff00) >> 8);
		writeMem(adr, n & 0xff);
	}
	
	function readInt(adr){
		return (readMem(adr + 1) << 8) + readMem(adr);
	}
	
	function writeMem(adr, n){
		mem[adr & 0xffff] = n & 0xff;
	}
	
	function readMem(adr){
		return mem[adr & 0xffff];
	}
	
	function setRedraw(){
		redraw = 1;
	}
	
	function setFlags(n){
		carry = (n > 0xffff) ? 1 : 0;
		zero = (n == 0) ? 1 : 0;
		negative = (n < 0) ? 1 : 0;
		n = n & 0xffff;
		return n;
	}
	
	function setFlagsC(n){
		carry = 0;
		zero = 0;
		negative = 0;
		if(n > 0xff){
			carry = 1;
		}
		if(n == 0){
			zero = 1;
		}
		else if(n < 0){
			negative = 1;
		}
		n = n & 0xff;
		return n;
	}
	
	function setSprite(n, adr){
		sprites[n].address = adr;
	}
	
	function scrollScreen(step, direction){
		var bufPixel;
		if(direction == 2){
			for(var y = 0; y < 128; y++){
				bufPixel = display.getPixel(0, y);
				for(var x = 1; x < 128; x++)
					display.plot(display.getPixel(x, y), x - 1, y);
				display.plot(bufPixel, 127, y);
			}
		}
		else if(direction == 1){
			for(var x = 0; x < 128; x++){
				bufPixel = display.getPixel(x, 0);
				for(var y = 1; y < 128; y++)
					display.plot(display.getPixel(x, y), x, y - 1);
				display.plot(bufPixel, x, 127);
			}
		}
		else if(direction == 0){
			for(var y = 0; y < 128; y++){
				bufPixel = display.getPixel(127, y);
				for(var x = 127; x > 0; x--)
					display.plot(display.getPixel(x - 1, y), x, y);
				display.plot(bufPixel, 0, y);
			}
		}
		else {
			for(var x = 0; x < 128; x++){
				bufPixel = display.getPixel(x, 127);
				for(var y = 127; y > 0; y--)
					display.plot(display.getPixel(x, y - 1), x, y);
				display.plot(bufPixel, x, 0);
			}
		}
	}
	
	function drawSprite(n, x1, y1){
		sprites[n].x = x1;
		sprites[n].y = y1;
	}

	function setParticle(gravity, count, time){
		emitter.gravity = gravity;
		emitter.count = count;
		emitter.timeparticle = time;
	}

	function setEmitter(time, dir, dir1, speed){
		emitter.time = time;
		emitter.speedx = Math.round(speed * Math.cos(dir / 57));
		emitter.speedy = Math.round(speed * Math.sin(dir / 57));
		emitter.speedx1 = Math.round(speed * Math.cos(dir1 / 57));
		emitter.speedy1 = Math.round(speed * Math.sin(dir1 / 57));
	}
	
	function drawParticle(x, y, color){
		emitter.x = x;
		emitter.y = y;
		emitter.color = color;
		emitter.timer = emitter.time;
	}
	
	function randomD(a, b) {
		var min = Math.min(a, b);
		var max = Math.max(a, b);
		var rand = min - 0.5 + Math.random() * (max - min + 1)
		rand = Math.round(rand);
		return rand;
	  }
	
	function redrawParticle(){
		var n, i;
		if(emitter.timer > 0){
			emitter.timer -= 50;
			i = emitter.count;
			for(var n = 0; n < maxParticles; n++){
				if(i == 0)
					break;
				if(particles[n].time <= 0){
					i--;
					particles[n].time = emitter.timeparticle;
					particles[n].x = emitter.x;
					particles[n].y = emitter.y;
					particles[n].color = emitter.color;
					particles[n].speedx = randomD(emitter.speedx, emitter.speedx1);
					particles[n].speedy = randomD(emitter.speedy, emitter.speedy1);
					particles[n].gravity = emitter.gravity;
				}
			}
		}
		for(n = 0; n < maxParticles; n++)
			if(particles[n].time > 0){
				display.drawSpritePixel(particles[n].color, particles[n].x, particles[n].y);
				particles[n].time -= 50;		
				if(randomD(0,1) == 1){
					particles[n].x += particles[n].speedx;
					particles[n].speedy += particles[n].gravity;
					particles[n].y += particles[n].speedy;					
				}
				else{
					particles[n].x += Math.floor(particles[n].speedx/2);
					particles[n].y += Math.floor(particles[n].speedy/2);
				}
				if(particles[n].x < 0 || particles[n].x > 128 || particles[n].y < 0 || particles[n].y > 128)
					particles[n].time = 0;
			}
	}
	
	function drawRotateSprPixel(color, x1, y1, x, y, a){
		var nx = x * Math.cos(a) - y * Math.sin(a);
		var ny = y * Math.cos(a) + x * Math.sin(a);
		display.drawSpritePixel(color, x1 + Math.floor(nx), y1 + Math.floor(ny));
	}
	
	function redrawSprite(){
		var color, n, i;
		for(n = 0; n < 32; n++){
			var adr = sprites[n].address;
			sprites[n].x += sprites[n].speedx;
			sprites[n].y += sprites[n].speedy;
			var x1 = sprites[n].x;
			var y1 = sprites[n].y;
			for(var y = 0; y < sprites[n].height; y++)
				for(var x = 0; x < sprites[n].width; x++){
					color = (readMem(adr) & 0xf0) >> 4;
					if(color > 0)
						//display.drawSpritePixel(color, x1 + x, y1 + y);
						drawRotateSprPixel(color, x1, y1, x, y, sprites[n].angle / 57);
					x++;
					color = (readMem(adr) & 0xf);
					if(color > 0)
						//display.drawSpritePixel(color, x1 + x, y1 + y);
						drawRotateSprPixel(color, x1, y1, x, y, sprites[n].angle / 57);
					adr++;
				}
		}	
	}
	
	function drawImage(adr, x1, y1, w, h){
		var color;
		for(var y = 0; y < h; y++)
			for(var x = 0; x < w; x++){
				color = (readMem(adr) & 0xf0) >> 4;
				if(color > 0)
					display.plot(color, x1 + x, y1 + y);
				x++;
				color = (readMem(adr) & 0xf);
				if(color > 0)
					display.plot(color, x1 + x, y1 + y);
				adr++;
			}
	}
	
	function drawImageRLE(adr, x1, y1, w, h){
		var i = 0;
		var repeat = readMem(adr);
		adr++;
		var color1 = (readMem(adr) & 0xf0) >> 4;
		var color2 = readMem(adr) & 0xf
		while(i < w * h){
			if(repeat > 0x81){
				if(color1 > 0)
					display.plot(color1, x1 + i % w, y1 + Math.floor(i / w));
				if(color2 > 0)
					display.plot(color2, x1 + i % w + 1, y1 + Math.floor(i / w));
				i += 2;
				adr++;
				repeat--;
				color1 = (readMem(adr) & 0xf0) >> 4;
				color2 = readMem(adr) & 0xf;
			}
			else if(repeat == 0x81){
				repeat = readMem(adr);
				adr++;
				color1 = (readMem(adr) & 0xf0) >> 4;
				color2 = readMem(adr) & 0xf;
			}
			else if(repeat > 0){
				if(color1 > 0)
					display.plot(color1, x1 + i % w, y1 + Math.floor(i / w));
				if(color2 > 0)
					display.plot(color2, x1 + i % w + 1, y1 + Math.floor(i / w));
				i += 2;
				repeat--;
			}
			else if(repeat == 0){
				adr++;
				repeat = readMem(adr);
				adr++;
				color1 = (readMem(adr) & 0xf0) >> 4;
				color2 = readMem(adr) & 0xf;
			}
		}
	}
	//функция рисования картинки, если ее размер отличается от 1
	function drawImageS(adr, x1, y1, w, h){
		var color,jx,jy;
		var s = imageSize;
		for(var y = 0; y < h; y++)
			for(var x = 0; x < w; x++){
				color = (readMem(adr) & 0xf0) >> 4;
				if(color > 0)
					for(jx = 0; jx < s; jx++)
						for(jy = 0; jy < s; jy++)
							display.plot(color, x1 + x * s + jx, y1 + y * s + jy);
				x++;
				color = (readMem(adr) & 0xf);
				if(color > 0)
					for(jx = 0; jx < s; jx++)
						for(jy = 0; jy < s; jy++)
							display.plot(color, x1 + x * s + jx, y1 + y * s + jy);
				adr++;
			}
	}
	
	function drawImageRLES(adr, x1, y1, w, h){
		var i = 0;
		var s = imageSize;
		var repeat = readMem(adr);
		adr++;
		var color1 = (readMem(adr) & 0xf0) >> 4;
		var color2 = readMem(adr) & 0xf
		while(i < w * h){
			if(repeat > 0x81){
				if(color1 > 0)
					display.largeplot(color1, x1 + (i % w) * s, y1 + Math.floor(i / w) * s, s);
				if(color2 > 0)
					display.largeplot(color2, x1 + (i % w) * s + s, y1 + Math.floor(i / w) * s, s);
				i += 2;
				adr++;
				repeat--;
				color1 = (readMem(adr) & 0xf0) >> 4;
				color2 = readMem(adr) & 0xf
			}
			else if(repeat == 0x81){
				repeat = readMem(adr);
				adr++;
				color1 = (readMem(adr) & 0xf0) >> 4;
				color2 = readMem(adr) & 0xf
			}
			else if(repeat > 0){
				if(color1 > 0)
					display.largeplot(color1, x1 + (i % w) * s, y1 + Math.floor(i / w) * s, s);
				if(color2 > 0)
					display.largeplot(color2, x1 + (i % w) * s + s, y1 + Math.floor(i / w) * s, s);
				i += 2;
				repeat--;
			}
			else if(repeat == 0){
				adr++;
				repeat = readMem(adr);
				adr++;
				color1 = (readMem(adr) & 0xf0) >> 4;
				color2 = readMem(adr) & 0xf
			}
		}
	}
	
	function drawLine(x1, y1, x2, y2) {
		var deltaX = Math.abs(x2 - x1);
		var deltaY = Math.abs(y2 - y1);
		var signX = x1 < x2 ? 1 : -1;
		var signY = y1 < y2 ? 1 : -1;
		var error = deltaX - deltaY;
		display.plot(color, x2, y2);
		while(x1 != x2 || y1 != y2) 
	   {
			display.plot(color, x1, y1);
			var error2 = error * 2;
			if(error2 > -deltaY) 
			{
				error -= deltaY;
				x1 += signX;
			}
			if(error2 < deltaX) 
			{
				error += deltaX;
				y1 += signY;
			}
		}

	}
	
	function charLineUp(n){
		display.reset();
		for(var i = 0; i < 420 - n * 21; i++){
			charArray[i] = charArray[i + n * 21];
			display.char(charArray[i] , (i % 21) * 6, Math.floor(i / 21) * 8, 1, 0);
		}
	}
	
	function printc(c, fc, bc){
		if(c == '\n'){
			for(var i = regx; i <= 21; i++){
				display.char(' ' , i * 6, regy * 8, fc, bc);
				charArray[i + regy * 21] = ' ';
			}
			regy++;
			regx = 0;
			if(regy > 19){
				regy = 19;
				charLineUp(1);
			}
		}
		else if(c == '\t'){
			for(var i = 0; i <= regx % 5; i++){
				display.char(' ' , regx * 6, regy * 8, fc, bc);
				charArray[regx + regy * 21] = ' ';
				regx++;
				if(regx > 21){
					i = 99;
					regy++;
					regx = 0;
					if(regy > 19){
						regy = 19;
						charLineUp(1);
					}
				}
			}
		}
		else{
			display.char(c , regx * 6, regy * 8, fc, bc);
			charArray[regx + regy * 21] = c;
			regx++;
			if(regx > 21){
				regy++;
				regx = 0;
				if(regy > 19){
					regy = 19;
					charLineUp(1);
				}
			}
		}
	}
	
	function randomInteger(min, max) {
		var rand = min - 0.5 + Math.random() * (max - min + 1)
		rand = Math.round(rand);
		return rand;
	}
	
	function step(){
		//все команды двухбайтные, за некоторыми следуют два байта данных
		var op1 = mem[pc++]; //первый байт
		var op2 = mem[pc++]; //второй байт
		var reg1 = 0;		// дополнительные переменные
		var reg2 = 0;
		var reg3 = 0;
		var n = 0;
		switch(op1 & 0xf0){
			case 0x00:
				switch(op1){ 
					case 0x01: 
						//LDI R,int		01 0R XXXX
						reg1 = (op2 & 0xf);
						reg[reg1] = readInt(pc);
						setFlags(reg[reg1]);
						pc += 2;
						break;
					case 0x02: 
						//LDI R,(R)		02 RR
						reg1 = ((op2 & 0xf0) >> 4);
						reg2 = (op2 & 0xf);
						reg[reg1] = readInt(reg[reg2]);
						setFlags(reg[reg1]);
						break;
					case 0x03: 
						//LDI R,(adr)	03 0R XXXX
						reg1 = (op2 & 0xf);
						reg[reg1] = readInt(readInt(pc));
						setFlags(reg[reg1]);
						pc += 2;
						break;
					case 0x04: 
						//LDI R,(int+R)	04 RR XXXX
						reg1 = ((op2 & 0xf0) >> 4);
						reg2 = (op2 & 0xf);
						reg[reg1] = readInt(reg[reg2] + readInt(pc));
						setFlags(reg[reg1]);
						pc += 2;
						break;
					case 0x05: 
						//STI (R),R		05 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						//writeInt(readInt(reg[reg1]),reg[reg2]);
						writeInt(reg[reg1],reg[reg2]);
						break;
					case 0x06:
						if((op2 & 0x0f) == 0){
							//STI (adr),R	06 R0 XXXX
							reg1 = (op2 & 0xf0) >> 4;
							writeInt(readInt(pc),reg[reg1]);
							pc += 2;
						}
						else{
							//STI (adr+R),R 06 RR XXXX
							reg1 = (op2 & 0xf0) >> 4;
							reg2 = op2 & 0xf;
							writeInt(readInt(pc) + reg[reg1],reg[reg2]);
							pc += 2;
						}
						break;
					case 0x07:
						//MOV R,R		07 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						reg[reg1] = reg[reg2];
						break;
					default:
						pc++;
				}
				break;
			case 0x10:
				// LDC R,char	1R XX
				reg1 = (op1 & 0xf);
				reg[reg1] = op2;
				setFlagsC(reg[reg1]);
				break;
			case 0x20:
				if(op1 == 0x20){
					// LDC R,(R)	20 RR
					reg1 = ((op2 & 0xf0) >> 4);
					reg2 = (op2 & 0xf);
					reg[reg1] = readMem(reg[reg2]);
					setFlagsC(reg[reg1]);
				}
				else{
					// LDC R,(R+R)	2R RR
					reg1 = (op1 & 0xf);
					reg2 = ((op2 & 0xf0) >> 4);
					reg3 = (op2 & 0xf);
					reg[reg1] = readMem(reg[reg2] + reg[reg3]);
					setFlagsC(reg[reg1]);
				}
				break;
			case 0x30: 
				switch(op1){
					case 0x30:
						// LDC R,(int+R)30 RR XXXX
						reg1 = ((op2 & 0xf0) >> 4);
						reg2 = (op2 & 0xf);
						reg[reg1] = readMem(reg[reg2] + readInt(pc));
						setFlagsC(reg[reg1]);
						pc += 2;
						break;
					case 0x31:
						// LDC R,(adr)	31 0R XXXX
						reg1 = (op2 & 0xf);
						reg[reg1] = readMem(readInt(pc));
						setFlagsC(reg[reg1]);
						pc += 2;
						break;
					case 0x32:
						// STC (adr),R	32 0R XXXX
						reg1 = (op2 & 0xf0) >> 4;
						writeMem(readInt(pc),reg[reg1]);
						pc += 2;
						break;
					case 0x33:
						// STC (int+R),R33 RR XXXX
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						writeMem(readInt(pc) + reg[reg1],reg[reg2]);
						pc += 2;
						break;
				}
				break;
			case 0x40:
				if(op1 == 0x40){
					// STC (R),R	40 RR
					reg1 = (op2 & 0xf0) >> 4;
					reg2 = op2 & 0xf;
					//writeMem(readInt(reg[reg1]),reg[reg2]);
					writeMem(reg[reg1], reg[reg2]);
				}
				else{
					// STC (R+R),R	4R RR 
					reg1 = (op1 & 0xf);
					reg2 = ((op2 & 0xf0) >> 4);
					reg3 = (op2 & 0xf);
					writeMem(reg[reg1] + reg[reg2], reg[reg3]);
				}
				break;
			case 0x50:
				switch(op1){ 
					case 0x50:
						//HLT				5000
						pc -= 2;
						break;
					case 0x51:
						// STIMER R,R		51RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						timers[reg[reg1] & 0x7] = reg[reg2];
						break;
					case 0x52:
						// GTIMER R		520R
						reg1 = op2 & 0xf;
						reg[reg1] = timers[reg[reg1] & 0x7];
						setFlags(reg[reg1]);
						break;
				}
				break;
			case 0x60:
				// LDI R,(R+R)	6R RR
				reg1 = (op1 & 0xf);
				reg2 = ((op2 & 0xf0) >> 4);
				reg3 = (op2 & 0xf);
				reg[reg1] = readInt(reg[reg2] + reg[reg3]);
				setFlags(reg[reg1]);
				break;
			case 0x70:
				// STI (R+R),R	7R RR
				reg1 = (op1 & 0xf);
				reg2 = ((op2 & 0xf0) >> 4);
				reg3 = (op2 & 0xf);
				writeInt(reg[reg1] + reg[reg2], reg[reg3]);
				break;	
			case 0x80:
				switch(op1){
					case 0x80:
						// POP R		80 0R
						reg1 = (op2 & 0xf);
						reg[reg1] = readInt(reg[0]);
						reg[0] += 2;
						break;
					case 0x81:
						// POPN R		81 0R
						reg1 = (op2 & 0xf);
						for(var j = reg1; j >= 1; j--){
							reg[j] = readInt(reg[0]);
							reg[0] += 2;
						}
						break;
					case 0x82:
						// PUSH R		82 0R
						reg1 = (op2 & 0xf);
						reg[0] -= 2;
						writeInt(reg[0], reg[reg1]);
						break;
					case 0x83:
						// PUSHN R		83 0R
						reg1 = (op2 & 0xf);
						for(var j = 1; j <= reg1; j++){
							reg[0] -= 2;
							writeInt(reg[0], reg[j]);
						}
						break;
				}
				break;
			case 0x90:
				switch(op1){
					case 0x90:
						// JMP adr		90 00 XXXX
						pc = readInt(pc);
						break;
					case 0x91:
						// JNZ adr		91 00 XXXX
						if(zero == 0)
							pc = readInt(pc);
						else 
							pc += 2;
						break;
					case 0x92:
						// JZ adr		92 00 XXXX
						if(zero != 0)
							pc = readInt(pc);
						else 
							pc += 2;
						break;
					case 0x93:
						// JNP adr		93 00 XXXX
						if(negative == 1)
							pc = readInt(pc);
						else 
							pc += 2;
						break;
					case 0x94:
						// JP adr		94 00 XXXX
						if(negative != 1)
							pc = readInt(pc);
						else 
							pc += 2;
						break;
					case 0x95:
						// JNC adr		95 00 XXXX
						if(carry != 1)
							pc = readInt(pc);
						else 
							pc += 2;
						break;
					case 0x96:
						// JC adr		96 00 XXXX
						if(carry == 1)
							pc = readInt(pc);
						else 
							pc += 2;
						break;
					case 0x97:
						// JZR R,adr	97 0R XXXX
						reg1 = op2 & 0xf;
						if(reg[reg1] == 0)
							pc = readInt(pc);
						else 
							pc += 2;
						break;
					case 0x98:
						// JNZR R,adr	98 0R XXXX
						reg1 = op2 & 0xf;
						if(reg[reg1] != 0)
							pc = readInt(pc);
						else 
							pc += 2;
						break;
					case 0x99:
						// CALL adr		99 00 XXXX
						reg[0] -= 2;
						if(reg[0] < 0)
							reg[0] += 0xffff;
						writeInt(reg[0], pc + 2);
						pc = readInt(pc);
						break;
					case 0x9A:
						// RET			9A 00
						pc = readInt(reg[0]);
						reg[0] += 2;
						break;
				}
				break;
			case 0xA0:
				switch(op1){
					case 0xA0:
						// ADD R,R		A0 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] + reg[reg2];
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xA1:
						// ADC R,R		A1 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] + reg[reg2] + carry;
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xA2:
						// SUB R,R		A2 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] - reg[reg2];
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xA3:
						// SBC R,R		A3 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] - reg[reg2] - carry;
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xA4:
						// MUL R,R		A4 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] * reg[reg2];
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xA5:
						// DIV R,R		A5 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] / reg[reg2];
						n = setFlags(n);
						reg[reg2] = reg[reg1] % reg[reg2];
						reg[reg1] = n;
						break;
					case 0xA6:
						// AND R,R		A6 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] & reg[reg2];
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xA7:
						// OR R,R		A7 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] | reg[reg2];
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xA8:
						if(op2 == 0x10){
							// INC adr		A8 10 XXXX
							reg1 = op2 & 0xf;
							n = readInt(readInt(pc)) + 1;
							n = setFlags(n);
							writeInt(readInt(pc), n);
							pc += 2;
						}
						else if(op2 > 0x10){
							// INC R,n		A8 nR
							reg1 = op2 & 0xf;
							n = reg[reg1] + (op2 >> 4);
							n = setFlags(n);
							reg[reg1] = n;
						}
						else{
							// INC R		A8 0R				
							reg1 = op2 & 0xf;
							n = reg[reg1] + 1;
							n = setFlags(n);
							reg[reg1] = n;
						}
						break;
					case 0xA9:
						if(op2 == 0x10){
							// DEC adr		A9 10 XXXX
							reg1 = op2 & 0xf;
							n = readInt(readInt(pc)) - 1;
							n = setFlags(n);
							writeInt(readInt(pc), n);
							pc += 2;
						}
						else if(op2 > 0x10){
							// DEC R,n		A9 nR
							reg1 = op2 & 0xf;
							n = reg[reg1] - (op2 >> 4);
							n = setFlags(n);
							reg[reg1] = n;
						}
						else{
							// DEC R		A9 0R
							reg1 = op2 & 0xf;
							n = reg[reg1] - 1;
							n = setFlags(n);
							reg[reg1] = n;
						}
						break;
					case 0xAA:
						// XOR R,R		AA RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] ^ reg[reg2];
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xAB:
						// SHL R,R		AB RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] << reg[reg2];
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xAC:
						// SHR R,R		AC RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] >> reg[reg2];
						n = setFlags(n);
						reg[reg1] = n;
						break;
					case 0xAD:
						// RAND R,R		AD 0R
						reg1 = op2 & 0xf;
						n = randomInteger(0, reg[reg1]);
						n = setFlags(n);
						reg[reg1] = n;
						break;
				}
				break;
			case 0xB0:
				//CMP R,CHR		BR XX
				reg1 = (op1 & 0x0f);
				n = reg[reg1] - op2;
				n = setFlags(n);
				break;
			case 0xC0:
				switch(op1){
					case 0xC0:
						//CMP R,INT		C0 R0 XXXX
						reg1 = (op2 & 0xf0) >> 4;
						n = reg[reg1] - readInt(pc);
						n = setFlags(n);
						pc += 2;
						break;
					case 0xC1:
						//CMP R,R		C1 RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						n = reg[reg1] - reg[reg2];
						n = setFlags(n);
						break;
					case 0xC2:
						//LDF R,F		C2 RF
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						if(reg2 == 0)
							reg[reg1] = carry;
						else if(reg2 == 1)
							reg[reg1] = zero;
						else if(reg2 == 2)
							reg[reg1] = negative;
						else if(reg2 == 3){ //pozitive
							if(negative == 0 && zero == 0)
								reg[reg1] = 1;
							else
								reg[reg1] = 0;
						}
						else if(reg2 == 4){ //not pozitive
							if(negative == 0 && zero == 0)
								reg[reg1] = 0;
							else
								reg[reg1] = 1;
						}
						else if(reg2 == 5)
							reg[reg1] = 1 - zero;
						else if(reg2 == 6){
							reg[reg1] = redraw;
							redraw = 0;
						}
						else
							reg[reg1] = 0;
						break;
				}
				break;
			case 0xD0:
				switch(op1){ 
					case 0xD0:
						//CLS		D000
						display.reset();
						//pc--;
						break;
					case 0xD1:
						switch(op2 & 0xf0){
							case 0x00:
								//PUTC R	D10R
								reg1 = (op2 & 0xf);
								//console.log(String.fromCharCode(reg[reg1]) + ':' + reg[reg1]);
								printc(String.fromCharCode(reg[reg1]), color, bgcolor);
								break;
							case 0x10:
								//PUTS R	D11R
								reg1 = (op2 & 0xf);
								var i = 0;
								//console.log(String.fromCharCode(readMem(reg[reg1])));
								while(!(readMem(reg[reg1] + i) == 0 || i > 1000)){
									printc(String.fromCharCode(readMem(reg[reg1] + i)), color, bgcolor);
									i++;
								}
								break;
							case 0x20:
								//PUTN R D12R
								reg1 = (op2 & 0xf);
								var s;
								if(reg[reg1] < 32768)
									s = reg[reg1].toString(10);
								else
									s = (reg[reg1] - 0x10000).toString(10);
								for(var i = 0; i < s.length; i++){
									printc(s[i], color, bgcolor);
								}
								break;
							case 0x30:
								//SETX R			D13R
								reg1 = (op2 & 0xf);
								regx = (reg[reg1] & 0xff);
								break;
							case 0x40:
								//SETY R			D14R
								reg1 = (op2 & 0xf);
								regy = (reg[reg1] & 0xff);
								break;
						}
						break;
					case 0xD2: 
						switch(op2 & 0xf0){
							case 0x00:
								// GETK R			D20R
								reg1 = (op2 & 0xf);
								if(globalKey != 0)
									reg[reg1] = globalKey;
								else
									pc -= 2;
								globalKey = 0;
								break;
							case 0x10:
								// GETJ R			D21R
								reg1 = (op2 & 0xf);
								reg[reg1] = globalJKey;
								break;
						}
						break;
					case 0xD3:
						// PPIX R,R		D3RR
						reg1 = (op2 & 0xf0) >> 4;
						reg2 = op2 & 0xf;
						display.plot(color, reg[reg1], reg[reg2]);
						break;
					case 0xD4:
						switch(op2 & 0xf0){
							case 0x00:
								// DRWIM R			D40R
								reg1 = op2 & 0xf;
								reg2 = reg[reg1];//регистр указывает на участок памяти, в котором расположены последовательно h, w, y, x, адрес
								if(imageSize > 1)
									drawImageS(readInt(reg2 + 8), readInt(reg2 + 6), readInt(reg2 + 4), readInt(reg2 + 2), readInt(reg2));
								else
									drawImage(readInt(reg2 + 8), readInt(reg2 + 6), readInt(reg2 + 4), readInt(reg2 + 2), readInt(reg2));
								break;
							case 0x10:
								// SFCLR R			D41R
								reg1 = op2 & 0xf;
								color = reg[reg1] & 0xf;
								break;
							case 0x20:
								// SBCLR R			D42R
								reg1 = op2 & 0xf;
								bgcolor = reg[reg1] & 0xf;
								break;
							case 0x30:
								// GFCLR R			D43R
								reg1 = op2 & 0xf;
								reg[reg1] = color;
								break;
							case 0x40:
								// GBCLR R			D44R
								reg1 = op2 & 0xf;
								reg[reg1] = bgcolor;
								break;
							case 0x50:
								// ISIZE			D45R
								reg1 = op2 & 0xf;
								imageSize = reg[reg1] & 0x7;
								break;
							case 0x60:
								// DLINE			D46R
								reg1 = op2 & 0xf;
								reg2 = reg[reg1];//регистр указывает на участок памяти, в котором расположены последовательно y1, x1, y, x
								drawLine(readInt(reg2 + 6), readInt(reg2 + 4), readInt(reg2 + 2), readInt(reg2));
								break;
							case 0x70:
								// DRWRLE R		D47R
								reg1 = op2 & 0xf;
								reg2 = reg[reg1];//регистр указывает на участок памяти, в котором расположены последовательно h, w, y, x, адрес
								if(imageSize > 1)
									drawImageRLES(readInt(reg2 + 8), readInt(reg2 + 6), readInt(reg2 + 4), readInt(reg2 + 2), readInt(reg2));
								else
									drawImageRLE(readInt(reg2 + 8), readInt(reg2 + 6), readInt(reg2 + 4), readInt(reg2 + 2), readInt(reg2));
								break;
						}
						break;
					case 0xD5:
						// LDSPRT R,R		D5RR
						reg1 = (op2 & 0xf0) >> 4;//номер спрайта
						reg2 = op2 & 0xf;//адрес спрайта
						setSprite(reg[reg1] & 0x1f, reg[reg2]);
						break;
					case 0xD6:
						// SPALET R,R		D6 RR
						reg1 = (op2 & 0xf0) >> 4;//номер цвета
						reg2 = op2 & 0xf;//новый цвет
						display.changePalette(reg[reg1], reg[reg2]);
						break;
					case 0xD7:
						reg1 = op2 & 0xf;
						reg2 = reg[reg1];
						if((op2 & 0xf0) == 0)
							// SPART R 		D7 0R
							//регистр указывает на участок памяти, в котором расположены последовательно count, time, gravity
							setParticle(readInt(reg2 + 4), readInt(reg2 + 2), readInt(reg2));
						else if((op2 & 0xf0) == 0x10)
							//регистр указывает на участок памяти, в котором расположены последовательно speed, direction2, direction1, time
							setEmitter(readInt(reg2 + 6), readInt(reg2 + 4), readInt(reg2 + 2), readInt(reg2));
						else if((op2 & 0xf0) == 0x20)
							//регистр указывает на участок памяти, в котором расположены последовательно color, y, x
							drawParticle(readInt(reg2 + 4), readInt(reg2 + 2), readInt(reg2));
						break;
					case 0xD8:
						// SCROLL R,R		D8RR
						reg1 = (op2 & 0xf0) >> 4;//шаг
						reg2 = op2 & 0xf;//направление
						for(var i = 0; i < reg[reg1] + reg[reg1] % 2; i++)
							scrollScreen(reg[reg1], reg[reg2]);
						break;
					case 0xD9:
						// GETPIX R,R		D9RR
						reg1 = (op2 & 0xf0) >> 4;//x
						reg2 = op2 & 0xf;//y
						reg[reg1] = display.getPixel(reg[reg1], reg[reg2]);
						break;
					case 0xDA:
						// SPRSPX R,R		DA RR
						reg1 = (op2 & 0xf0) >> 4;//num
						reg2 = op2 & 0xf;//speed x

						break;
					case 0xDB:
						// SPRSPX R,R		DB RR
						reg1 = (op2 & 0xf0) >> 4;//num
						reg2 = op2 & 0xf;//speed y

						break;
					case 0xDC:
						// SPRGET R,R		DC RR
						reg1 = (op2 & 0xf0) >> 4;//num
						reg2 = op2 & 0xf;//type
						if(reg[reg2] == 0)
							reg[reg1] = sprites[reg[reg1] & 31].x;
						else if(reg[reg2] == 1)
							reg[reg1] = sprites[reg[reg1] & 31].y;
						else if(reg[reg2] == 2)
							reg[reg1] = sprites[reg[reg1] & 31].speedx;
						else if(reg[reg2] == 3)
							reg[reg1] = sprites[reg[reg1] & 31].speedy;
						else if(reg[reg2] == 4)
							reg[reg1] = sprites[reg[reg1] & 31].width;
						else if(reg[reg2] == 5)
							reg[reg1] = sprites[reg[reg1] & 31].height;
						else if(reg[reg2] == 6)
							reg[reg1] = sprites[reg[reg1] & 31].angle;
						break;
				}
				break;
			case 0xE0:
				// DRSPRT R,R,R	ERRR
				reg1 = (op1 & 0xf);//номер спрайта
				reg2 = (op2 & 0xf0) >> 4;//x
				reg3 = op2 & 0xf;//y
				drawSprite(reg[reg1] & 0x1f, reg[reg2], reg[reg3]);
				break;
			case 0xF0:
				// SSPRTV R,R,R	FR RR
				reg1 = (op1 & 0xf);//номер спрайта
				reg2 = (op2 & 0xf0) >> 4;//type
				reg3 = op2 & 0xf;//value
				if(reg[reg2] == 0)
					sprites[reg[reg1] & 31].x = reg[reg3];
				else if(reg[reg2] == 1)
					sprites[reg[reg1] & 31].y = reg[reg3];
				else if(reg[reg2] == 2){
					if(reg[reg3] > 128)
						sprites[reg[reg1] & 31].speedx = -(256 - (reg[reg3] & 0xff));
					else
						sprites[reg[reg1] & 31].speedx = reg[reg3];
				}
				else if(reg[reg2] == 3){
					if(reg[reg3] > 128)
						sprites[reg[reg1] & 31].speedy = -(256 - (reg[reg3] & 0xff));
					else
						sprites[reg[reg1] & 31].speedy = reg[reg3];
				}
				else if(reg[reg2] == 4)
					sprites[reg[reg1] & 31].width = reg[reg3];
				else if(reg[reg2] == 5)
					sprites[reg[reg1] & 31].height = reg[reg3];
				else if(reg[reg2] == 6)
					sprites[reg[reg1] & 31].angle = reg[reg3] % 360;
				break;
		}
	}
	
	function debug(){
		var d = '';
		var s = 'pc:' + toHex4(pc) + '\n';
		s += 'op:' + toHex4((mem[pc] << 8) + mem[pc + 1]) + '\n';
		s += 'C' + carry + 'Z' + zero + 'N' + negative + '\n';
		for(var i = 0; i < 16; i++)
			s += 'R' + i + ':' + toHex4(reg[i]) + ' (' + reg[i] + ')\n';
		for(var i = 0; i < debugVar.length; i++){
			d += debugVar[i].variable + '\t';
			d += toHex4(debugVar[i].adress) + '   ';
			d += readInt(debugVar[i].adress) + '\n';
		}
		debugVarArea.value = d;
		viewMemory();
		for(var i = 0; i < numberDebugString.length; i++)
			if(numberDebugString[i][2] == pc){
				thisDebugString = numberDebugString[i][1];
			}
		highliteLine();
		return s;
	}
	
	return {
		init:init,
		load:load,
		step:step,
		debug:debug,
		readMem:readMem,
		setRedraw:setRedraw,
		redrawSprite:redrawSprite,
		redrawParticle:redrawParticle
	};
}

var cpu = new Cpu;
cpu.init();