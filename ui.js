"use strict";
var sourceArea = document.getElementById('input');
var memoryArea = document.getElementById('ram');
var alertArea = document.getElementById("alert");
var debugArea = document.getElementById("debug");
var debugVarArea = document.getElementById("debugVariable");
var debugSprArea = document.getElementById("debugSprite");
var memoryPage = 0; //указывает на одну из 255 страниц памяти по 255 байт для отображения
var cpuSpeed = 8000; //количество операций, выполняемых процессором за 16 миллисекунд
var cpuLostCycle = 0; //сколько циклов должно быть потеряно из-за операций рисования
var timerId; //таймер для вызова выполнения процессора
var asmSource; //код, полученный при компиляции
var debugVar = []; //таблица данных о именах и расположении в памяти переменных
var numberDebugString = []; //таблица, указывающая соответствие строк кода исполняемым инструкциям
var numberLine = 0; //количество линий исходного кода
var thisDebugString = 0; //строка, которая в данный момент выполняется процессором
var globalJKey = 0; //массив кнопок геймпада
var globalKey = 0; //текущая нажатая на клавиатуре кнопка
var obj_wind; //переменные, используемые для перемещения окон
var soundTimer = 100; //время проигрывания ноты
var obj_drag_wind;
var delta_x = 0;
var delta_y = 0;
var file = '';
var isDebug = false;
var debugCallCount = 0;
var tickCount = 0;
var isRedraw = true;
var language = 'eng';
var fileType = 'html';
var fileName = '';
var fileAuthor = '';
var fileIco = '';
var selectedArray = '';
var colorHighliteTimer;
var isHighliteColor = true;
var timerstart = new Date().getTime(),
timertime = 0;
var lineCountTimer;

sourceArea.addEventListener("click", testForImageArray, true);
sourceArea.onscroll     = function(ev){ 
	handleScroll();
	clearTimeout(lineCountTimer);
	lineCountTimer = requestAnimationFrame(lineCount);
};
sourceArea.onmousedown  = function(ev){ this.mouseisdown = true; }
sourceArea.onmouseup    = function(ev){ this.mouseisdown=false; lineCount()};
sourceArea.onmousemove  = function(ev){ if (this.mouseisdown) lineCount()};
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keypress", keyPressHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
window.addEventListener("resize", pixelColorHighlight);
setup_mouse("div_wind1", "drag_wind1");
sourceArea.onkeydown = sourceArea.onkeyup = sourceArea.onkeypress = sourceArea.oncut = sourceArea.onpaste = inputOnKey;

(function () {
	var url = window.location.href.toString();
	if (url.indexOf('?src=') > -1) {
		input.value = 'loading data from gist, please wait';
		var src = url.split('?src=');
		fetch('https://api.github.com/gists/' + src[1])
		.then(function (results) {
			return results.json();
		})
		.then(function (data) {
			var file = '';
			for (var i in data.files) {
				file = data.files[i].content;
				break;
			}
			input.value = file;
			pixelColorHighlight();
			setTimeout(lineCount, 300);
		});
	}
})();
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

if (typeof document.getElementById("inputImgHighlite").scrollTo !== 'function') {
	isHighliteColor = false;
	document.getElementById("highliteColorCheckbox").style.display = 'none';
}

window.addEventListener("unload", function() {
  localStorage.setItem('save_source_code', sourceArea.value);
});

document.addEventListener("DOMContentLoaded", function() {
	var s = localStorage.getItem('save_source_code');
    if(s && s.length > 2){
		sourceArea.value = s;
		pixelColorHighlight();
	}
});

function saveIco(a){
	var i = 0;
	var out = [];
	var c = document.getElementById("icon").getContext('2d');
	var palette = [
		"#000000", "#EDE3C7", "#BE3746", "#7FB8B5",
		"#4A3E4F", "#6EA76C", "#273F68", "#DEBB59",
		"#B48D6C", "#42595A", "#C0624D", "#333333",
		"#777777", "#8FAB62", "#3ABFD1", "#bbbbbb"
	];
	a = a.replace(/[{}]/g, '');
	a = a.split(',');
	for(var y = 0; y < 16; y++){
		for(var x = 0; x < 24; x++){
			out.push(parseInt(a[i]) & 0xff);
			c.fillStyle = palette[(parseInt(a[i]) & 0xf0) >> 4];
			c.fillRect(x, y, 1, 1);
			x++;
			c.fillStyle = palette[parseInt(a[i]) & 0xf];
			c.fillRect(x, y, 1, 1);
			i++;
			if(i >= a.length)
				return out;
		}
	}
	return out;	
}

function saveSettings(){
	var s = sourceArea.value;
	fileName = document.getElementById("fileName").value;
	fileAuthor = document.getElementById("fileAuthor").value;
	fileIco = saveIco(document.getElementById("fileIco").value);
	if (document.getElementById('fileTypeChoice2').checked)
		fileType = 'lge';
	else if (document.getElementById('fileTypeChoice3').checked)
		fileType = 'html';
	else
		fileType = 'bin';
	var settings = {};
	settings.name = fileName;
	settings.author = fileAuthor;
	settings.image = fileIco;
	var sourceSettings = JSON.stringify(settings);
	if(s.search( /\/\*settings\*([\s\S]*?)\*\//i ) > -1){
		sourceArea.value = s.replace( /\/\*settings\*([\s\S]*?)\*\//i, '/*settings*' + sourceSettings + '*/');
	}
	else
		sourceArea.value = '/*settings*' + sourceSettings + '*/\n' + s;
}

function loadSettings(){
	var s = sourceArea.value;
	var fs = s.match( /\/\*settings\*([\s\S]*?)\*\//i );
	if(fs){
		var sourceSettings = fs[1];
		if(sourceSettings.length > 5){
			var settings = JSON.parse(sourceSettings);
			fileName = settings.name;
			fileAuthor = settings.author;
			fileIco = saveIco(settings.image.join(','));
			document.getElementById("fileName").value = fileName;
			document.getElementById("fileAuthor").value = fileAuthor;
			document.getElementById("fileIco").value = fileIco;
		}
	}
}

function setup_mouse(id_div_wind, id_div_drag) {
	if (obj_wind)
		obj_wind.style.zIndex = '0';
	obj_wind = document.getElementById(id_div_wind);
	obj_wind.style.zIndex = '1';
	obj_drag_wind = document.getElementById(id_div_drag);
	obj_drag_wind.onmousedown = save_delta_koor;
	document.onmouseup = clear_delta_koor;
}

function save_delta_koor(obj_evt) {
	var x,
	y;
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
	var x,
	y;
	if (obj_event) {
		x = obj_event.pageX;
		y = obj_event.pageY;
	} else {
		x = window.event.clientX;
		y = window.event.clientY;
	}
	if(delta_y + y < 0)
		obj_wind.style.top = "0px";
	else
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

function keyPressHandler(e) {
	globalKey = e.keyCode;
	if(globalKey == 13)
		globalKey = 0xA;
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
	
	switch (e.keyCode) {
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
	case 88:
	case 32: //B - space,x
		globalJKey |= 32;
		break;
	case 90: //A - Z
		globalJKey |= 16;
		break;
	}
}

function keyUpHandler(e) {
	switch (e.keyCode) {
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
	case 88:
	case 32: //B - space,x
		globalJKey &= ~32;
		break;
	case 90: //A - Z
		globalJKey &= ~16;
		break;
	}
}

function testForImageArray(e){
	var b = document.getElementById("floatButton");
	var position = getCaretPos(sourceArea);
	var str = sourceArea.value;
	var left = 0;
	var right = str.length;
	var word;
	b.style.left = (e.clientX - 50) + 'px';
	b.style.top = (e.clientY - 40) + 'px';
	b.style.display = 'none';
	for(var i = position; i >= 0 ; i--){
		if('{};'.indexOf(str[i]) > -1){
			left = i + 1;
			break;
		}
	}
	for(i = position; i < str.length; i++){
		if('{};'.indexOf(str[i]) > -1){
			right = i;
			break;
		}
	}
	if(left < right){
		word = str.substring(left,right);
		if(!word.match(/[^,0-9a-fA-FxX\s]/)){
			selectedArray = word;
			b.style.display = 'block';
		}
	}
}

function getCaretPos(obj) {
  obj.focus();
  if (document.selection) { // IE
    var sel = document.selection.createRange();
    var clone = sel.duplicate();
    sel.collapse(true);
    clone.moveToElementText(obj);
    clone.setEndPoint('EndToEnd', sel);
    return clone.text.length;
  } else if (obj.selectionStart!==false) return obj.selectionStart; // Gecko
  else return 0;
}

function loadArrayAsImage(){
	document.getElementById("spriteLoadArea").value = selectedArray;
	spriteEditor.edit();
	document.getElementById('spriteLoad').style.height = '10em';
}

function highliteasm(code) {
	//подсветка от etcdema
	var comments = []; // Тут собираем все каменты
	var strings = []; // Тут собираем все строки
	var res = []; // Тут собираем все RegExp
	var all = {
		'C': comments,
		'S': strings,
		'R': res
	};

	return code
	// Убираем каменты
	.replace(/([^;]);[^\n]*/g, function (m, f) {
		var l = comments.length;
		comments.push(m);
		return f + '~~~C' + l + '~~~';
	})
	// Убираем строки
	.replace(/([^\\])((?:'(?:\\'|[^'])*')|(?:"(?:\\"|[^"])*"))/g, function (m, f, s) {
		var l = strings.length;
		strings.push(s);
		return f + '~~~S' + l + '~~~';
	})
	// Выделяем ключевые слова
	.replace(/(mov|ldi|ldial|ldc|sti|stial|stc|pop|popn|push|pushn|jmp|jz|jnz|jc|jnc|call|ret|add|and|sub|mul|div|cmp|inc|dec|ldf|hlt|ftoi|itof)([^a-z0-9\$_])/gi,
		'<span class="kwrd">$1</span>$2')
	// Выделяем скобки
	.replace(/(\(|\))/gi,
		'<span class="gly">$1</span>')
	// Возвращаем на место каменты, строки
	.replace(/~~~([CSR])(\d+)~~~/g, function (m, t, i) {
		return '<span class="' + t + '">' + all[t][i] + '</span>';
	})
	// Выставляем переводы строк
	.replace(/\n/g, '<br/>')
}

function highlitec() {
	//подсветка от etcdema
	var code = document.getElementById("help_hl").innerHTML;
	var comments = []; // Тут собираем все каменты
	var strings = []; // Тут собираем все строки
	var res = []; // Тут собираем все RegExp
	var all = {
		'C': comments,
		'S': strings,
		'R': res
	};

	document.getElementById("help_hl").innerHTML = code
		// Убираем каменты
		.replace(/([^\/])\/\/[^\n]*/g, function (m, f) {
			var l = comments.length;
			comments.push(m);
			return f + '~~~C' + l + '~~~';
		})
		// Убираем строки
		.replace(/()(\/\*[\S\s]*?\*\/)/g, function (m, f, s) {
			var l = strings.length;
			strings.push(s);
			return f + '~~~S' + l + '~~~';
		})
		// Выделяем ключевые слова
		.replace(/(fixed|int|char|void)([^a-z0-9\$_])/gi,
			'<span class="kwrd">$1</span>$2')
		// Выделяем скобки
		.replace(/(\(|\))/gi,
			'<span class="gly">$1</span>')
		// Возвращаем на место каменты, строки
		.replace(/~~~([CSR])(\d+)~~~/g, function (m, t, i) {
			return '<span class="' + t + '">' + all[t][i] + '</span>';
		})
		// Выставляем переводы строк
		.replace(/\n/g, '<br/>')
		.replace(/\t/g, '');
}

highlitec();

//компиляция ассемблерного кода из поля ввода
function onlyAsm() {
	var s = document.getElementById('input').value;
	var n = s.split('\n').length;
	numberDebugString = [];
	for (var i = 0; i < n; i++)
		numberDebugString.push([i, i, 0]);
	file = asm(s);
	document.getElementById('ram').value = toHexA(file);
}
//компиляция си кода из поля ввода
function main() {
	sound.rtttl.play = 0;
	document.getElementById("alert").innerHTML = '';
	var src = document.getElementById('input').value;
	var t = tokenize(src);
	console.log(t);
	var c = compile(t);
	asmSource = '\n' + c.join('\n') + '\n';
	file = asm(asmSource);
	compress(file);
	document.getElementById('disasm').innerHTML = highliteasm(asmSource);
	document.getElementById('ram').value = toHexA(file);
}
//вывод информации о ходе сборки
function info(s) {
	var out = document.getElementById("alert");
	out.innerHTML += '<b>' + s + '</b><br>';
}

function lineCount(){
	var canvas = document.getElementById("inputCanvas");
	if (canvas.height != sourceArea.clientHeight) 
		canvas.height = sourceArea.clientHeight; // on resize
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#ebebe4";
	ctx.fillRect(0, 0, 46, sourceArea.scrollHeight+1);
	ctx.font = "13px monospace"; // NOTICE: must match TextArea font-size(13px) and lineheight(16) !!!
	var startIndex = Math.floor(sourceArea.scrollTop / 16,0);
	var endIndex = startIndex + Math.ceil(sourceArea.clientHeight / 16,0);
	for (var i = startIndex; i <= endIndex; i++){
		if (i == thisDebugString){
			ctx.fillStyle = "#0f0";
		}
		else {
			ctx.fillStyle = "#516399";
		}
		var ph = 12 - sourceArea.scrollTop + (i*16);
		var text = ''+(0+i);  // line number
		ctx.fillText(text,40-(text.length*6),ph);
	}
};

function inputOnKey(e) {
	if (e.keyCode === 9) { // была нажата клавиша TAB
		if (e.type == 'keyup')
			return false;
		// получим позицию каретки
		var val = this.value,
		start = this.selectionStart,
		end = this.selectionEnd;
		// установим значение textarea в: текст до каретки + tab + текст после каретки
		var txt = val.substring(start, end);
		if (e.shiftKey) {
			txt = txt.replace(/\n\s/g, '\n');
			if (txt[0] == '\t' || txt[0] == ' ')
				txt = txt.substring(1);
			this.value = val.substring(0, start) + txt + val.substring(end);
			this.selectionStart = start;
			this.selectionEnd = start + txt.length;
		} else {
			if (txt.length == 0) {
				this.value = val.substring(0, start) + '\t' + val.substring(end);
				// переместим каретку
				this.selectionStart = start + 1;
				this.selectionEnd = start + 1;
			} else {
				txt = txt.replace(/[\n]/g, '\n\t');
				this.value = val.substring(0, start) + '\t' + txt + val.substring(end);
				this.selectionStart = start;
				this.selectionEnd = start + txt.length + 1;
			}

		}
		setTimeout(lineCount, 300);
		pixelColorHighlight();
		// предотвратим потерю фокуса
		return false;
	} else if (e.keyCode === 13) {
		if (e.type == 'keyup')
			return false;
		// получим позицию каретки
		var val = this.value,
		start = this.selectionStart,
		end = this.selectionEnd;
		var spc = 0;
		var tb = 0;
		this.value = val.substring(0, start) + '\n' + val.substring(end);
		if (end < val.length && val[end] == '\t')
			end++;
		for (var i = start; i >= 0; i--) {
			if (val[i] == '\n') {
				if (spc > 0 || tb > 0)
					break;
			} else if (val[i] == '\t')
				tb++;
			else if (val[i] == ' ')
				spc++;
			else if (val[i] == '{') {
				tb++;
			}
			spc++;
		}
		var txt = '';
		for (var i = 0; i < tb; i++)
			txt += '\t';
		// переместим каретку
		this.value = val.substring(0, start) + '\n' + txt + val.substring(end);
		this.selectionStart = start + txt.length + 1;
		this.selectionEnd = start + txt.length + 1;
		pixelColorHighlight();
		return false;
	} else if (e.keyCode === 125) {
		if (e.type == 'keyup')
			return false;
		// получим позицию каретки
		var val = this.value,
		start = this.selectionStart,
		end = this.selectionEnd;
		if (start > 0 && val[start - 1] == '\t')
			start--;
		this.value = val.substring(0, start) + '}' + val.substring(end);
		this.selectionStart = start + 1;
		this.selectionEnd = start + 1;
		pixelColorHighlight();
		return false;
	}
	pixelColorHighlight();
	e.stopPropagation();
}

function handleScroll() {
	if(isHighliteColor){
		var h = document.getElementById("inputImgHighlite");
		h.scrollTo(sourceArea.scrollLeft, sourceArea.scrollTop);
	}
}

function pixelColorHighlight(){
	var h = document.getElementById("inputImgHighlite");
	clearTimeout(colorHighliteTimer);
	if(isHighliteColor){
		h.style.display = "block";
		colorHighliteTimer = setTimeout(function(){
			var s = sourceArea.value.replace(/</g, '>');
			h.innerHTML = s.replace(/0x([0-9a-fA-F]{1,2})[,}]*/g, function (str, c, offset, s) {
				if(c.length == 1){
					return '<pc class="pc' + parseInt(c, 16) + '">0x0,</pc>';
				}
				else{
					c = parseInt(c, 16);
					return '<pc class="pc' + (c >> 4) + '">0x0</pc><pc class="pc' + (c & 0xf) + '">0,</pc>';
				}
			});
		}, 300);
		h.style.width = sourceArea.offsetWidth + 'px';
		h.style.height = sourceArea.offsetHeight + 'px';
	}
	else
		h.style.display = "none";
}

function changeHighlightColors(check){
	isHighliteColor = check;
	pixelColorHighlight();
}

function listing() {
	var d = document.getElementById("div_wind1");
	d.value = asmSource;
	d.style.display = "block";
	d.style.left = "1em";
	d.style.top = "3em";
	var d = document.getElementById("disasm");
	d.value = asmSource;
}

function debugVars() {
	var d = document.getElementById("div_wind3");
	d.style.display = "block";
	d.style.left = window.innerWidth / 7 * 2 + 'px';
	d.style.top = "3em";
	isDebug = true;
}

function viewHelp() {
	var d = document.getElementById("div_wind4");
	d.style.display = "block";
	d.style.left = window.innerWidth / 7 * 3 + 'px';
	d.style.top = "3em";
}

function viewSettings() {
	var d = document.getElementById("div_wind5");
	d.style.display = "block";
	d.style.left = window.innerWidth / 7 * 4 + 'px';
	d.style.top = "3em";
	loadSettings();
}

function closewindow(id) {
	var d = document.getElementById(id);
	if (id == "div_wind3")
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

function viewMemory() {
	var s = '     0 1 2 3 4 5 6 7 8 9 A B C D E F';
	for (var i = 0; i < 256; i++) {
		if (i % 16 == 0)
			s += '\n' + toHex2(memoryPage) + toHex2(Math.floor(i)) + ':';
		s += toHex2(cpu.readMem(memoryPage * 256 + i)) + '';
	}
	document.getElementById('areaMemoryPrewiew').value = s;
}

function setMemoryPage(n) {
	if (n == 'p')
		memoryPage++;
	else if (n == 'm')
		memoryPage--;
	else if (!isNaN(parseInt(n, 16)))
		memoryPage = parseInt(n, 16);
	if (memoryPage > 255)
		memoryPage = 255;
	if (memoryPage < 0)
		memoryPage = 0;
	document.getElementById('memoryPage').value = toHex2(memoryPage);
	viewMemory();
}

function run() {
	//звук инициализируется только при нажатии на кнопку
	sound.initAudio();
	//уменьшаем значение таймеров
	for (var i = 0; i < 8; i++) {
		timers[i] -= 16;
		if (timers[i] <= 0)
			timers[i] = 0;
	}
	soundTimer -= 16;
	if (soundTimer <= 30)
		soundTimer = sound.playRtttl();
	if (soundTimer > 2000)
		soundTimer = 2000;
	//обрабатываем команды процессора
	for (var i = 0; i < cpuSpeed; i++) {
		cpu.step();
		i += cpuLostCycle;
		cpuLostCycle = 0;
	}
	//обработка спрайтов
	if (isRedraw) {
		display.clearSprite();
		cpu.redrawSprite();
		cpu.testSpriteCollision(isDebug);
		isRedraw = false;
		//выводим отладочную информацию
		debugCallCount++;
		if (debugCallCount >= 10) {
			document.getElementById('debug').value = cpu.debug();
			debugCallCount = 0;
		}
	}
	timertime += 16;
	var diff = (new Date().getTime() - timerstart) - timertime;
	clearTimeout(timerId);
	timerId = setTimeout(function () {
			run()
		}, 16 - diff);
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
	var clipx0, clipx1, clipy0 , clipy1;
	
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

	function position(e) {
		var rect = canvas.getBoundingClientRect();
		var x = Math.floor((e.offsetX == undefined ? e.layerX : e.offsetX) / (rect.width / 128));
		var y = Math.floor((e.offsetY == undefined ? e.layerY : e.offsetY) / (rect.height / 160)) - 16;
		ctx.fillStyle = "rgb(170, 170, 170)";
		ctx.fillRect(0, 0, pixelSize * 128, pixelSize * 16);
		ctx.fillStyle = "#111";
		ctx.fillText("x " + x + "; y " + y, 1, 1);
	}

	function reset() {
		clipx0 = 0;
		clipx1 = 128;
		clipy0 = 0;
		clipy1 = 128;
		ctx.textAlign = "start";
		ctx.textBaseline = "hanging";
		ctx.font = pixelSize * 8 + "px monospace";
		ctx.fillStyle = "rgb(170, 170, 170)";
		ctx.fillRect(0, 0, width + 20, height + 20);
		for (var i = 0; i < 20480; i++) {
			displayArray[i] = 0;
			canvasArray[i] = 0;
			canvasArray2[i] = 0;
		}
		cpuLostCycle += 2000;
		ctx.fillStyle = "rgb(170, 170, 170)";
		ctx.fillRect(0, (128 + 16) * pixelSize, pixelSize * 128, pixelSize * 16);
		ctx.fillStyle = "#111";
		ctx.fillText("KEY_A - z, KEY_B - space", 1, (128 + 16) * pixelSize);
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 16 * pixelSize, pixelSize * 128, pixelSize * 128);
		for (var i = 0; i < 16; i++) {
			palette[i] = bpalette[i];
			sprtpalette[i] = bpalette[i];
		}
	}

	function clearScreen(color) {
		if (color === undefined || color === null)
			color = 0;
		for (var i = 0; i < 20480; i++) {
			displayArray[i] = color;
			canvasArray[i] = color;
		}
	}

	function clearSprite() {
		for (var i = 0; i < 20480; i++) {
			spriteArray[i] = 0;
		}
	}

	function drawLed(color) {
		var r = ((((color >> 11) & 0x1F) * 527) + 23) >> 6;
		var g = ((((color >> 5) & 0x3F) * 259) + 33) >> 6;
		var b = (((color & 0x1F) * 527) + 23) >> 6;
		ctx.fillStyle = fullColorHex(r, g, b);
		ctx.fillRect(0, 0, pixelSize * 128, pixelSize * 16);
		ctx.fillRect(0, (128 + 16) * pixelSize, pixelSize * 128, pixelSize * 16);
	}

	function char(chr, x, y, color, bgcolor) {
		var c = chr.charCodeAt(0);
		for (var i = 0; i < 5; i++) { // Char bitmap = 5 columns
			var line = font[c * 5 + i];
			for (var j = 0; j < 8; j++, line >>= 1) {
				if (line & 1)
					drawPixel(color, x + i, y + j);
				else
					drawPixel(bgcolor, x + i, y + j);
			}
		}
	}

	function drawTestRect(x, y, w, h, c) {
		if (c == 0)
			ctx.strokeStyle = "pink";
		else
			ctx.strokeStyle = "red";
		ctx.beginPath();
		ctx.rect(x * pixelSize, (y + 16) * pixelSize, w * pixelSize, h * pixelSize);
		ctx.stroke();
		isDebug = true;
	}

	function setClip(x0, y0, x1, y1){
		if (x0 > 0x7fff)
			x0 -= 0x10000;
		if (y0 > 0x7fff)
			y0 -= 0x10000;
		clipx0 = (x0 >= 0 && x0 < 127) ? x0 : 0;
		clipy0 = (y0 >= 0 && y0 < 127) ? y0 : 0;
		clipx1 = (x0 + x1 > 0 && x0 + x1 <= 128) ? x0 + x1 : 128;
		clipy1 = (y0 + y1 > 0 && y0 + y1 <= 128) ? y0 + y1 : 128;
	}
	
	function updatePixel(x, y) {
		canvasArray[x * 128 + y] = displayArray[x * 128 + y];

	}

	function drawPixel(color, x, y) {
		cpuLostCycle += 0.1;
		if (x >= clipx0 && x < clipx1 && y >= clipy0 && y < clipy1)
			canvasArray[x * 128 + y] = color;
	}

	function drawSpritePixel(color, x, y) {
		if (x >= 0 && x < 128 && y >= 0 && y < 128)
			spriteArray[x * 128 + y] = color;
	}

	function plot(color, x, y) {
		if (x >= clipx0 && x < clipx1 && y >= clipy0 && y < clipy1) {
			drawPixel(color, x, y);
			displayArray[x * 128 + y] = color & 0x0f;
		}
	}

	function largeplot(color, x, y, s) {
		var x1,
		y1;
		for (x1 = 0; x1 < s; x1++)
			for (y1 = 0; y1 < s; y1++) {
				drawPixel(color, x + x1, y + y1);
				displayArray[(x + x1) * 128 + y + y1] = color & 0x0f;
			}
	}

	function getPixel(x, y) {
		if (x >= 0 && x <= 127 && y >= 0 && y <= 127)
			return displayArray[x * 128 + y];
		return 0;
	}

	function viewKeyboard(pos) {
		isDrawKeyboard = true;
	}

	function redraw() {
		var color,
		x,
		y;
		if (isDrawKeyboard) {
			document.getElementById("viewKeyboard").style.display = "block";
			isDrawKeyboard = 0;
		}
		else{
			document.getElementById("viewKeyboard").style.display = "none";
		}
		for (x = 0; x < 128; x++)
			for (y = 0; y < 128; y++) {
				if (spriteArray[x * 128 + y] > 0) {
					color = spriteArray[x * 128 + y];
					canvasArray2[x * 128 + y] = color;
					ctx.fillStyle = sprtpalette[color & 0x0f];
					ctx.fillRect(x * pixelSize, (y + 16) * pixelSize, pixelSize, pixelSize);
				} else if (canvasArray[x * 128 + y] != canvasArray2[x * 128 + y] || isDebug || isChangePalette) {
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

	function fullColorHex(r, g, b) {
		var red = rgbToHex(r);
		var green = rgbToHex(g);
		var blue = rgbToHex(b);
		return '#' + red + green + blue;
	}

	function changePalette(n, color) {
		var r = ((((color >> 11) & 0x1F) * 527) + 23) >> 6;
		var g = ((((color >> 5) & 0x3F) * 259) + 33) >> 6;
		var b = (((color & 0x1F) * 527) + 23) >> 6;
		isChangePalette = true;
		if (n < 16)
			palette[n] = fullColorHex(r, g, b);
		else if (n < 32)
			sprtpalette[n - 16] = fullColorHex(r, g, b);
	}

	return {
		init: init,
		reset: reset,
		clearScreen: clearScreen,
		drawLed: drawLed,
		char: char,
		setClip: setClip,
		updatePixel: updatePixel,
		drawPixel: drawPixel,
		drawSpritePixel: drawSpritePixel,
		plot: plot,
		largeplot: largeplot,
		getPixel: getPixel,
		viewKeyboard: viewKeyboard,
		redraw: redraw,
		changePalette: changePalette,
		clearSprite: clearSprite,
		drawTestRect: drawTestRect
	};
}

function redraw() {
	setTimeout(function () {
		requestAnimationFrame(redraw);
		cpu.redrawParticle();
		display.redraw();
		cpu.setRedraw();
		isRedraw = true;
	}, 48);
}

function savebin() {
	var newByteArr = [];
	loadSettings();
	if (fileType == 'lge'){
		if (file.length > 1) {
			var cfile = compress(file);
			if(cfile == false){
				cfile = file;
				newByteArr = [0x6C,0x67,0x65,0x0,0x5];
			}
			else
				newByteArr = [0x6C,0x67,0x65,0x1,0x5];
			if(fileIco && fileIco.length > 0){
				newByteArr[3] += 2;
				newByteArr[4] += 192;
				for(var i = 0; i < 192; i++){
					if(i < fileIco.length)
						newByteArr.push(fileIco[i] & 0xFF);
					else
						newByteArr.push(0);
				}
			}
			if(fileAuthor && fileAuthor.length > 0){
				newByteArr[3] += 4;
				newByteArr[4] += fileAuthor.length;
				for(var i = 0; i < fileAuthor.length; i++)
					newByteArr.push(fileAuthor[i] & 0xFF);
			}
			for (var i = 0; i < cfile.length; i++) {
				newByteArr.push(cfile[i] & 0xFF);
			}
			var newFile = new Uint8Array(newByteArr);
			var blob = new Blob([newFile], {
					type: "charset=iso-8859-1"
				});
			if(fileName.length > 0)
				saveAs(blob, fileName + '.lge');
			else
				saveAs(blob, 'rom.lge');
		}
	}
	else if (fileType == 'html'){
		if (file.length > 1) {
			var newFile = saveAsHtml(compress(file), fileIco);
			var blob = new Blob([newFile], {type: "text/plain;charset=utf-8"});
			if(fileName.length > 0)
				saveAs(blob, fileName + '.html');
			else
				saveAs(blob, 'game.html');
		}
	}
	else{
		if (file.length > 1) {
			for (var i = 0; i < file.length; i++) {
				newByteArr.push(file[i] & 0xFF);
			}
			var newFile = new Uint8Array(newByteArr);
			var blob = new Blob([newFile], {
					type: "charset=iso-8859-1"
				});
			saveAs(blob, "rom.bin");
		}
	}
}

function compress(file){
	var fpos = 0, epos = 0, lopos = 0, len = 0;
	var out = [];
	var find = function(array, pos) {
		for (var j = Math.max(0, pos - 511); j < pos; j++) {
		  if ((array[j] === array[pos]) && (array[j + 1] === array[pos + 1]) && (array[j + 2] === array[pos + 2]) && (array[j + 3] === array[pos + 3]))
			  return j;
		}
	return -1;
	}
	
	out = file.slice(0, 3);
	out.splice(0,0,0,3);
	lopos = 0;
	for(var i = 3; i < file.length; i++){
		fpos = find(file, i);
		epos = i;
		if(fpos > -1){
			while(i < file.length && file[fpos + len] === file[i] && len < 63){
				len++;
				i++;
			}
			out.push(128 + (len << 1) + ((epos - fpos) >> 8));
			out.push((epos - fpos) & 0xff);
			lopos = out.length;
			out.push(0);
			out.push(0);
			len = 0;
			i--;
		}
		else{
		  out.push(file[i]);
		  out[lopos + 1]++;
			  if(out[lopos + 1] > 255){
				  out[lopos + 1] = 0;
				  out[lopos]++;
			  }
		}
	}
	console.log("compress rate " + Math.round(100 - out.length / file.length * 100) + "%");
	if(!compressTest(file, decompress(out))){
		console.log("error compress");
		console.log(out);
		console.log(file);
		console.log(decompress(out));
		return false;
	}
	return out;
}

function decompress(file){
	var out = [];
	var i = 0, length, position, point;
	while(i < file.length){
		if((file[i] & 128) == 0){
			length = ((file[i] & 127) << 8) + file[i + 1];
			i += 2;
			for( var j = 0; j < length; j ++){
				out.push(file[i]);
				i++;
			}
		}
		else{
			length = (file[i] & 127) >> 1;
			position = (((file[i] & 1) << 8) + file[i + 1]);
			i += 2;
			point = out.length - position;
			for( var j = 0; j < length; j ++){
				out.push(out[point + j]);
			}
		}
	}
	return out;
}

function compressTest(f1, f2){
	if(f1.length != f2.length){
		return false;
	}
	for(var i = 0; i < f1.length; i++){
		if(f1[i] != f2[i]){
			console.log(i, f1[i], f2[i]);
			return false;
		}
	}
	return true;
}

var display = new Display();
display.init();
var sound = new Sound();
var spriteEditor = new SpriteEditor();
spriteEditor.init();
lineCount();
redraw();
