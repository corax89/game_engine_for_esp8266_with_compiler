"use strict";
var sourceArea = document.getElementById('input');
var memoryArea = document.getElementById('ram');
var alertArea =  document.getElementById("alert");
var debugArea =  document.getElementById("debug");
var debugVarArea =  document.getElementById("debugVariable");
var debugSprArea =  document.getElementById("debugSprite");
var memoryPage = 0;			//указывает на одну из 255 страниц памяти по 255 байт для отображения
var cpuSpeed = 1600;			//количество операций, выполняемых процессором за 16 миллисекунд
var cpuLostCycle = 0;		//сколько циклов должно быть потеряно из-за операций рисования
var timerId;				//таймер для вызова выполнения процессора
var asmSource;				//код, полученный при компиляции
var debugVar = [];			//таблица данных о именах и расположении в памяти переменных
var numberDebugString = []; //таблица, указывающая соответствие строк кода исполняемым инструкциям
var numberLine = 0;			//количество линий исходного кода
var thisDebugString = 0;	//строка, которая в данный момент выполняется процессором
var globalJKey = 0;			//массив кнопок геймпада
var globalKey = 0;			//текущая нажатая на клавиатуре кнопка
var obj_wind;				//переменные, используемые для перемещения окон
var obj_drag_wind;
var delta_x = 0;
var delta_y = 0;
var file = '';
var isDebug = false;
var tickCount = 0;
var isRedraw = true;
var language = 'eng';

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
setup_mouse("div_wind1", "drag_wind1");
input.onclick = input.onkeydown = input.onkeyup = input.onkeypress = input.oncut = input.onpaste = inputOnKey;

(function () {
    var url = window.location.href.toString();
    if(url.indexOf('?src=') > -1){
        input.value = 'loading data from gist, please wait';
        var src = url.split('?src=');
        fetch('https://api.github.com/gists/' + src[1])
          .then(function(results) {
            return results.json();
           })
          .then(function(data) {
            var file = '';
                    for (var i in data.files) {
                        file = data.files[i].content;
                        break;
                    }
                    input.value = file;
					setTimeout(lineCount, 300);
          });
    }
})();

function setup_mouse(id_div_wind, id_div_drag) {
	if(obj_wind)
		obj_wind.style.zIndex = '0';
	obj_wind = document.getElementById(id_div_wind);
	obj_wind.style.zIndex = '1';
	obj_drag_wind = document.getElementById(id_div_drag);
	obj_drag_wind.onmousedown = save_delta_koor;
	document.onmouseup = clear_delta_koor;
}

function save_delta_koor(obj_evt) {
	var x,y;
	if (obj_evt) {
		x = obj_evt.pageX;
		y = obj_evt.pageY;
	} else {
		x = window.event.clientX;
		y = window.event.clientY;

	}
	delta_x = obj_wind.offsetLeft - x;
	delta_y = obj_wind.offsetTop - y;
	document.onmousemove = motion_wind;
}

function clear_delta_koor() {
	document.onmousemove = null;
}

function motion_wind(obj_event) {
	var x,y;
	if (obj_event) {
		x = obj_event.pageX;
		y = obj_event.pageY;
	} else {
		x = window.event.clientX;
		y = window.event.clientY;
	}
	obj_wind.style.top = (delta_y + y) + "px";
	obj_wind.style.left = (delta_x + x) + "px";
	window.getSelection().removeAllRanges();
}

function viewDebug(id) {
  var i;
  var x = document.getElementsByClassName("debug");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none"; 
  }
  document.getElementById(id).style.display = "block"; 
}

function keyDownHandler(e) {
	/*
	Bit[0] – Up (Вверх)
	Bit[1] — Down (Вниз)
	Bit[2] — Left (Влево)
	Bit[3] — Right (Вправо)
	Bit[4] — Select (Выбор)
	Bit[5] — Start (Старт)
	Bit[6] — A
	Bit[7] — B
	*/
	switch(e.keyCode){
		case 38: 
		case 87:
			globalJKey |= 1;
			break;
		case 40:
		case 83:
			globalJKey |= 2;
			break;
		case 37:
		case 65:
			globalJKey |= 4;
			break;
		case 39:
		case 68:
			globalJKey |= 8;
			break;
		case 32: //B - space
			globalJKey |= 32;
			break;
		case 90: //A - Z
			globalJKey |= 16;
			break;
	}
	//globalKey = e.keyCode;
}

function keyUpHandler(e) {
	switch(e.keyCode){
		case 38: 
		case 87:
			globalJKey &= ~1;
			break;
		case 40:
		case 83:
			globalJKey &= ~2;
			break;
		case 37:
		case 65:
			globalJKey &= ~4;
			break;
		case 39:
		case 68:
			globalJKey &= ~8;
			break;
		case 32: //B - space
			globalJKey &= ~32;
			break;
		case 90: //A - Z
			globalJKey &= ~16;
			break;
	}
}

function highliteasm(code){
	//подсветка от etcdema
	var comments	= [];	// Тут собираем все каменты
	var strings		= [];	// Тут собираем все строки
	var res			= [];	// Тут собираем все RegExp
	var all			= { 'C': comments, 'S': strings, 'R': res };
	var safe		= { '<': '<', '>': '>', '&': '&' };

	return code
	// Убираем каменты
		.replace(/([^;]);[^\n]*/g, function(m, f)
			{ var l=comments.length; comments.push(m); return f+'~~~C'+l+'~~~'; })
	// Убираем строки
		.replace(/([^\\])((?:'(?:\\'|[^'])*')|(?:"(?:\\"|[^"])*"))/g, function(m, f, s)
			{ var l=strings.length; strings.push(s); return f+'~~~S'+l+'~~~'; })
	// Выделяем ключевые слова
		.replace(/(mov|ldi|ldial|ldc|sti|stial|stc|pop|popn|push|pushn|jmp|jz|jnz|jc|jnc|call|ret|add|and|sub|mul|div|cmp|inc|dec|ldf|hlt)([^a-z0-9\$_])/gi,
			'<span class="kwrd">$1</span>$2')
	// Выделяем скобки
		.replace(/(\(|\))/gi,
			'<span class="gly">$1</span>')
	// Возвращаем на место каменты, строки
		.replace(/~~~([CSR])(\d+)~~~/g, function(m, t, i)
			{ return '<span class="'+t+'">'+all[t][i]+'</span>'; })
	// Выставляем переводы строк
		.replace(/\n/g,'<br/>')
}

function highlitec(){
	//подсветка от etcdema
	var code = document.getElementById("help_hl").innerHTML;
	var comments	= [];	// Тут собираем все каменты
	var strings		= [];	// Тут собираем все строки
	var res			= [];	// Тут собираем все RegExp
	var all			= { 'C': comments, 'S': strings, 'R': res };
	var safe		= { '<': '<', '>': '>', '&': '&' };

	document.getElementById("help_hl").innerHTML = code
	// Убираем каменты
		.replace(/([^\/])\/\/[^\n]*/g, function(m, f)
			{ var l=comments.length; comments.push(m); return f+'~~~C'+l+'~~~'; })
	// Убираем строки
		.replace(/()(\/\*[\S\s]*?\*\/)/g, function(m, f, s)
			{ var l=strings.length; strings.push(s); return f+'~~~S'+l+'~~~'; })
	// Выделяем ключевые слова
		.replace(/(int|char|void)([^a-z0-9\$_])/gi,
			'<span class="kwrd">$1</span>$2')
	// Выделяем скобки
		.replace(/(\(|\))/gi,
			'<span class="gly">$1</span>')
	// Возвращаем на место каменты, строки
		.replace(/~~~([CSR])(\d+)~~~/g, function(m, t, i)
			{ return '<span class="'+t+'">'+all[t][i]+'</span>'; })
	// Выставляем переводы строк
		.replace(/\n/g,'<br/>')
		.replace(/\t/g, '');
}

highlitec();

//компиляция ассемблерного кода из поля ввода
function onlyAsm(){
	var s = document.getElementById('input').value;
	var n = s.split('\n').length;
	numberDebugString = [];
	for(var i = 0; i < n; i++)
		numberDebugString.push([i, i, 0]);
	file = asm(s);
	document.getElementById('ram').value = toHexA(file);
}
//компиляция си кода из поля ввода
function main(){
	document.getElementById("alert").innerHTML = '';
	var src = document.getElementById('input').value;
	var t = tokenize(src);
	console.log(t);
	var c = compile(t);
	asmSource = '\n' + c.join('\n') + '\n';
	file = asm(asmSource);
	document.getElementById('disasm').innerHTML = highliteasm(asmSource);
	document.getElementById('ram').value = toHexA(file);
}
//вывод информации о ходе сборки
function info(s){
	var out = document.getElementById("alert");
	out.innerHTML += '<b>' + s + '</b><br>';
}

function lineCount(){
	var i=0,pos=0,countStr='',l=0,m=0;
	var txt = sourceArea.value;
	for(var j = 0; j < txt.length; j++){
		l++;
		if(txt[j] == '\n'){
			m = Math.max(m, l);
			l = 0;
			countStr += i + '<br>';
			i++;
			numberLine = i;
		}
	}
	m = Math.max(m, l);
	countStr+=i+'<br>';
	if(i < 10)
		i = 10;
	if(m < 10)
		m = 10;
	i += 5;
	document.getElementById('line-count').innerHTML=countStr;
	sourceArea.style.height=i*1.15+'em';
	sourceArea.style.width=m*1+'em';
	document.getElementById('line-count').style.height=i*1.15+'em';
	sourceArea.focus();
}
//подсветка текущей строки, выполняемой процессором
function highliteLine(){
	var countStr = '';
	for(var i = 0; i <= numberLine; i++){
		if(i == thisDebugString)
			countStr += '<div class="execLine">' + i + '</div>';
		else
			countStr += i + '<br>';
	}
	document.getElementById('line-count').innerHTML=countStr;
}

function inputOnKey(e){
	if (e.keyCode === 9) { // была нажата клавиша TAB
		if(e.type == 'keyup')
			return false;
		// получим позицию каретки
		var val = this.value,
			start = this.selectionStart,
			end = this.selectionEnd;
		// установим значение textarea в: текст до каретки + tab + текст после каретки
		var txt = val.substring(start, end);
		if(e.shiftKey){
			txt = txt.replace(/\n\s/g, '\n');
			if(txt[0] == '\t' || txt[0] == ' ')
				txt = txt.substring(1);
			this.value = val.substring(0, start) + txt + val.substring(end);
			this.selectionStart = start;
			this.selectionEnd = start + txt.length;
		}
		else{
			if(txt.length == 0){
				this.value = val.substring(0, start) + '\t' + val.substring(end);
				// переместим каретку
				this.selectionStart = start + 1;
				this.selectionEnd = start + 1;
			}
			else{
				txt = txt.replace(/[\n]/g, '\n\t');
				this.value = val.substring(0, start) + '\t' + txt + val.substring(end);
				this.selectionStart = start;
				this.selectionEnd = start + txt.length + 1;
			}
			
		}
		setTimeout(lineCount, 300);
		// предотвратим потерю фокуса
		return false;
	}
	else if (e.keyCode === 13){
		if(e.type == 'keyup')
			return false;
		// получим позицию каретки
		var val = this.value,
			start = this.selectionStart,
			end = this.selectionEnd;
		var spc = 0;
		var tb = 0;
		this.value = val.substring(0, start) + '\n' + val.substring(end);
		if(end < val.length && val[end] == '\t')
			end++;
		for(var i = start; i >= 0; i--){
			if(val[i] == '\n'){
				if(spc > 0 || tb > 0)
					break;
			}
			else if(val[i] == '\t')
				tb++;
			else if(val[i] == ' ')
				spc++;
			else if(val[i] == '{'){
				tb++;
			}
			spc++;
		}
		var txt = '';
		for(var i = 0; i < tb; i++)
			txt += '\t';
		// переместим каретку
		this.value = val.substring(0, start) + '\n' + txt + val.substring(end);
		this.selectionStart = start + txt.length + 1;
		this.selectionEnd = start + txt.length + 1;
		setTimeout(lineCount, 300);
		return false;
	}
	else if (e.keyCode === 125){
		if(e.type == 'keyup')
			return false;
		// получим позицию каретки
		var val = this.value,
			start = this.selectionStart,
			end = this.selectionEnd;
		if(start > 0 && val[start - 1] == '\t')
			start--;
		this.value = val.substring(0, start) + '}' + val.substring(end);
		this.selectionStart = start + 1;
		this.selectionEnd = start  + 1;
		setTimeout(lineCount, 300);
		return false;
	}
	setTimeout(lineCount, 300);
}

function listing(){
	var d = document.getElementById("div_wind1");
	d.value = asmSource;
	d.style.display = "block";
	d.style.left = "1em";
	d.style.top = "3em";
	var d = document.getElementById("disasm");
	d.value = asmSource;
}

function debugVars(){
	var d = document.getElementById("div_wind3");
	d.style.display = "block";
	d.style.left = window.innerWidth/4*2 + 'px';
	d.style.top = "3em";
	isDebug = true;
}

function viewHelp(){
	var d = document.getElementById("div_wind4");
	d.style.display = "block";
	d.style.left = window.innerWidth/4*3 + 'px';
	d.style.top = "3em";
}

function closewindow(id){
	var d = document.getElementById(id);
	if(id == "div_wind3")
		isDebug = false;
	d.style.display = "none";
}

var bpalette = [
  "#000000", "#EDE3C7", "#BE3746", "#7FB8B5",
  "#4A3E4F", "#6EA76C", "#273F68", "#DEBB59",
  "#B48D6C", "#42595A", "#C0624D", "#333333",
  "#777777", "#8FAB62", "#3ABFD1", "#bbbbbb"
];

var palette = [];
var sprtpalette = [];

function viewMemory(){
	var s = '     0 1 2 3 4 5 6 7 8 9 A B C D E F';
	for(var i = 0; i < 256; i++){
		if(i % 16 == 0)
			s += '\n' + toHex2(memoryPage) + toHex2(Math.floor(i)) + ':';
		s += toHex2(cpu.readMem(memoryPage * 256 + i)) + '';
	}
	document.getElementById('areaMemoryPrewiew').value = s;
}

function setMemoryPage(n){
	if(n == 'p')
		memoryPage ++;
	else if(n == 'm')
		memoryPage --;
	else if(!isNaN(parseInt(n,16)))
		memoryPage = parseInt(n, 16);
	if(memoryPage > 255)
		memoryPage = 255;
	if(memoryPage < 0)
		memoryPage = 0;
	document.getElementById('memoryPage').value = toHex2(memoryPage);
	viewMemory();
}

function run(){
	//уменьшаем значение таймеров
	for(var i = 0; i < 8; i++){
		timers[i] -= 16;
		if(timers[i] <= 0)
			timers[i] = 0;
	}
	//обрабатываем команды процессора
	for(var i=0;i<cpuSpeed;i++){
		cpu.step();
		i += cpuLostCycle;
		cpuLostCycle = 0;
	}
	//обработка спрайтов
	if(isRedraw){
		display.clearSprite();
		cpu.redrawSprite();
		cpu.testSpriteCollision(isDebug);
		isRedraw = false;
		//выводим отладочную информацию
		document.getElementById('debug').value = cpu.debug();
	}
	clearTimeout(timerId);
	timerId = setTimeout(function() { run() }, 16);
}
//функция вывода на экран
function Display() {
    var displayArray = [];
	var spriteArray = [];
	var canvasArray = [];
	var canvasArray2 = [];
    var ctx;
    var width;
    var height;
    var pixelSize = 2;
	var canvas = document.getElementById("screen");
	var isDebug = false;
	var isDrawKeyboard = false;
	var isChangePalette = false;
	var keyboardPos = 0;
	var keyboardImage = [
		0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x31,0x17,0x9c,0x7d,0x12,0x21,0xe,0x71,0xc7,0xc,
		0x60,0x84,0x0,0x79,0xe7,0x84,0x49,0x14,0x12,0x10,0xa2,0x20,0x11,0x49,0x1,0x8,0x21,0x2,0x1f,0x9,0x24,0x88,0x49,0x17,
		0x1c,0x10,0x42,0x21,0x11,0x71,0x1,0x10,0x11,0x2,0x0,0x11,0xe7,0x9f,0x49,0x54,0x18,0x10,0x42,0x21,0x11,0x41,0x1,0x8,
		0x21,0x2,0x1f,0x21,0x20,0x88,0x51,0x54,0x14,0x10,0x42,0x21,0x11,0x41,0x1,0x8,0x21,0x2,0x0,0x21,0x20,0x84,0x28,0xa7,
		0x92,0x10,0x41,0xc1,0xe,0x41,0xc7,0xc,0x60,0x84,0x0,0x21,0xe7,0x80,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,
		0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x30,0xe7,0x1e,0x39,0x20,0x84,0x90,
		0x41,0x5,0x1,0x28,0x43,0x9e,0x49,0xe7,0x85,0x49,0x4,0x90,0x45,0x20,0x85,0x10,0x0,0x5,0x2,0x7c,0xf4,0x52,0x49,0x4,0x9,
		0x78,0x84,0x9c,0x41,0xe0,0x86,0x10,0x0,0x0,0x4,0x29,0x45,0xd2,0x79,0xe7,0x9f,0x48,0x44,0x90,0x4d,0x20,0x85,0x10,0x41,
		0x0,0x8,0x28,0xe5,0x92,0x8,0x24,0x88,0x48,0x24,0x90,0x45,0x22,0x84,0x90,0x1,0x0,0x10,0x7c,0x54,0x12,0x8,0x24,0x84,0x49,
		0xc7,0x10,0x39,0x21,0x4,0x9e,0x0,0x0,0x0,0x29,0xe3,0xde,0x9,0xe7,0x80,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,
		0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x79,0x13,0x11,0x79,0x22,0x21,0x10,0x70,
		0x0,0x10,0x60,0x44,0x40,0x11,0xe7,0x80,0x8,0xa4,0x91,0x45,0xa3,0x62,0x8,0x10,0x0,0x10,0x64,0x42,0x80,0x30,0x20,0x80,0x10,
		0x44,0xa,0x79,0x62,0xa4,0x4,0x70,0x0,0x10,0x9,0xf1,0x1f,0x11,0xe7,0x9b,0x20,0x44,0xa,0x45,0x22,0x22,0x8,0x40,0x0,0x10,
		0x10,0x42,0x80,0x11,0x0,0x91,0x40,0xa4,0x84,0x45,0x22,0x21,0x10,0x0,0x4,0x0,0x2c,0x44,0x40,0x11,0x0,0x9b,0x79,0x13,0x4,
		0x79,0x22,0x20,0x0,0x41,0x4,0x10,0x4c,0x0,0x0,0x39,0xe7,0x80,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0
	];

    function init() {
		width = canvas.getBoundingClientRect().width;
		height = canvas.getBoundingClientRect().height;
		ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;
		reset();
		canvas.addEventListener('mousemove', function (e) {
			position(e);
		});
    }
	
	function position(e){
		var rect = canvas.getBoundingClientRect();
		var	x = Math.floor((e.offsetX==undefined?e.layerX:e.offsetX)/(rect.width/128));
		var y = Math.floor((e.offsetY==undefined?e.layerY:e.offsetY)/(rect.height/160)) - 16;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, pixelSize * 128, pixelSize * 16);
		ctx.fillStyle = "white";
		ctx.fillText("x " + x + "; y " + y , 1, 1);
	}

    function reset() {
		ctx.textAlign="start";
		ctx.textBaseline="hanging";
		ctx.font=pixelSize*8+"px monospace";
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, width+20, height+20);
		for(var i = 0; i < 20480; i++){
			displayArray[i] = 0;
			canvasArray[i] = 0;
			canvasArray2[i] = 0;
		}
		cpuLostCycle += 2000;
		ctx.fillStyle = "black";
		ctx.fillRect(0, (128 + 16) * pixelSize , pixelSize * 128, pixelSize * 16);
		ctx.fillStyle = "white";
		ctx.fillText("KEY_A - space, KEY_B - z", 1, (128 + 17) * pixelSize);
		for(var i = 0; i < 16; i++){
			palette[i] = bpalette[i];
			sprtpalette[i] = bpalette[i];
		}
    }
	
	function clearScreen(color){
		if (color === undefined || color === null)
			color = 0;
		for(var i = 0; i < 20480; i++){
			displayArray[i] = color;
			canvasArray[i] = color;
		}
	}
	
	function clearSprite(){
		for(var i = 0; i < 20480; i++){
			spriteArray[i] = 0;
		}
	}

	function char(chr, x, y, color, bgcolor){
		var c = chr.charCodeAt(0);
		for(var i=0; i<5; i++ ) { // Char bitmap = 5 columns
			var line = font[c * 5 + i];
			for(var j=0; j<8; j++, line >>= 1) {
				if(line & 1)
					drawPixel(color, x+i, y+j);
				else
					drawPixel(bgcolor, x+i, y+j);
			}
		}
    }
	
	function drawTestRect(x,y,w,h,c){
		if(c == 0)
			ctx.strokeStyle = "pink";
		else
			ctx.strokeStyle = "red";
		ctx.beginPath();
		ctx.rect(x * pixelSize, (y + 16) * pixelSize, w * pixelSize, h * pixelSize);
		ctx.stroke();
		isDebug = true;
	}
	
	function updatePixel(x,y) {
		canvasArray[x * 128 + y] = displayArray[x * 128 + y];
		
    }
	
	function drawPixel(color, x, y) {
		cpuLostCycle += 1;
		if(x >= 0 && x < 128 && y >= 0 && y < 128)
			canvasArray[x * 128 + y] = color;
    }
	
	function drawSpritePixel(color, x, y) {
		if(x >= 0 && x < 128 && y >= 0 && y < 128)
			spriteArray[x * 128 + y] = color;
    }
	
	function plot(color, x, y) {
		if(x >= 0 && x < 128 && y >= 0 && y < 128){
			drawPixel(color, x, y);
			displayArray[x * 128 + y] = color & 0x0f;
		}
    }
	
	function largeplot(color, x, y, s) {
		var x1,y1;
		for(x1 = 0; x1 < s; x1++)
			for(y1 = 0; y1 < s; y1++){
				drawPixel(color, x + x1, y + y1);
				displayArray[(x + x1) * 128 + y + y1] = color & 0x0f;
			}
    }
	
	function getPixel(x, y){
		return displayArray[x * 128 + y];
	}
	
	function viewKeyboard(pos){
		isDrawKeyboard = true;
		keyboardPos = pos;
	}
	
	function drawKeyboard(){
		var i = 0;
		var bit;
		var adr = 0;
		var px = keyboardPos % 21;
		var py = Math.floor(keyboardPos / 21);
		for(var y = 0; y < 24; y++)
			for(var x = 0; x < 128; x++){
				if(i % 8 == 0){
					bit = keyboardImage[adr];
					adr++;
				}
				if(bit & 0x80)
					drawSpritePixel(11, x, 104 + y);
				else{
					if(Math.floor(y / 8) == py && Math.floor(x / 6) == px)
						drawSpritePixel(10, x, 104 + y);
					else
						drawSpritePixel(1, x, 104 + y);
				}
				bit = bit << 1;
				i++;
			}
	}
	
	function redraw(){
		var color, x, y;
		if(isDrawKeyboard){
			drawKeyboard();
			isDrawKeyboard = 0;
		}
		for(x = 0; x < 128; x++)
			for(y = 0; y < 128; y++){
				if(spriteArray[x * 128 + y] > 0){
					color = spriteArray[x * 128 + y];
					canvasArray2[x * 128 + y] = color;
					ctx.fillStyle = sprtpalette[color & 0x0f];
					ctx.fillRect(x * pixelSize, (y + 16) * pixelSize, pixelSize, pixelSize);
				}
				else if(canvasArray[x * 128 + y] != canvasArray2[x * 128 + y] || isDebug || isChangePalette){
					canvasArray2[x * 128 + y] = canvasArray[x * 128 + y];
					color = canvasArray[x * 128 + y];
					ctx.fillStyle = palette[color & 0x0f];
					ctx.fillRect(x * pixelSize, (y + 16) * pixelSize, pixelSize, pixelSize);
				}
			}
		isDebug = false;
		isChangePalette = false;
	}
	
	function rgbToHex(rgb) { 
	  var hex = Number(rgb).toString(16);
	  if (hex.length < 2) {
		   hex = "0" + hex;
	  }
	  return hex;
	}
	
	function fullColorHex(r,g,b) {   
	  var red = rgbToHex(r);
	  var green = rgbToHex(g);
	  var blue = rgbToHex(b);
	  return '#' + red + green + blue;
	}
	
	function changePalette(n, color){
		var r = ((((color >> 11) & 0x1F) * 527) + 23) >> 6;
		var g = ((((color >> 5) & 0x3F) * 259) + 33) >> 6;
		var b = (((color & 0x1F) * 527) + 23) >> 6;
		isChangePalette = true;
		if(n < 16)
			palette[n] = fullColorHex(r, g, b);
		else if(n < 32)
			sprtpalette[n - 16] = fullColorHex(r, g, b);
	}

    return {
      init: init,
      reset: reset,
	  clearScreen:clearScreen,
	  char:char,
	  updatePixel: updatePixel,
	  drawPixel: drawPixel,
	  drawSpritePixel:drawSpritePixel,
	  plot:plot,
	  largeplot:largeplot,
	  getPixel:getPixel,
	  viewKeyboard:viewKeyboard,
	  redraw:redraw,
	  changePalette:changePalette,
	  clearSprite:clearSprite,
	  drawTestRect:drawTestRect
    };
}

function redraw() {
    setTimeout(function() {
        requestAnimationFrame(redraw);
		cpu.redrawParticle();
		display.redraw();
		cpu.setRedraw();
		isRedraw = true;
    }, 48);
}

function savebin(){
	var newByteArr=[];
	if(file.length>1){
		for(var i=0;i<file.length;i++){
			newByteArr.push(file[i] & 0xFF);
		}
		var newFile=new Uint8Array(newByteArr);
		var blob = new Blob([newFile], {type: "charset=iso-8859-1"});
		saveAs(blob, "rom.bin");
	}
}

var display = new Display();
display.init();
var spriteEditor = new SpriteEditor();
spriteEditor.init();
lineCount();
redraw();
