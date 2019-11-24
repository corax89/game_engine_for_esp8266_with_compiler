"use strict";

var timers = [];

function Cpu() {
	var mem = []; //память, максимум 65 534 байта
	var reg = []; //16 регистров, нулевой используется как указатель стека
	var regx = 0; //неявный регистр, указывает на Х позицию символа в текстовом режиме
	var regy = 0; //Y позиция символа
	var imageSize = 1; //влияет на множитель размера выводимой картинки, не относится к спрайтам
	var pc = 0; //указатель на текущую команду
	var carry = 0; //флаг переполнения
	var zero = 0; //флаг нуля
	var negative = 0; //флаг отрицательности
	var interrupt = 0; //флаг прерывания
	var redraw = 0; //флаг, устанавливаемый после перерисовки
	var _spr = []; //массив адресов и координат спрайтов
	var particles = []; //массив для частиц
	var maxParticles = 32; //максимальное количество частиц
	var emitter = []; //настройки для частиц
	var tile = []; //настройки для отрисовки тайлов
	var bgcolor = 0; //фоновый цвет
	var color = 1; //цвет рисования
	var charArray = []; //массив символов, выводимых на экран
	var interruptBuffer = [];
	var keyPosition = 0;
	var dataName = 0;
	var MULTIPLY_FP_RESOLUTION_BITS = 8; //point position in fixed point number

	function init() {
		var i;
		for (i = 0; i < 0xffff; i++)
			mem[i] = 0;
		for (i = 1; i < 16; i++)
			reg[i] = 0;
		//указываем последнюю ячейку памяти для стека, если памяти меньше то и значение соответственно меняется
		reg[0] = 0xffff;
		pc = 0;
		regx = 0;
		regy = 0;
		imageSize = 1;
		bgcolor = 0;
		color = 1;
		interrupt = 0;
		//задаем начальные координаты спрайтов вне границ экрана
		for (i = 0; i < 32; i++) {
			_spr[i] = {
				address: 0,
				x: 255,
				y: 255,
				speedx: 0,
				speedy: 0,
				height: 8,
				width: 8,
				angle: 0,
				isonebit: 0,
				lives: 0,
				collision: -1,
				solid: 0,
				gravity: 0,
				oncollision: 0,
				onexitscreen: 0,
				isscrolled: 1,
				fliphorisontal: 0
			};
		}
		for (i = 0; i < maxParticles; i++) {
			particles[i] = {
				time: 0,
				x: 0,
				y: 0,
				gravity: 0,
				speedx: 0,
				speedy: 0,
				color: 0
			};
		}
		emitter = {
			time: 0,
			timer: 0,
			timeparticle: 0,
			count: 0,
			x: 0,
			y: 0,
			gravity: 0,
			speedx: 0,
			speedy: 0,
			speedx1: 0,
			speedy1: 0,
			color: 0
		};
		tile = {
			adr: 0,
			imgwidth: 0,
			imgheight: 0,
			width: 0,
			height: 0,
			x: 0,
			y: 0
		};
		for (i = 0; i < 420; i++)
			charArray[i] = '';
		for (i = 0; i < 8; i++)
			timers[i] = 0;
	}
	//загрузка программы
	function load(a) {
		for (var i = 0; i < a.length; i++)
			mem[i] = a[i];
	}

	function writeInt(a, n) {
		writeMem(a + 1, (n & 0xff00) >> 8);
		writeMem(a, n & 0xff);
	}

	function readInt(a) {
		return (readMem(a + 1) << 8) + readMem(a);
	}

	function writeMem(a, n) {
		mem[a & 0xffff] = n & 0xff;
	}

	function readMem(a) {
		return mem[a & 0xffff];
	}

	function setRedraw() {
		redraw = 1;
	}

	function setFlags(n) {
		carry = (n > 0xffff) ? 1 : 0;
		zero = (n == 0) ? 1 : 0;
		negative = ((n & 0xffff) > 0x7fff) ? 1 : 0;
		n = n & 0xffff;
		return n;
	}

	function setFlagsC(n) {
		carry = 0;
		zero = 0;
		negative = 0;
		if (n > 0xff) {
			carry = 1;
		}
		if (n == 0) {
			zero = 1;
		} else if (n < 0) {
			negative = 1;
		}
		n = n & 0xff;
		return n;
	}

	function setSprite(n, a) {
		_spr[n].address = a;
	}

	function angleBetweenSprites(a, b) {
		var C = Math.floor(Math.atan2(_spr[a].y - _spr[b].y, _spr[a].x - _spr[b].x) * 57.4);
		C = (C < 0) ? C + 360 : C;
		return C;
	}

	function fillRect(x, y, w, h, c) {
		for (var i = x; i < x + w; i++)
			for (var j = y; j < y + h; j++)
				display.plot(c, i, j);
	}

	function scrollScreen(step, direction) {
		var bufPixel,
		n;
		if (direction == 2) {
			for (var y = 0; y < 128; y++) {
				bufPixel = display.getPixel(0, y);
				for (var x = 1; x < 128; x++)
					display.plot(display.getPixel(x, y), x - 1, y);
				display.plot(bufPixel, 127, y);
			}
			for (n = 0; n < 32; n++)
				if (_spr[n].isscrolled != 0)
					_spr[n].x -= 4;
		} else if (direction == 1) {
			for (var x = 0; x < 128; x++) {
				bufPixel = display.getPixel(x, 0);
				for (var y = 1; y < 128; y++)
					display.plot(display.getPixel(x, y), x, y - 1);
				display.plot(bufPixel, x, 127);
			}
			for (n = 0; n < 32; n++)
				if (_spr[n].isscrolled != 0)
					_spr[n].y -= 4;
		} else if (direction == 0) {
			for (var y = 0; y < 128; y++) {
				bufPixel = display.getPixel(127, y);
				for (var x = 127; x > 0; x--)
					display.plot(display.getPixel(x - 1, y), x, y);
				display.plot(bufPixel, 0, y);
			}
			for (n = 0; n < 32; n++)
				if (_spr[n].isscrolled != 0)
					_spr[n].x += 4;
		} else {
			for (var x = 0; x < 128; x++) {
				bufPixel = display.getPixel(x, 127);
				for (var y = 127; y > 0; y--)
					display.plot(display.getPixel(x, y - 1), x, y);
				display.plot(bufPixel, x, 0);
			}
			for (n = 0; n < 32; n++)
				if (_spr[n].isscrolled != 0)
					_spr[n].y += 4;
		}
		if (tile.adr > 0)
			tileDrawLine(step, direction);
	}

	function tileDrawLine(step, direction) {
		var x,
		y,
		x0,
		y0,
		y1,
		imgadr;
		if (direction == 2) {
			tile.x -= step;
			x0 = tile.x;
			y0 = tile.y;
			x = Math.floor((127 - x0) / tile.imgwidth);
			if (x < tile.width && x >= 0) {
				for (y = 0; y < tile.height; y++) {
					if (y0 + y * tile.imgheight > 0 && y0 + y * tile.imgheight < 128) {
						imgadr = readInt(tile.adr + (x + y * tile.width) * 2);
						if (imgadr > 0)
							drawImage(imgadr, x0 + x * tile.imgwidth, y0 + y * tile.imgheight, tile.imgwidth, tile.imgheight);
						else
							fillRect(x0 + x * tile.imgwidth, y0 + y * tile.imgheight, tile.imgwidth, tile.imgheight, bgcolor);
					}
				}
			} else if (tile.width * tile.imgwidth + x0 >= 0) {
				y0 = (y0 > 0) ? y0 : 0;
				y1 = (tile.y + tile.height * tile.imgheight < 128) ? tile.y + tile.height * tile.imgheight - y0 : 127 - y0;
				if (y0 < 127 && y1 > 0)
					fillRect(127 - step, y0, step, y1, bgcolor);
			}
		} else if (direction == 1) {
			tile.y -= step;
			x0 = tile.x;
			y0 = tile.y;
			y = Math.floor((127 - y0) / tile.imgheight);
			if (y < tile.height && y >= 0)
				for (x = 0; x < tile.width; x++) {
					if (x0 + x * tile.imgwidth > 0 && x0 + x * tile.imgwidth < 128) {
						imgadr = readInt(tile.adr + (x + y * tile.width) * 2);
						if (imgadr > 0)
							drawImage(imgadr, x0 + x * tile.imgwidth, y0 + y * tile.imgheight, tile.imgwidth, tile.imgheight);
						else
							fillRect(x0 + x * tile.imgwidth, y0 + y * tile.imgheight, tile.imgwidth, tile.imgheight, bgcolor);
					}
				}
		} else if (direction == 0) {
			tile.x += step;
			x0 = tile.x;
			y0 = tile.y;
			x = Math.floor((0 - x0) / tile.imgwidth);
			if (x0 < 0 && x >= 0) {
				for (y = 0; y < tile.height; y++) {
					if (y0 + y * tile.imgheight > 0 && y0 + y * tile.imgheight < 128) {
						imgadr = readInt(tile.adr + (x + y * tile.width) * 2);
						if (imgadr > 0)
							drawImage(imgadr, x0 + x * tile.imgwidth, y0 + y * tile.imgheight, tile.imgwidth, tile.imgheight);
						else
							fillRect(x0 + x * tile.imgwidth, y0 + y * tile.imgheight, tile.imgwidth, tile.imgheight, bgcolor);
					}
				}
			} else if (x0 < 128) {
				y0 = (y0 > 0) ? y0 : 0;
				y1 = (tile.y + tile.height * tile.imgheight < 128) ? tile.y + tile.height * tile.imgheight - y0 : 127 - y0;
				if (y0 < 127 && y1 > 0)
					fillRect(0, y0, step, y1, bgcolor);
			}
		} else if (direction == 3) {
			tile.y += step;
			x0 = tile.x;
			y0 = tile.y;
			y = Math.floor((0 - y0) / tile.imgheight);
			if (y >= 0)
				for (x = 0; x < tile.width; x++) {
					if (x0 + x * tile.imgwidth > 0 && x0 + x * tile.imgwidth < 128) {
						imgadr = readInt(tile.adr + (x + y * tile.width) * 2);
						if (imgadr > 0)
							drawImage(imgadr, x0 + x * tile.imgwidth, y0 + y * tile.imgheight, tile.imgwidth, tile.imgheight);
						else
							fillRect(x0 + x * tile.imgwidth, y0 + y * tile.imgheight, tile.imgwidth, tile.imgheight, bgcolor);
					}
				}
		}
	}

	function drawSprite(n, x1, y1) {
		if (x1 > 0x7fff)
			_spr[n].x = Math.floor((x1 - 0x10000) << 2);
		else
			_spr[n].x = Math.floor(x1 << 2);
		if (y1 > 0x7fff)
			_spr[n].y = Math.floor((y1 - 0x10000) << 2);
		else
			_spr[n].y = Math.floor(y1 << 2);
	}

	function setParticle(g, c, t) {
		emitter.gravity = g;
		emitter.count = c;
		emitter.timeparticle = t;
	}
	//time, direction, direction1, speed
	function setEmitter(t, d, d1, s) {
		emitter.time = t;
		emitter.speedx = Math.round(s * Math.cos(d / 57));
		emitter.speedy = Math.round(s * Math.sin(d / 57));
		emitter.speedx1 = Math.round(s * Math.cos(d1 / 57));
		emitter.speedy1 = Math.round(s * Math.sin(d1 / 57));
	}

	function drawParticle(x, y, c) {
		emitter.x = x << 1;
		emitter.y = y << 1;
		emitter.color = c;
		emitter.timer = emitter.time;
	}

	function randomD(a, b) {
		var min = Math.min(a, b);
		var max = Math.max(a, b);
		var r = min - 0.5 + Math.random() * (max - min + 1)
			r = Math.round(r);
		return r;
	}

	function redrawParticle() {
		var n,
		i;
		if (emitter.timer > 0) {
			emitter.timer -= 50;
			i = emitter.count;
			for (var n = 0; n < maxParticles; n++) {
				if (i == 0)
					break;
				if (particles[n].time <= 0) {
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
		for (n = 0; n < maxParticles; n++)
			if (particles[n].time > 0) {
				display.drawSpritePixel(particles[n].color, Math.floor(particles[n].x >> 1), Math.floor(particles[n].y >> 1));
				particles[n].time -= 50;
				if (randomD(0, 1) == 1) {
					particles[n].x += particles[n].speedx;
					particles[n].speedy += particles[n].gravity;
					particles[n].y += particles[n].speedy;
				} else {
					particles[n].x += Math.floor(particles[n].speedx / 2);
					particles[n].y += Math.floor(particles[n].speedy / 2);
				}
				if (particles[n].x < 0 || particles[n].x > 256 || particles[n].y < 0 || particles[n].y > 256)
					particles[n].time = 0;
			}
	}
	//adress, image width, image height, width, height
	function loadTile(a, iw, ih, w, h) {
		tile.adr = a;
		tile.imgwidth = iw;
		tile.imgheight = ih;
		tile.width = w;
		tile.height = h;
	}
	//number, speed, direction
	function spriteSetDirectionAndSpeed(n, s, d) {
		if (s > 0x7fff)
			s -= 0xffff;
		if (d > 0x7fff) {
			d = 360 + d % 360;
		}
		var nx = s * Math.cos(d / 57);
		var ny = s * Math.sin(d / 57);
		_spr[n].speedx = Math.floor(nx);
		_spr[n].speedy = Math.floor(ny);
	}

	function drawRotateSprPixel(color, x1, y1, x, y, w, h, a) {
		var x0 = w / 2;
		var y0 = h / 2;
		var nx = x0 + (x - x0) * Math.cos(a) - (y - y0) * Math.sin(a);
		var ny = y0 + (y - y0) * Math.cos(a) + (x - x0) * Math.sin(a);
		display.drawSpritePixel(color, x1 + Math.floor(nx), y1 + Math.floor(ny));
	}

	function redrawSprite() {
		var clr,
		n,
		i;
		for (n = 0; n < 32; n++) {
			if (_spr[n].lives > 0) {
				var adr = _spr[n].address;
				var x1 = Math.floor(_spr[n].x >> 2);
				var y1 = Math.floor(_spr[n].y >> 2);
				if (_spr[n].isonebit == 0) {
					for (var y = 0; y < _spr[n].height; y++)
						for (var x = 0; x < _spr[n].width; x++) {
							clr = (readMem(adr) & 0xf0) >> 4;
							if (clr > 0) {
								if (_spr[n].fliphorisontal)
									drawRotateSprPixel(clr, x1, y1, _spr[n].width - x, y, _spr[n].width, _spr[n].height, _spr[n].angle / 57);
								else
									drawRotateSprPixel(clr, x1, y1, x, y, _spr[n].width, _spr[n].height, _spr[n].angle / 57);
							}
							x++;
							clr = (readMem(adr) & 0xf);
							if (clr > 0)
								if (_spr[n].fliphorisontal)
									drawRotateSprPixel(clr, x1, y1, _spr[n].width - x, y, _spr[n].width, _spr[n].height, _spr[n].angle / 57);
								else
									drawRotateSprPixel(clr, x1, y1, x, y, _spr[n].width, _spr[n].height, _spr[n].angle / 57);
							adr++;
						}
				} else {
					i = 0;
					var ibit;
					for (var y = 0; y < _spr[n].height; y++)
						for (var x = 0; x < _spr[n].width; x++) {
							if (i % 8 == 0) {
								ibit = readMem(adr);
								adr++;
							}
							if (ibit & 0x80)
								if (_spr[n].fliphorisontal)
									drawRotateSprPixel(color, x1, y1, _spr[n].width - x, y, _spr[n].width, _spr[n].height, _spr[n].angle / 57);
								else
									drawRotateSprPixel(color, x1, y1, x, y, _spr[n].width, _spr[n].height, _spr[n].angle / 57);
							ibit = ibit << 1;
							i++;
						}
				}
				_spr[n].speedy += _spr[n].gravity;
				_spr[n].x += _spr[n].speedx;
				_spr[n].y += _spr[n].speedy;
				if (_spr[n].onexitscreen > 0) {
					if ((_spr[n].x >> 2) + _spr[n].width < 0 || (_spr[n].x >> 2) > 127
						 || (_spr[n].y >> 2) + _spr[n].height < 0 || (_spr[n].y >> 2) > 127)
						setinterrupt(_spr[n].onexitscreen, n);
				}
			}
		}
	}

	function flagsToByte() {
		return (carry & 0x1) + ((zero & 0x1) << 1) + ((negative & 0x1) << 2);
	}

	function byteToFlags(b) {
		carry = b & 0x1;
		zero = (b & 0x2) >> 1;
		negative = (b & 0x4) >> 2;
	}

	function setinterrupt(adr, param) {
		if (interrupt == 0) {
			reg[0] -= 2;
			writeInt(reg[0], flagsToByte());
			for (var j = 1; j <= 15; j++) {
				reg[0] -= 2;
				writeInt(reg[0], reg[j]);
			}
			reg[0] -= 2;
			writeInt(reg[0], param);
			reg[0] -= 2;
			writeInt(reg[0], pc);
			interrupt = pc;
			pc = adr;
		} else if (interruptBuffer.length < 10) {
			interruptBuffer.push(param);
			interruptBuffer.push(adr);
		}
	}

	function getSpriteInXY(x, y) {
		if (x > 0x7fff)
			x -= 0xffff;
		if (y > 0x7fff)
			y -= 0xffff;
		x = Math.floor(x << 2);
		y = Math.floor(y << 2);
		for (var n = 0; n < 32; n++) {
			if (_spr[n].lives > 0)
				if (_spr[n].x < x && _spr[n].x + (_spr[n].width << 2) > x &&
					_spr[n].y < y && _spr[n].y + (_spr[n].height << 2) > y)
					return n;
		}
		return  - 1;
	}

	function resolveCollision(n, i) {
		var startx,
		starty,
		startix,
		startiy;
		startx = _spr[n].x;
		starty = _spr[n].y;
		startix = _spr[i].x;
		startiy = _spr[i].y;
		_spr[n].x = _spr[n].x - _spr[n].speedx;
		_spr[n].y = _spr[n].y - _spr[n].speedy;
		_spr[i].x = _spr[i].x - _spr[i].speedx;
		_spr[i].y = _spr[i].y - _spr[i].speedy;
		if ((_spr[n].speedy >= 0 && _spr[i].speedy <= 0) || (_spr[n].speedy <= 0 && _spr[i].speedy >= 0)) {
			if (_spr[n].y > _spr[i].y) {
				if (_spr[i].gravity > 0) {
					_spr[i].y = _spr[n].y - (_spr[i].height << 2);
				}
			} else {
				if (_spr[n].gravity > 0) {
					_spr[n].y = _spr[i].y - (_spr[n].height << 2);
				}
			}
		}
		if (_spr[n].x < _spr[i].x + (_spr[i].width << 2) &&
			_spr[n].x + (_spr[n].width << 2) > _spr[i].x &&
			_spr[n].y < _spr[i].y + (_spr[i].height << 2) &&
			_spr[n].y + (_spr[n].height << 2) > _spr[i].y) {
			if (_spr[n].x > _spr[i].x) {
				_spr[n].x++;
				_spr[i].x--;
			} else {
				_spr[n].x--;
				_spr[i].x++;
			}
			if (_spr[n].y > _spr[i].y) {
				_spr[n].y++;
				_spr[i].y--;
			} else {
				_spr[n].y--;
				_spr[i].y++;
			}
		}
		if (_spr[n].gravity != 0) {
			_spr[n].speedx = Math.floor((_spr[n].x - startx) / 4);
			_spr[n].speedy = Math.floor((_spr[n].y - starty) / 4);
		} else {
			_spr[n].speedx = Math.floor((_spr[n].x - startx));
			_spr[n].speedy = Math.floor((_spr[n].y - starty));
		}
		if (_spr[i].gravity != 0) {
			_spr[i].speedx = Math.floor((_spr[i].x - startix) / 4);
			_spr[i].speedy = Math.floor((_spr[i].y - startiy) / 4);
		} else {
			_spr[i].speedx = Math.floor((_spr[i].x - startix));
			_spr[i].speedy = Math.floor((_spr[i].y - startiy));
		}
	}

	function testSpriteCollision(debug) {
		var n,
		i,
		x0,
		y0,
		adr;
		for (n = 0; n < 32; n++)
			_spr[n].collision = (-1) & 0xffff;
		for (n = 0; n < 32; n++) {
			if (_spr[n].lives > 0) {
				for (i = 0; i < n; i++) {
					if (_spr[i].lives > 0)
						if (_spr[n].x < _spr[i].x + (_spr[i].width << 2) &&
							_spr[n].x + (_spr[n].width << 2) > _spr[i].x &&
							_spr[n].y < _spr[i].y + (_spr[i].height << 2) &&
							_spr[n].y + (_spr[n].height << 2) > _spr[i].y) {
							_spr[n].collision = i;
							_spr[i].collision = n;
							if (_spr[n].oncollision > 0)
								setinterrupt(_spr[n].oncollision, n);
							if (_spr[i].oncollision > 0)
								setinterrupt(_spr[i].oncollision, i);
							if (debug) {
								display.drawTestRect(_spr[n].x >> 2, _spr[n].y >> 2, _spr[n].width, _spr[n].height, _spr[n].solid);
								display.drawTestRect(_spr[i].x >> 2, _spr[i].y >> 2, _spr[i].width, _spr[i].height, _spr[i].solid);
							}
							if (_spr[n].solid != 0 && _spr[i].solid != 0) {
								resolveCollision(n, i);
							}
						}
				}
				if (_spr[n].solid != 0) {
					x0 = Math.floor((Math.floor(_spr[n].x >> 2) + _spr[n].width / 2 - tile.x) / tile.imgwidth);
					y0 = Math.floor((Math.floor(_spr[n].y >> 2) + _spr[n].height / 2 - tile.y) / tile.imgheight);
					if (x0 >= -1 && x0 <= tile.width && y0 >= -1 && y0 <= tile.height) {
						if (debug) {
							display.drawTestRect(tile.x + x0 * tile.imgwidth, tile.y + y0 * tile.imgheight, tile.imgwidth, tile.imgheight, getTile(x0, y0));
							display.drawTestRect(tile.x + (x0 - 1) * tile.imgwidth, tile.y + y0 * tile.imgheight, tile.imgwidth, tile.imgheight, getTile(x0 - 1, y0));
							display.drawTestRect(tile.x + (x0 + 1) * tile.imgwidth, tile.y + y0 * tile.imgheight, tile.imgwidth, tile.imgheight, getTile(x0 + 1, y0));
							display.drawTestRect(tile.x + x0 * tile.imgwidth, tile.y + (y0 - 1) * tile.imgheight, tile.imgwidth, tile.imgheight, getTile(x0, y0 - 1));
							display.drawTestRect(tile.x + x0 * tile.imgwidth, tile.y + (y0 + 1) * tile.imgheight, tile.imgwidth, tile.imgheight, getTile(x0, y0 + 1));
						}
						x0 = Math.floor(_spr[n].x >> 2);
						y0 = Math.floor(_spr[n].y >> 2);
						if (getTileInXY(x0, y0) || getTileInXY(x0 + _spr[n].width, y0)
							 || getTileInXY(x0, y0 + _spr[n].height) || getTileInXY(x0 + _spr[n].width, y0 + _spr[n].height)) {
							_spr[n].y = _spr[n].y - _spr[n].speedy;
							y0 = Math.floor(_spr[n].y >> 2);
							if (getTileInXY(x0, y0) || getTileInXY(x0 + _spr[n].width, y0)
								 || getTileInXY(x0, y0 + _spr[n].height)
								 || getTileInXY(x0 + _spr[n].width, y0 + _spr[n].height)) {
								_spr[n].x = _spr[n].x - _spr[n].speedx;
							}
							_spr[n].speedy = Math.floor(_spr[n].speedy / 2 - _spr[n].gravity);
							_spr[n].speedx = Math.floor(_spr[n].speedx / 2);
							x0 = Math.floor(_spr[n].x >> 2);
							y0 = Math.floor(_spr[n].y >> 2);
							if (getTileInXY(x0, y0 + _spr[n].height)
								 || getTileInXY(x0 + _spr[n].width, y0 + _spr[n].height)) {
								_spr[n].y--;
							}
						}
					}
				}
			}
		}
	}

	function getTileInXY(x, y) {
		if (x > 0x7fff)
			x -= 0xffff;
		if (y > 0x7fff)
			y -= 0xffff;
		if (x < tile.x || y < tile.y || x > tile.x + tile.imgwidth * tile.width || y > tile.y + tile.imgheight * tile.height)
			return 0;
		var p = (Math.floor((x - tile.x) / tile.imgwidth) + Math.floor((y - tile.y) / tile.imgheight) * tile.width);
		var t = readInt(tile.adr + p * 2);
		return t;
	}

	function getTile(x, y) {
		if (x < 0 || x >= tile.width || y < 0 || y >= tile.height)
			return 0;
		return readInt(tile.adr + (x + y * tile.width) * 2);
	}

	function drawTile(x0, y0) {
		if (x0 > 0x7fff)
			x0 -= 0xffff;
		if (y0 > 0x7fff)
			y0 -= 0xffff;
		var x,
		y,
		imgadr;
		tile.x = x0;
		tile.y = y0;
		for (x = 0; x < tile.width; x++) {
			for (y = 0; y < tile.height; y++) {
				if (x0 + x * tile.imgwidth >= -tile.imgwidth && x0 + x * tile.imgwidth < 128 && y0 + y * tile.imgheight >= -tile.imgheight && y0 + y * tile.imgheight < 128) {
					imgadr = readInt(tile.adr + (x + y * tile.width) * 2);
					if (imgadr > 0)
						drawImage(imgadr, x0 + x * tile.imgwidth, y0 + y * tile.imgheight, tile.imgwidth, tile.imgheight);
				}
			}
		}
	}

	function drawImage(a, x1, y1, w, h) {
		var color;
		if (x1 > 0x7fff)
			x1 -= 0xffff;
		if (y1 > 0x7fff)
			y1 -= 0xffff;
		for (var y = 0; y < h; y++)
			for (var x = 0; x < w; x++) {
				color = (readMem(a) & 0xf0) >> 4;
				if (color > 0)
					display.plot(color, x1 + x, y1 + y);
				x++;
				color = (readMem(a) & 0xf);
				if (color > 0)
					display.plot(color, x1 + x, y1 + y);
				a++;
			}
	}

	function drawImageRLE(a, x1, y1, w, h) {
		var i = 0;
		var repeat = readMem(a);
		a++;
		var color1 = (readMem(a) & 0xf0) >> 4;
		var color2 = readMem(a) & 0xf
			if (x1 > 0x7fff)
				x1 -= 0xffff;
			if (y1 > 0x7fff)
				y1 -= 0xffff;
			while (i < w * h) {
				if (repeat > 0x81) {
					if (color1 > 0)
						display.plot(color1, x1 + i % w, y1 + Math.floor(i / w));
					if (color2 > 0)
						display.plot(color2, x1 + i % w + 1, y1 + Math.floor(i / w));
					i += 2;
					a++;
					repeat--;
					color1 = (readMem(a) & 0xf0) >> 4;
					color2 = readMem(a) & 0xf;
				} else if (repeat == 0x81) {
					repeat = readMem(a);
					a++;
					color1 = (readMem(a) & 0xf0) >> 4;
					color2 = readMem(a) & 0xf;
				} else if (repeat > 0) {
					if (color1 > 0)
						display.plot(color1, x1 + i % w, y1 + Math.floor(i / w));
					if (color2 > 0)
						display.plot(color2, x1 + i % w + 1, y1 + Math.floor(i / w));
					i += 2;
					repeat--;
				} else if (repeat == 0) {
					a++;
					repeat = readMem(a);
					a++;
					color1 = (readMem(a) & 0xf0) >> 4;
					color2 = readMem(a) & 0xf;
				}
			}
	}
	//рисование однобитной картинки
	function drawImage1bit(a, x1, y1, w, h) {
		var i = 0;
		var bit;
		if (x1 > 0x7fff)
			x1 -= 0xffff;
		if (y1 > 0x7fff)
			y1 -= 0xffff;
		for (var y = 0; y < h; y++)
			for (var x = 0; x < w; x++) {
				if (i % 8 == 0) {
					bit = readMem(a);
					a++;
				}
				if (bit & 0x80)
					display.plot(color, x1 + x, y1 + y);
				else
					display.plot(bgcolor, x1 + x, y1 + y);
				bit = bit << 1;
				i++;
			}
	}
	//функция рисования картинки, если ее размер отличается от 1
	function drawImageS(a, x1, y1, w, h) {
		var color,
		jx,
		jy;
		var s = imageSize;
		if (x1 > 0x7fff)
			x1 -= 0xffff;
		if (y1 > 0x7fff)
			y1 -= 0xffff;
		for (var y = 0; y < h; y++)
			for (var x = 0; x < w; x++) {
				color = (readMem(a) & 0xf0) >> 4;
				if (color > 0)
					for (jx = 0; jx < s; jx++)
						for (jy = 0; jy < s; jy++)
							display.plot(color, x1 + x * s + jx, y1 + y * s + jy);
				x++;
				color = (readMem(a) & 0xf);
				if (color > 0)
					for (jx = 0; jx < s; jx++)
						for (jy = 0; jy < s; jy++)
							display.plot(color, x1 + x * s + jx, y1 + y * s + jy);
				a++;
			}
	}

	function drawImageRLES(a, x1, y1, w, h) {
		var i = 0;
		var s = imageSize;
		var repeat = readMem(a);
		a++;
		var color1 = (readMem(a) & 0xf0) >> 4;
		var color2 = readMem(a) & 0xf
			if (x1 > 0x7fff)
				x1 -= 0xffff;
			if (y1 > 0x7fff)
				y1 -= 0xffff;
			while (i < w * h) {
				if (repeat > 0x81) {
					if (color1 > 0)
						display.largeplot(color1, x1 + (i % w) * s, y1 + Math.floor(i / w) * s, s);
					if (color2 > 0)
						display.largeplot(color2, x1 + (i % w) * s + s, y1 + Math.floor(i / w) * s, s);
					i += 2;
					a++;
					repeat--;
					color1 = (readMem(a) & 0xf0) >> 4;
					color2 = readMem(a) & 0xf
				} else if (repeat == 0x81) {
					repeat = readMem(a);
					a++;
					color1 = (readMem(a) & 0xf0) >> 4;
					color2 = readMem(a) & 0xf
				} else if (repeat > 0) {
					if (color1 > 0)
						display.largeplot(color1, x1 + (i % w) * s, y1 + Math.floor(i / w) * s, s);
					if (color2 > 0)
						display.largeplot(color2, x1 + (i % w) * s + s, y1 + Math.floor(i / w) * s, s);
					i += 2;
					repeat--;
				} else if (repeat == 0) {
					a++;
					repeat = readMem(a);
					a++;
					color1 = (readMem(a) & 0xf0) >> 4;
					color2 = readMem(a) & 0xf
				}
			}
	}

	function drawImage1bitS(a, x1, y1, w, h) {
		var i = 0;
		var bit,
		jx,
		jy;
		var s = imageSize;
		if (x1 > 0x7fff)
			x1 -= 0xffff;
		if (y1 > 0x7fff)
			y1 -= 0xffff;
		for (var y = 0; y < h; y++)
			for (var x = 0; x < w; x++) {
				if (i % 8 == 0) {
					bit = readMem(a);
					a++;
				}
				if (bit & 0x80) {
					for (jx = 0; jx < s; jx++)
						for (jy = 0; jy < s; jy++)
							display.plot(color, x1 + x * s + jx, y1 + y * s + jy);
				} else {
					for (jx = 0; jx < s; jx++)
						for (jy = 0; jy < s; jy++)
							display.plot(bgcolor, x1 + x * s + jx, y1 + y * s + jy);
				}
				bit = bit << 1;
				i++;
			}
	}

	function drawFVLine(x, y1, y2) {
		for (var i = y1; i <= y2; i++)
			display.plot(color, x, i);
	}

	function drawFHLine(x1, x2, y) {
		for (var i = x1; i <= x2; i++)
			display.plot(color, i, y);
	}

	function drwLine(x1, y1, x2, y2) {
		if (x1 > 0x7fff)
			x1 = x1 - 0x10000;
		if (y1 > 0x7fff)
			y1 = y1 - 0x10000;
		if (x2 > 0x7fff)
			x2 = x2 - 0x10000;
		if (y2 > 0x7fff)
			y2 = y2 - 0x10000;
		if (x1 == x2) {
			if (y1 > y2)
				drawFVLine(x1, y2, y1);
			else
				drawFVLine(x1, y1, y2);
			return;
		} else if (y1 == y2) {
			if (x1 > x2)
				drawFHLine(x2, x1, y1);
			else
				drawFHLine(x1, x2, y1);
			return;
		}
		var dX = Math.abs(x2 - x1);
		var dY = Math.abs(y2 - y1);
		var sX = x1 < x2 ? 1 : -1;
		var sY = y1 < y2 ? 1 : -1;
		var err = dX - dY;
		display.plot(color, x2, y2);
		while (x1 != x2 || y1 != y2) {
			display.plot(color, x1, y1);
			var err2 = err * 2;
			if (err2 > -dY) {
				err -= dY;
				x1 += sX;
			}
			if (err2 < dX) {
				err += dX;
				y1 += sY;
			}
		}
	}

	function drwRect(x, y, x1, y1) {
		drawFHLine(x, x1, y);
		drawFHLine(x, x1, y1);
		drawFVLine(x, y, y1);
		drawFVLine(x1, y1, y1);
	}

	function fllRect(x, y, x1, y1) {
		for (var jy = y; jy <= y1; jy++)
			drawFHLine(x, x1, jy);
	}

	function drwCirc(x0, y0, r) {
		var x = 0;
		var dx = 1;
		var dy = r + r;
		var p =  - (r >> 1);
		// These are ordered to minimise coordinate changes in x or y
		// drawPixel can then send fewer bounding box commands
		setPix(x0 + r, y0, color);
		setPix(x0 - r, y0, color);
		setPix(x0, y0 - r, color);
		setPix(x0, y0 + r, color);
		while (x < r) {
			if (p >= 0) {
				dy -= 2;
				p -= dy;
				r--;
			}
			dx += 2;
			p += dx;
			x++;
			// These are ordered to minimise coordinate changes in x or y
			// drawPixel can then send fewer bounding box commands
			setPix(x0 + x, y0 + r, color);
			setPix(x0 - x, y0 + r, color);
			setPix(x0 - x, y0 - r, color);
			setPix(x0 + x, y0 - r, color);
			setPix(x0 + r, y0 + x, color);
			setPix(x0 - r, y0 + x, color);
			setPix(x0 - r, y0 - x, color);
			setPix(x0 + r, y0 - x, color);
		}
	}

	function fllCirc(x0, y0, r) {
		var x = 0;
		var dx = 1;
		var dy = r + r;
		var p =  - (r >> 1);
		drawFHLine(x0 - r, x0 + r, y0);
		while (x < r) {
			if (p >= 0) {
				dy -= 2;
				p -= dy;
				r--;
			}
			dx += 2;
			p += dx;
			x++;
			drawFHLine(x0 - r, x0 + r, y0 + x);
			drawFHLine(x0 - r, x0 + r, y0 - x);
			drawFHLine(x0 - x, x0 + x, y0 + r);
			drawFHLine(x0 - x, x0 + x, y0 - r);
		}
	}

	function drwTriangle(x1, y1, x2, y2, x3, y3) {
		drwLine(x1, y1, x2, y2);
		drwLine(x2, y2, x3, y3);
		drwLine(x3, y3, x1, y1);
	}

	function fllTriangle(x0, y0, x1, y1, x2, y2) {
		var a,
		b,
		y,
		last,
		t;
		if (y0 > y1) {
			t = y0;
			y0 = y1;
			y1 = t;
			t = x0;
			x0 = x1;
			x1 = t;
		}
		if (y1 > y2) {
			t = y2;
			y2 = y1;
			y1 = t;
			t = x2;
			x2 = x1;
			x1 = t;
		}
		if (y0 > y1) {
			t = y0;
			y0 = y1;
			y1 = t;
			t = x0;
			x0 = x1;
			x1 = t;
		}
		if (y0 == y2) {
			a = b = x0;
			if (x1 < a)
				a = x1;
			else if (x1 > b)
				b = x1;
			if (x2 < a)
				a = x2;
			else if (x2 > b)
				b = x2;
			drawFHLine(a, b, y0);
			return;
		}
		var
		dx01 = x1 - x0,
		dy01 = y1 - y0,
		dx02 = x2 - x0,
		dy02 = y2 - y0,
		dx12 = x2 - x1,
		dy12 = y2 - y1;
		var
		sa = 0,
		sb = 0;
		if (y1 == y2)
			last = y1; // Include y1 scanline
		else
			last = y1 - 1; // Skip it
		for (y = y0; y <= last; y++) {
			a = x0 + Math.floor(sa / dy01);
			b = x0 + Math.floor(sb / dy02);
			sa += dx01;
			sb += dx02;
			if (a > b) {
				t = a;
				a = b;
				b = t;
			}
			drawFHLine(a, b, y);
		}
		sa = dx12 * (y - y1);
		sb = dx02 * (y - y0);
		for (; y <= y2; y++) {
			a = x1 + Math.floor(sa / dy12);
			b = x0 + Math.floor(sb / dy02);
			sa += dx12;
			sb += dx02;
			if (a > b) {
				t = a;
				a = b;
				b = t;
			}
			drawFHLine(a, b, y);
		}
	}

	function charLineUp(n) {
		display.reset();
		for (var i = 0; i < 420 - n * 20; i++) {
			charArray[i] = charArray[i + n * 20];
			display.char(charArray[i], (i % 20) * 6, Math.floor(i / 20) * 8, 1, 0);
		}
	}

	function printc(c, fc, bc) {
		if (c == '\n') {
			for (var i = regx; i < 20; i++) {
				display.char(' ', i * 6, regy * 8, fc, bc);
				charArray[i + regy * 20] = ' ';
			}
			regy++;
			regx = 0;
			if (regy > 15) {
				regy = 15;
				charLineUp(1);
			}
		} else if (c == '\t') {
			for (var i = 0; i <= regx % 5; i++) {
				display.char(' ', regx * 6, regy * 8, fc, bc);
				charArray[regx + regy * 20] = ' ';
				regx++;
				if (regx > 20) {
					i = 99;
					regy++;
					regx = 0;
					if (regy > 15) {
						regy = 15;
						charLineUp(1);
					}
				}
			}
		} else {
			display.char(c, regx * 6, regy * 8, fc, bc);
			charArray[regx + regy * 20] = c;
			regx++;
			if (regx > 20) {
				regy++;
				regx = 0;
				if (regy > 15) {
					regy = 15;
					charLineUp(1);
				}
			}
		}
	}

	function randomInteger(min, max) {
		var r = min - 0.5 + Math.random() * (max - min + 1)
			r = Math.round(r);
		return r;
	}

	function distancepp(x1, y1, x2, y2) {
		if (x1 > 0x7fff)
			x1 = x1 - 0x10000;
		if (y1 > 0x7fff)
			y1 = y1 - 0x10000;
		if (x2 > 0x7fff)
			x2 = x2 - 0x10000;
		if (y2 > 0x7fff)
			y2 = y2 - 0x10000;
		return Math.floor(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
	}

	function setDataName(a) {
		dataName = a;
	}

	function saveData(arrayAddress, count) {
		var name,
		array,
		i;
		if (dataName > 0) {
			name = '';
			i = 0;
			while (i < 12 && mem[dataName + i] != 0) {
				name += String.fromCharCode(mem[dataName + i]);
				i++;
			}
		} else
			name = 'default';
		array = [];
		if (count > 242)
			count = 242;
		for (i = 0; i < count; i++)
			array[i] = mem[arrayAddress + i];
		localStorage[name] = array;
		return count;
	}

	function loadData(arrayAddress) {
		var name,
		array,
		i;
		if (dataName > 0) {
			name = '';
			i = 0;
			while (i < 12 && mem[dataName + i] != 0) {
				name += String.fromCharCode(mem[dataName + i]);
				i++;
			}
		} else
			name = 'default';
		if (localStorage[name]) {
			array = localStorage[name].split(',');
			for (i = 0; i < array.length; i++)
				mem[arrayAddress + i] = parseInt(array[i], 10) & 0xff;
			return i;
		}
		return 0;
	}

	function step() {
		//все команды двухбайтные, за некоторыми следуют два байта данных
		var o1 = mem[pc++]; //первый байт
		var o2 = mem[pc++]; //второй байт
		var r1 = 0; // дополнительные переменные
		var r2 = 0;
		var r3 = 0;
		var adr;
		var n = 0;
		switch (o1 & 0xf0) {
		case 0x00:
			switch (o1) {
			case 0x01:
				//LDI R,int		01 0R XXXX
				r1 = (o2 & 0xf);
				reg[r1] = readInt(pc);
				setFlags(reg[r1]);
				pc += 2;
				break;
			case 0x02:
				//LDI R,(R)		02 RR
				r1 = ((o2 & 0xf0) >> 4);
				r2 = (o2 & 0xf);
				reg[r1] = readInt(reg[r2]);
				setFlags(reg[r1]);
				break;
			case 0x03:
				//LDI R,(adr)	03 0R XXXX
				r1 = (o2 & 0xf);
				reg[r1] = readInt(readInt(pc));
				setFlags(reg[r1]);
				pc += 2;
				break;
			case 0x04:
				//LDI R,(int+R)	04 RR XXXX
				r1 = ((o2 & 0xf0) >> 4);
				r2 = (o2 & 0xf);
				reg[r1] = readInt(reg[r2] + readInt(pc));
				setFlags(reg[r1]);
				pc += 2;
				break;
			case 0x05:
				//STI (R),R		05 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				//writeInt(readInt(reg[r1]),reg[r2]);
				writeInt(reg[r1], reg[r2]);
				break;
			case 0x06:
				if ((o2 & 0x0f) == 0) {
					//STI (adr),R	06 R0 XXXX
					r1 = (o2 & 0xf0) >> 4;
					writeInt(readInt(pc), reg[r1]);
					pc += 2;
				} else {
					//STI (adr+R),R 06 RR XXXX
					r1 = (o2 & 0xf0) >> 4;
					r2 = o2 & 0xf;
					writeInt(readInt(pc) + reg[r1], reg[r2]);
					pc += 2;
				}
				break;
			case 0x07:
				//MOV R,R		07 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				reg[r1] = reg[r2];
				break;
			case 0x08:
				//LDIAL R,(int+R*2)	08 RR XXXX
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				reg[r1] = readInt(reg[r2] * 2 + readInt(pc));
				setFlags(reg[r1]);
				pc += 2;
				break;
			case 0x09:
				//STIAL (adr+R*2),R 	09 RR XXXX
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				writeInt(readInt(pc) + reg[r1] * 2, reg[r2]);
				pc += 2;
				break;
			default:
				pc++;
			}
			break;
		case 0x10:
			// LDC R,char	1R XX
			r1 = (o1 & 0xf);
			reg[r1] = o2;
			setFlagsC(reg[r1]);
			break;
		case 0x20:
			if (o1 == 0x20) {
				// LDC R,(R)	20 RR
				r1 = ((o2 & 0xf0) >> 4);
				r2 = (o2 & 0xf);
				reg[r1] = readMem(reg[r2]);
				setFlagsC(reg[r1]);
			} else {
				// LDC R,(R+R)	2R RR
				r1 = (o1 & 0xf);
				r2 = ((o2 & 0xf0) >> 4);
				r3 = (o2 & 0xf);
				reg[r1] = readMem(reg[r2] + reg[r3]);
				setFlagsC(reg[r1]);
			}
			break;
		case 0x30:
			switch (o1) {
			case 0x30:
				// LDC R,(int+R)30 RR XXXX
				r1 = ((o2 & 0xf0) >> 4);
				r2 = (o2 & 0xf);
				reg[r1] = readMem(reg[r2] + readInt(pc));
				setFlagsC(reg[r1]);
				pc += 2;
				break;
			case 0x31:
				// LDC R,(adr)	31 0R XXXX
				r1 = (o2 & 0xf);
				reg[r1] = readMem(readInt(pc));
				setFlagsC(reg[r1]);
				pc += 2;
				break;
			case 0x32:
				// STC (adr),R	32 0R XXXX
				r1 = (o2 & 0xf0) >> 4;
				writeMem(readInt(pc), reg[r1]);
				pc += 2;
				break;
			case 0x33:
				// STC (int+R),R33 RR XXXX
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				writeMem(readInt(pc) + reg[r1], reg[r2]);
				pc += 2;
				break;
			}
			break;
		case 0x40:
			if (o1 == 0x40) {
				// STC (R),R	40 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				//writeMem(readInt(reg[r1]),reg[r2]);
				writeMem(reg[r1], reg[r2]);
			} else {
				// STC (R+R),R	4R RR
				r1 = (o1 & 0xf);
				r2 = ((o2 & 0xf0) >> 4);
				r3 = (o2 & 0xf);
				writeMem(reg[r1] + reg[r2], reg[r3]);
			}
			break;
		case 0x50:
			switch (o1) {
			case 0x50:
				//HLT				5000
				pc -= 2;
				break;
			case 0x51:
				// STIMER R,R		51RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				timers[reg[r1] & 0x7] = reg[r2];
				break;
			case 0x52:
				// GTIMER R		520R
				r1 = o2 & 0xf;
				reg[r1] = timers[reg[r1] & 0x7];
				setFlags(reg[r1]);
				break;
			case 0x53:
				// SETLED R		530R
				r1 = o2 & 0xf;
				display.drawLed(reg[r1]);
				//console.log('New pixel color: ' + reg[r1]);
				break;
			case 0x54:
				// LOADRT		540R
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				sound.rtttl.address = reg[r1];
				sound.rtttl.loop = reg[r2];
				sound.loadRtttl();
				break;
			case 0x55:
				switch (o2) {
					// PLAYRT		5500
				case 0x00:
					sound.rtttl.play = 1;
					break;
					// PAUSERT		5501
				case 0x01:
					sound.rtttl.play = 0;
					break;
					// STOPRT		5502
				case 0x02:
					sound.rtttl.play = 0;
					sound.rtttl.position = 0;
					break;
				}
				break;
			case 0x56:
				// LOADRT		540R
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				sound.addTone(reg[r1], reg[r2]);
				break;
			case 0x57:
				if (o2 < 0x10) {
					// LDATA R			57 0R
					r2 = o2 & 0xf;
					reg[r2] = loadData(reg[r2]);
				} else if (o2 < 0x20) {
					// NDATA R			57 1R
					r2 = o2 & 0xf;
					setDataName(reg[r2]);
				}
				break;
			case 0x58:
				// SDATA R,R			58 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				reg[r1] = saveData(reg[r1], reg[r2]);
				break;
			}
			break;
		case 0x60:
			// LDI R,(R+R)	6R RR
			r1 = (o1 & 0xf);
			r2 = ((o2 & 0xf0) >> 4);
			r3 = (o2 & 0xf);
			reg[r1] = readInt(reg[r2] + reg[r3]);
			setFlags(reg[r1]);
			break;
		case 0x70:
			// STI (R+R),R	7R RR
			r1 = (o1 & 0xf);
			r2 = ((o2 & 0xf0) >> 4);
			r3 = (o2 & 0xf);
			writeInt(reg[r1] + reg[r2], reg[r3]);
			break;
		case 0x80:
			switch (o1) {
			case 0x80:
				// POP R		80 0R
				r1 = (o2 & 0xf);
				reg[r1] = readInt(reg[0]);
				reg[0] += 2;
				break;
			case 0x81:
				// POPN R		81 0R
				r1 = (o2 & 0xf);
				for (var j = r1; j >= 1; j--) {
					reg[j] = readInt(reg[0]);
					reg[0] += 2;
				}
				break;
			case 0x82:
				// PUSH R		82 0R
				r1 = (o2 & 0xf);
				reg[0] -= 2;
				writeInt(reg[0], reg[r1]);
				break;
			case 0x83:
				// PUSHN R		83 0R
				r1 = (o2 & 0xf);
				for (var j = 1; j <= r1; j++) {
					reg[0] -= 2;
					writeInt(reg[0], reg[j]);
				}
				break;
			}
			break;
		case 0x90:
			switch (o1) {
			case 0x90:
				// JMP adr		90 00 XXXX
				pc = readInt(pc);
				break;
			case 0x91:
				// JNZ adr		91 00 XXXX
				if (zero == 0)
					pc = readInt(pc);
				else
					pc += 2;
				break;
			case 0x92:
				// JZ adr		92 00 XXXX
				if (zero != 0)
					pc = readInt(pc);
				else
					pc += 2;
				break;
			case 0x93:
				// JNP adr		93 00 XXXX
				if (negative == 1)
					pc = readInt(pc);
				else
					pc += 2;
				break;
			case 0x94:
				// JP adr		94 00 XXXX
				if (negative != 1)
					pc = readInt(pc);
				else
					pc += 2;
				break;
			case 0x95:
				// JNC adr		95 00 XXXX
				if (carry != 1)
					pc = readInt(pc);
				else
					pc += 2;
				break;
			case 0x96:
				// JC adr		96 00 XXXX
				if (carry == 1)
					pc = readInt(pc);
				else
					pc += 2;
				break;
			case 0x97:
				// JZR R,adr	97 0R XXXX
				r1 = o2 & 0xf;
				if (reg[r1] == 0)
					pc = readInt(pc);
				else
					pc += 2;
				break;
			case 0x98:
				// JNZR R,adr	98 0R XXXX
				r1 = o2 & 0xf;
				if (reg[r1] != 0)
					pc = readInt(pc);
				else
					pc += 2;
				break;
			case 0x99:
				// CALL adr		99 00 XXXX
				reg[0] -= 2;
				if (reg[0] < 0)
					reg[0] += 0xffff;
				writeInt(reg[0], pc + 2);
				pc = readInt(pc);
				break;
			case 0x9A:
				// RET			9A 00
				if (interrupt == 0) {
					pc = readInt(reg[0]);
					reg[0] += 2;
				} else {
					pc = readInt(reg[0]);
					if (pc == interrupt) {
						reg[0] += 4;
						for (var j = 15; j >= 1; j--) {
							reg[j] = readInt(reg[0]);
							reg[0] += 2;
						}
						byteToFlags(readInt(reg[0]));
						reg[0] += 2;
						interrupt = 0;
						if (interruptBuffer.length > 0)
							setinterrupt(interruptBuffer.pop(), interruptBuffer.pop());
					} else
						reg[0] += 2;
				}
				break;
			}
			break;
		case 0xA0:
			switch (o1) {
			case 0xA0:
				// ADD R,R		A0 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] + reg[r2];
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xA1:
				// ADC R,R		A1 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] + reg[r2] + carry;
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xA2:
				// SUB R,R		A2 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] - reg[r2];
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xA3:
				// SBC R,R		A3 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] - reg[r2] - carry;
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xA4:
				// MUL R,R		A4 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] * reg[r2];
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xA5:
				// DIV R,R		A5 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				if (reg[r1] > 0x7fff)
					reg[r1] -= 0x10000;
				if (reg[r2] > 0x7fff)
					reg[r2] -= 0x10000;
				n = reg[r1] / reg[r2];
				n = setFlags(n);
				reg[r2] = Math.abs(reg[r1] % reg[r2]);
				reg[r1] = n;
				break;
			case 0xA6:
				// AND R,R		A6 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] & reg[r2];
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xA7:
				// OR R,R		A7 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] | reg[r2];
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xA8:
				if (o2 == 0x10) {
					// INC adr		A8 10 XXXX
					r1 = o2 & 0xf;
					n = readInt(readInt(pc)) + 1;
					n = setFlags(n);
					writeInt(readInt(pc), n);
					pc += 2;
				} else if (o2 > 0x10) {
					// INC R,n		A8 nR
					r1 = o2 & 0xf;
					n = reg[r1] + (o2 >> 4);
					n = setFlags(n);
					reg[r1] = n;
				} else {
					// INC R		A8 0R
					r1 = o2 & 0xf;
					n = reg[r1] + 1;
					n = setFlags(n);
					reg[r1] = n;
				}
				break;
			case 0xA9:
				if (o2 == 0x10) {
					// DEC adr		A9 10 XXXX
					r1 = o2 & 0xf;
					n = readInt(readInt(pc)) - 1;
					n = setFlags(n);
					writeInt(readInt(pc), n);
					pc += 2;
				} else if (o2 > 0x10) {
					// DEC R,n		A9 nR
					r1 = o2 & 0xf;
					n = reg[r1] - (o2 >> 4);
					n = setFlags(n);
					reg[r1] = n;
				} else {
					// DEC R		A9 0R
					r1 = o2 & 0xf;
					n = reg[r1] - 1;
					n = setFlags(n);
					reg[r1] = n;
				}
				break;
			case 0xAA:
				// XOR R,R		AA RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] ^ reg[r2];
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xAB:
				// SHL R,R		AB RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] << reg[r2];
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xAC:
				// SHR R,R		AC RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] >> reg[r2];
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xAD:
				r1 = o2 & 0xf;
				r2 = o2 & 0xf0;
				// RAND R,R		AD 0R
				if (r2 == 0x00) {
					n = randomInteger(0, reg[r1]);
					n = setFlags(n);
					reg[r1] = n;
				}
				// SQRT R		AD 1R
				else if (r2 == 0x10) {
					n = Math.floor(Math.sqrt(reg[r1]));
					n = setFlags(n);
					reg[r1] = n;
				}
				break;
			case 0xAE:
				// ANDL R,R		AE RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = (reg[r1] != 0 && reg[r2] != 0) ? 1 : 0;
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xAF:
				// ORL R,R		AF RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = (reg[r1] != 0 || reg[r2] != 0) ? 1 : 0;
				n = setFlags(n);
				reg[r1] = n;
				break;
			}
			break;
		case 0xB0:
			//CMP R,CHR		BR XX
			r1 = (o1 & 0x0f);
			n = reg[r1] - o2;
			n = setFlags(n);
			break;
		case 0xC0:
			switch (o1) {
			case 0xC0:
				//CMP R,INT		C0 R0 XXXX
				r1 = (o2 & 0xf0) >> 4;
				n = reg[r1] - readInt(pc);
				n = setFlags(n);
				pc += 2;
				break;
			case 0xC1:
				//CMP R,R		C1 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = reg[r1] - reg[r2];
				n = setFlags(n);
				break;
			case 0xC2:
				//LDF R,F		C2 RF
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				if (r2 == 0)
					reg[r1] = carry;
				else if (r2 == 1)
					reg[r1] = zero;
				else if (r2 == 2)
					reg[r1] = negative;
				else if (r2 == 3) { //pozitive
					if (negative == 0 && zero == 0)
						reg[r1] = 1;
					else
						reg[r1] = 0;
				} else if (r2 == 4) { //not pozitive
					if (negative == 0 && zero == 0)
						reg[r1] = 0;
					else
						reg[r1] = 1;
				} else if (r2 == 5)
					reg[r1] = 1 - zero;
				else if (r2 == 6) {
					reg[r1] = redraw;
					redraw = 0;
				} else
					reg[r1] = 0;
				break;
			case 0xc3:
				r1 = o2 & 0xf;
				r2 = o2 & 0xf0;
				// ITOF R		C3 0R
				if (r2 == 0x00) {
					reg[r1] = reg[r1] * (1 << MULTIPLY_FP_RESOLUTION_BITS);
				}
				// FTOI R		C3 1R
				else if (r2 == 0x10) {
					reg[r1] = Math.floor(reg[r1] / (1 << MULTIPLY_FP_RESOLUTION_BITS));
				}
				// SIN R		C3 2R
				else if (r2 == 0x20) {
					reg[r1] = Math.floor(Math.sin(reg[r1] / 57) * (1 << MULTIPLY_FP_RESOLUTION_BITS));
				}
				// COS R		C3 3R
				else if (r2 == 0x30) {
					reg[r1] = Math.floor(Math.cos(reg[r1] / 57) * (1 << MULTIPLY_FP_RESOLUTION_BITS));
				}
				break;
			case 0xC4:
				// MULF R,R		C4 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = Math.floor((reg[r1] * reg[r2]) / (1 << MULTIPLY_FP_RESOLUTION_BITS));
				n = setFlags(n);
				reg[r1] = n;
				break;
			case 0xC5:
				// DIVF R,R		C5 RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				n = Math.floor((reg[r1] * (1 << MULTIPLY_FP_RESOLUTION_BITS)) / reg[r2]);
				n = setFlags(n);
				reg[r1] = n;
				break;
			}
			break;
		case 0xD0:
			switch (o1) {
			case 0xD0:
				//CLS		D000
				if ((o2 & 0xff) == 0)
					display.clearScreen(bgcolor);
				else {
					//GSPRXY R,R
					r1 = (o2 & 0xf0) >> 4;
					r2 = o2 & 0xf;
					reg[r1] = getSpriteInXY(reg[r1], reg[r2]);
				}
				break;
			case 0xD1:
				switch (o2 & 0xf0) {
				case 0x00:
					//PUTC R	D10R
					r1 = (o2 & 0xf);
					printc(String.fromCharCode(reg[r1]), color, bgcolor);
					break;
				case 0x10:
					//PUTS R	D11R
					r1 = (o2 & 0xf);
					var i = 0;
					while (!(readMem(reg[r1] + i) == 0 || i > 1000)) {
						printc(String.fromCharCode(readMem(reg[r1] + i)), color, bgcolor);
						i++;
					}
					break;
				case 0x20:
					//PUTN R D12R
					r1 = (o2 & 0xf);
					var s;
					if (reg[r1] < 32768)
						s = reg[r1].toString(10);
					else
						s = (reg[r1] - 0x10000).toString(10);
					for (var i = 0; i < s.length; i++) {
						printc(s[i], color, bgcolor);
					}
					break;
				case 0x30:
					//SETX R			D13R
					r1 = (o2 & 0xf);
					regx = (reg[r1] & 0xff);
					break;
				case 0x40:
					//SETY R			D14R
					r1 = (o2 & 0xf);
					regy = (reg[r1] & 0xff);
					break;
				case 0x50:
					//DRECT R     D15R
					r1 = (o2 & 0xf);
					adr = reg[r1];
					drwRect(readInt(adr + 6), readInt(adr + 4), readInt(adr + 2), readInt(adr));
					break;
				case 0x60:
					//FRECT R     D16R
					r1 = (o2 & 0xf);
					adr = reg[r1];
					fllRect(readInt(adr + 6), readInt(adr + 4), readInt(adr + 2), readInt(adr));
					break;
				case 0x70:
					//DCIRC R     D17R
					r1 = (o2 & 0xf);
					adr = reg[r1];
					drwCirc(readInt(adr + 4), readInt(adr + 2), readInt(adr));
					break;
				case 0x80:
					//FCIRC R     D18R
					r1 = (o2 & 0xf);
					adr = reg[r1];
					fllCirc(readInt(adr + 4), readInt(adr + 2), readInt(adr));
					break;
				case 0x90:
					//DTRIANG R   D19R
					r1 = (o2 & 0xf);
					adr = reg[r1];
					drwTriangle(readInt(adr + 10), readInt(adr + 8), readInt(adr + 6), readInt(adr + 4), readInt(adr + 2), readInt(adr));
					break;
				case 0xA0:
					//FTRIANG R   D1AR
					r1 = (o2 & 0xf);
					adr = reg[r1];
					fllTriangle(readInt(adr + 10), readInt(adr + 8), readInt(adr + 6), readInt(adr + 4), readInt(adr + 2), readInt(adr));
					break;
				case 0xB0:
					//PUTF R   	  D1BR
					r1 = (o2 & 0xf);
					var s,u;
					var tb = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023];
					s = reg[r1];
					if (s < 32768)
						u = (Math.floor(s / (1 << MULTIPLY_FP_RESOLUTION_BITS))).toString(10);
					else{
						s = ((~s) & 0xffff) + 1;
						u = '-' + (Math.floor( s / (1 << MULTIPLY_FP_RESOLUTION_BITS))).toString(10);
					}
					u += '.';
					for (i = 0; i < 3; i++) {
						s = (s & ((1 << MULTIPLY_FP_RESOLUTION_BITS) - 1)) * 10;
						u += (Math.floor(s / (1 << MULTIPLY_FP_RESOLUTION_BITS))).toString(10);
					}
					u = '' + parseFloat(u);
					for (i = 0; i < u.length; i++)
						printc(u[i], color, bgcolor);
					break;
				}
				break;
			case 0xD2:
				switch (o2 & 0xf0) {
				case 0x00:
					// GETK R			D20R
					r1 = (o2 & 0xf);
					display.viewKeyboard(keyPosition);
					if (globalKey & 0xff)
						reg[r1] = globalKey;
					else
						pc -= 2;
					globalKey = 0;
					break;
				case 0x10:
					// GETJ R			D21R
					r1 = (o2 & 0xf);
					reg[r1] = globalJKey;
					break;
				}
				break;
			case 0xD3:
				// PPIX R,R		D3RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				display.plot(color, reg[r1], reg[r2]);
				break;
			case 0xD4:
				switch (o2 & 0xf0) {
				case 0x00:
					// DRWIM R			D40R
					r1 = o2 & 0xf;
					r2 = reg[r1]; //регистр указывает на участок памяти, в котором расположены последовательно h, w, y, x, адрес
					if (imageSize > 1)
						drawImageS(readInt(r2 + 8), readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
					else
						drawImage(readInt(r2 + 8), readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
					break;
				case 0x10:
					// SFCLR R			D41R
					r1 = o2 & 0xf;
					color = reg[r1] & 0xf;
					break;
				case 0x20:
					// SBCLR R			D42R
					r1 = o2 & 0xf;
					bgcolor = reg[r1] & 0xf;
					break;
				case 0x30:
					// GFCLR R			D43R
					r1 = o2 & 0xf;
					reg[r1] = color;
					break;
				case 0x40:
					// GBCLR R			D44R
					r1 = o2 & 0xf;
					reg[r1] = bgcolor;
					break;
				case 0x50:
					// ISIZE			D45R
					r1 = o2 & 0xf;
					imageSize = reg[r1] & 31;
					break;
				case 0x60:
					// DLINE			D46R
					r1 = o2 & 0xf;
					r2 = reg[r1]; //регистр указывает на участок памяти, в котором расположены последовательно y1, x1, y, x
					drwLine(readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
					break;
				case 0x70:
					// DRWRLE R		D47R
					r1 = o2 & 0xf;
					r2 = reg[r1]; //регистр указывает на участок памяти, в котором расположены последовательно h, w, y, x, адрес
					if (imageSize > 1)
						drawImageRLES(readInt(r2 + 8), readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
					else
						drawImageRLE(readInt(r2 + 8), readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
					break;
				case 0x80:
					// LDTILE R		D4 8R
					r1 = o2 & 0xf;
					r2 = reg[r1]; //регистр указывает на участок памяти, в котором расположены последовательно height, width, iheight, iwidth, adr
					loadTile(readInt(r2 + 8), readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
					break;
				case 0x90:
					// SPRSDS R*2	D4 9R
					r1 = o2 & 0xf;
					r2 = reg[r1]; //регистр указывает на участок памяти, в котором расположены последовательно direction, speed, n
					spriteSetDirectionAndSpeed(readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
					break;
				case 0xA0:
					// DRW1BIT R	D4AR
					r1 = o2 & 0xf;
					r2 = reg[r1]; //регистр указывает на участок памяти, в котором расположены последовательно h, w, y, x, адрес
					if (imageSize > 1)
						drawImage1bitS(readInt(r2 + 8), readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
					else
						drawImage1bit(readInt(r2 + 8), readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
					break;
				}
				break;
			case 0xD5:
				// LDSPRT R,R		D5RR
				r1 = (o2 & 0xf0) >> 4; //номер спрайта
				r2 = o2 & 0xf; //адрес спрайта
				setSprite(reg[r1] & 0x1f, reg[r2]);
				break;
			case 0xD6:
				// SPALET R,R		D6 RR
				r1 = (o2 & 0xf0) >> 4; //номер цвета
				r2 = o2 & 0xf; //новый цвет
				display.changePalette(reg[r1], reg[r2]);
				break;
			case 0xD7:
				r1 = o2 & 0xf;
				r2 = reg[r1];
				if ((o2 & 0xf0) == 0)
					// SPART R 		D7 0R
					//регистр указывает на участок памяти, в котором расположены последовательно count, time, gravity
					setParticle(readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
				else if ((o2 & 0xf0) == 0x10)
					//регистр указывает на участок памяти, в котором расположены последовательно speed, direction2, direction1, time
					setEmitter(readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
				else if ((o2 & 0xf0) == 0x20)
					//регистр указывает на участок памяти, в котором расположены последовательно color, y, x
					drawParticle(readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
				else if ((o2 & 0xf0) == 0x50)
					//регистр указывает на участок памяти, в котором расположены последовательно color, y, x
					reg[1] = distancepp(readInt(r2 + 6), readInt(r2 + 4), readInt(r2 + 2), readInt(r2));
				break;
			case 0xD8:
				// SCROLL R,R		D8RR
				r1 = (o2 & 0xf0) >> 4; //шаг, доделать
				r2 = o2 & 0xf; //направление
				scrollScreen(1, reg[r2]);
				if (reg[r2] == 0 || reg[r2] == 2)
					scrollScreen(1, reg[r2]);
				break;
			case 0xD9:
				// GETPIX R,R		D9RR
				r1 = (o2 & 0xf0) >> 4; //x
				r2 = o2 & 0xf; //y
				reg[r1] = display.getPixel(reg[r1], reg[r2]);
				break;
			case 0xDA:
				// DRTILE R		DA RR
				r1 = (o2 & 0xf0) >> 4; //x
				r2 = o2 & 0xf; //y
				drawTile(reg[r1], reg[r2]);
				break;
			case 0xDB:
				// SPRSPX R,R		DB RR
				r1 = (o2 & 0xf0) >> 4; //num
				r2 = o2 & 0xf; //speed y

				break;
			case 0xDC:
				// SPRGET R,R		DC RR
				r1 = (o2 & 0xf0) >> 4; //num
				r2 = o2 & 0xf; //type
				if (reg[r2] == 0)
					reg[r1] = Math.floor(_spr[reg[r1] & 31].x >> 2);
				else if (reg[r2] == 1)
					reg[r1] = Math.floor(_spr[reg[r1] & 31].y >> 2);
				else if (reg[r2] == 2)
					reg[r1] = _spr[reg[r1] & 31].speedx;
				else if (reg[r2] == 3)
					reg[r1] = _spr[reg[r1] & 31].speedy;
				else if (reg[r2] == 4)
					reg[r1] = _spr[reg[r1] & 31].width;
				else if (reg[r2] == 5)
					reg[r1] = _spr[reg[r1] & 31].height;
				else if (reg[r2] == 6)
					reg[r1] = _spr[reg[r1] & 31].angle;
				else if (reg[r2] == 7)
					reg[r1] = _spr[reg[r1] & 31].lives;
				else if (reg[r2] == 8)
					reg[r1] = _spr[reg[r1] & 31].collision;
				else if (reg[r2] == 9)
					reg[r1] = _spr[reg[r1] & 31].solid;
				else if (reg[r2] == 10)
					reg[r1] = _spr[reg[r1] & 31].gravity;
				break;
			case 0xDE:
				// AGBSPR R,R			DE RR
				r1 = (o2 & 0xf0) >> 4; //n1
				r2 = o2 & 0xf; //n2
				reg[r1] = angleBetweenSprites(reg[r1], reg[r2]);
				break;
			case 0xDF:
				// GTILEXY R,R			DF RR
				r1 = (o2 & 0xf0) >> 4;
				r2 = o2 & 0xf;
				reg[r1] = getTileInXY(reg[r1], reg[r2]);
				break;
			}
			break;
		case 0xE0:
			// DRSPRT R,R,R	ERRR
			r1 = (o1 & 0xf); //номер спрайта
			r2 = (o2 & 0xf0) >> 4; //x
			r3 = o2 & 0xf; //y
			drawSprite(reg[r1] & 0x1f, reg[r2], reg[r3]);
			if (_spr[reg[r1] & 31].lives < 1)
				_spr[reg[r1] & 31].lives = 1;
			break;
		case 0xF0:
			// SSPRTV R,R,R	FR RR
			r1 = (o1 & 0xf); //номер спрайта
			r2 = (o2 & 0xf0) >> 4; //type
			r3 = o2 & 0xf; //value
			if (reg[r2] == 0) {
				if (reg[r3] > 0x7fff)
					_spr[reg[r1] & 31].x = (reg[r3] - 0x10000) << 2;
				else
					_spr[reg[r1] & 31].x = reg[r3] << 2;
			} else if (reg[r2] == 1) {
				if (reg[r3] > 0x7fff)
					_spr[reg[r1] & 31].y = (reg[r3] - 0x10000) << 2;
				else
					_spr[reg[r1] & 31].y = reg[r3] << 2;
			} else if (reg[r2] == 2) {
				if (reg[r3] > 128)
					_spr[reg[r1] & 31].speedx =  - (256 - (reg[r3] & 0xff));
				else
					_spr[reg[r1] & 31].speedx = reg[r3];
			} else if (reg[r2] == 3) {
				if (reg[r3] > 128)
					_spr[reg[r1] & 31].speedy =  - (256 - (reg[r3] & 0xff));
				else
					_spr[reg[r1] & 31].speedy = reg[r3];
			} else if (reg[r2] == 4)
				_spr[reg[r1] & 31].width = reg[r3];
			else if (reg[r2] == 5)
				_spr[reg[r1] & 31].height = reg[r3];
			else if (reg[r2] == 6)
				if (reg[r3] > 0x7fff)
					_spr[reg[r1] & 31].angle = (reg[r3] - 0x10000) % 360;
				else
					_spr[reg[r1] & 31].angle = reg[r3] % 360;
			else if (reg[r2] == 7) {
				if (reg[r3] > 128)
					_spr[reg[r1] & 31].lives =  - (256 - (reg[r3] & 0xff));
				else
					_spr[reg[r1] & 31].lives = reg[r3];
			} else if (reg[r2] == 9)
				_spr[reg[r1] & 31].solid = reg[r3];
			else if (reg[r2] == 10)
				_spr[reg[r1] & 31].gravity = reg[r3];
			else if (reg[r2] == 11)
				_spr[reg[r1] & 31].oncollision = reg[r3];
			else if (reg[r2] == 12)
				_spr[reg[r1] & 31].onexitscreen = reg[r3];
			else if (reg[r2] == 13)
				_spr[reg[r1] & 31].isscrolled = reg[r3];
			else if (reg[r2] == 14)
				_spr[reg[r1] & 31].isonebit = reg[r3];
			else if (reg[r2] == 15)
				_spr[reg[r1] & 31].fliphorisontal = reg[r3];
			break;
		}
	}

	function clearStringFast(str) {
		return str.length < 12 ? str : (' ' + str).slice(1);
	}

	function debug() {
		var d = '';
		var s = 'pc:' + toHex4(pc) + '\t';
		s += 'op:' + toHex4((mem[pc] << 8) + mem[pc + 1]) + '\n';
		s += 'C' + carry + 'Z' + zero + 'N' + negative + '\n';
		for (var i = 0; i < 16; i++)
			s += 'R' + i + ':' + toHex4(reg[i]) + ' (' + reg[i] + ')\n';
		for (var i = 0; i < debugVar.length; i++) {
			d += debugVar[i].variable + '\t';
			d += toHex4(debugVar[i].adress) + '   ';
			d += readInt(debugVar[i].adress) + '\n';
		}
		d = clearStringFast(d);
		debugVarArea.value = d;
		viewMemory();
		for (var i = 0; i < numberDebugString.length; i++)
			if (numberDebugString[i][2] == pc) {
				thisDebugString = numberDebugString[i][1];
			}
		d = '';
		for (var i = 0; i < 32; i++) {
			d += '\nsprite ' + i + '\n';
			d += 'S_ADDRESS \t' + toHex4(_spr[i].address) + '\n';
			d += 'S_X \t' + _spr[i].x / 4 + '\n';
			d += 'S_Y \t' + _spr[i].y / 4 + '\n';
			d += 'S_SPEEDX \t' + _spr[i].speedx + '\n';
			d += 'S_SPEEDY \t' + _spr[i].speedy + '\n';
			d += 'S_WIDTH \t' + _spr[i].width + '\n';
			d += 'S_HEIGHT \t' + _spr[i].height + '\n';
			d += 'S_ANGLE \t' + _spr[i].angle + '\n';
			d += 'S_LIVES \t' + _spr[i].lives + '\n';
		}
		d = clearStringFast(d);
		debugSprArea.value = d;
		lineCount();
		return s;
	}

	return {
		init: init,
		load: load,
		step: step,
		debug: debug,
		readMem: readMem,
		setRedraw: setRedraw,
		redrawSprite: redrawSprite,
		redrawParticle: redrawParticle,
		testSpriteCollision: testSpriteCollision
	};
}

var cpu = new Cpu;
cpu.init();
