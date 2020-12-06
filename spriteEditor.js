"use strict";
function SpriteEditor() {
	var sprite = [];
	var data;
	var txt = '';
	var story = [];
	var storyPos = 0;
	var storyMaxPos = 0;
	var type = 0;
	var thiscolor = 0;
	var isRLE = false;
	var is1bit = false;
	var selectedLeft = 0;
	var selectedRight = 0;
	var callsize;
	var changed = 0;
	var startline = [0, 0, 0];
	var mousedown = 0;
	var imousedown = 0;
	var xoffset = 0;
	var yoffset = 0;
	var globalx = 0;
	var globaly = 0;
	var width = 128;
	var height = 128;
	var pixelsize = 1;
	var reservePalette = [
		"#000000", "#EDE3C7", "#BE3746", "#7FB8B5",
		"#4A3E4F", "#6EA76C", "#273F68", "#DEBB59",
		"#B48D6C", "#42595A", "#C0624D", "#333333",
		"#777777", "#8FAB62", "#3ABFD1", "#bbbbbb"
	];
	var palette = [
		"#000000", "#EDE3C7", "#BE3746", "#7FB8B5",
		"#4A3E4F", "#6EA76C", "#273F68", "#DEBB59",
		"#B48D6C", "#42595A", "#C0624D", "#333333",
		"#777777", "#8FAB62", "#3ABFD1", "#bbbbbb"
	];
	var pixelarea = document.getElementById("pixelarea");
	var pixelareactx = pixelarea.getContext('2d');
	var imgarea = document.getElementById("pixelimg");
	var imgareactx = imgarea.getContext('2d');
	var posInfo = document.getElementById("positionInfo");
	function init() {
		thiscolor = 0;
		clear();
		document.getElementById("selectColor").style.background = palette[thiscolor];
		loadRGBtoInput(thiscolor);
		pixelarea.addEventListener('mousedown', function (e) {
			mousedown = 1;
			setpixel(e);
			if(changed)
				storyData(sprite);
		});
		pixelarea.addEventListener('mouseup', function (e) {
			if(startline[0] == 1){
				drwLine(startline[1], startline[2], globalx, globaly, true);
				startline[0] = 0;
			}
			if(mousedown == 1){
				mousedown = 0;
				if(changed)
					storyData(sprite);
			}
		});
		pixelarea.addEventListener('mouseout', function (e) {
			if(startline[0] == 1){
				drwLine(startline[1], startline[2], globalx, globaly, true);
				startline[0] = 0;
			}
			if(mousedown == 1){
				mousedown = 0;
				if(changed)
					storyData(sprite);
			}
		});
		pixelarea.addEventListener('mousemove', function (e) {
			setpixel(e);
		});
		imgarea.addEventListener('mousedown', function (e) {
			imousedown = 1;
			setOffset(e);
		});
		imgarea.addEventListener('mouseup', function (e) {
			imousedown = 0;
		});
		imgarea.addEventListener('mouseout', function (e) {
			imousedown = 0;
		});
		imgarea.addEventListener('mousemove', function (e) {
			if(imousedown == 1)
				setOffset(e);
		});
	}
	function clear(){
		for (var x = 0; x <= 128; x++){
			sprite[x] = [];
			for (var y = 0; y <= 128; y++) {
				sprite[x][y] = 0;
			}
		}
		storyData(sprite);
		changed = 1;
		redraw();
	}
	function load(){
		var a = document.getElementById("spriteLoadArea").value;
		var w = document.getElementById("spriteLoadWidth").value;
		var i, j, x, y, h;
		var type = 0;
		is1bit = 0;
		isRLE = 0;
		w = parseInt(w, 10);
		if(isNaN(w) || w < 1 || w > 128)
			w = 8;
		w += w % 2;
		a = a.replace(/\/\*(.*?)\*\//g, function (str, info, offset, s) {
				info = info.split(':');
				if(info[0] == 'bit')
					type = 1;
				else if(info[0] == 'rle')
					type = 2;
				if(type > 0){
					w = parseInt(info[1]);
					h = parseInt(info[2]);
				}
				return '';
			});
		a = a.replace(/[{}]/g, '');
		a = a.split(',');
		for (var i = 0; i < 128; i++) {
			sprite[i] = [];
			for (var j = 0; j < 128; j++)
				sprite[i][j] = 0;
		}
		x = 0;
		y = 0;
		if(document.getElementById('check1bitL').checked || type == 1){
			i = 0;
			j = 0;
			var bit;
			for (y = 0; y < (a.length * 8) / w; y++)
				for (x = 0; x < w; x++) {
					if (i % 8 == 0) {
						bit = parseInt(a[j++]);
					}
					if (bit & 0x80)
						sprite[x][y] = 1;
					else
						sprite[x][y] = 0;
					bit = bit << 1;
					i++;
				}
			is1bit = 1;
			document.getElementById('check1bit').checked = true;
			document.getElementById('checkRle').disabled = true;
		}
		else if(document.getElementById('checkRleL').checked || type == 2){
			var i = 0;
			var j = 0;
			for(j; j < a.length; j++)
				a[j] = parseInt(a[j], 16);
			j = 0;
			var repeat = a[j++];
			var color1 = (a[j] & 0xf0) >> 4;
			var color2 = a[j] & 0xf;
			while (j < a.length) {
				if (repeat > 0x81) {
					sprite[x++][y] = color1;
					sprite[x++][y] = color2;
					if(x >= w){
						x = 0;
						y++;
					}
					j++;
					repeat--;
					color1 = (a[j] & 0xf0) >> 4;
					color2 = a[j] & 0xf;
				} else if (repeat == 0x81) {
					repeat = a[j];
					j++;
					color1 = (a[j] & 0xf0) >> 4;
					color2 = a[j] & 0xf;
				} else if (repeat > 0) {
					sprite[x++][y] = color1;
					sprite[x++][y] = color2;
					if(x >= w){
						x = 0;
						y++;
					}
					repeat--;
				} else if (repeat == 0) {
					j++;
					repeat = a[j++];
					color1 = (a[j] & 0xf0) >> 4;
					color2 = a[j] & 0xf;
				}
			}
			isRLE = 1;
			document.getElementById('checkRle').checked = true;
			document.getElementById('checkRle').disabled = false;
			document.getElementById('check1bit').checked = false;
		}
		else{
			for(i = 0; i < a.length; i++){
				sprite[x][y] = (parseInt(a[i]) & 0xf0) >> 4;
				x++;
				sprite[x][y] = (parseInt(a[i]) & 0x0f);
				x++;
				if(x >= w){
					x = 0;
					y++;
					if(y > 127)
						break;
				}
			}
			document.getElementById('checkRle').checked = false;
			document.getElementById('check1bit').checked = false;
		}
		width = w;
		if(h && h > 0)
			height = h;
		else
			height = y;
		document.getElementById("spriteWidthChoice").value = width;
		document.getElementById("spriteHeightChoice").value = height;
		setSize();
		changed = 1;
		redraw();
		updateText();
	}
	function setOffset(e){
		var rect = imgarea.getBoundingClientRect();
		xoffset = Math.floor((Math.floor((e.offsetX == undefined ? e.layerX : e.offsetX) / (rect.width / 128)) - 8) / pixelsize);
		yoffset = Math.floor((Math.floor((e.offsetY == undefined ? e.layerY : e.offsetY) / (rect.height / 128)) - 8) / pixelsize);
		if(xoffset > width - 16)
			xoffset = width - 16;
		if(xoffset < 0)
			xoffset = 0;
		if(yoffset > height - 16)
			yoffset = height - 16;
		if(yoffset < 0)
			yoffset = 0;
		changed = 1;
		redraw();
		posInfo.innerHTML = 'x ' + xoffset + ', y ' + yoffset;
	}
	function setpixel(e){
		var rect = pixelarea.getBoundingClientRect();
		var x = Math.floor((e.offsetX == undefined ? e.layerX : e.offsetX) / (rect.width / 16));
		var y = Math.floor((e.offsetY == undefined ? e.layerY : e.offsetY) / (rect.height / 17));
		if(x < 0)
			x = 0;
		if(y < 0)
			y = 0;
		if(y < 16){
			if(mousedown == 1){
				if (type == 0) {
					sprite[x + xoffset][y + yoffset] = thiscolor;
				} 
				else if (type == 1){
					if (sprite[x + xoffset][y + yoffset] != thiscolor){
						fillPixels(x + xoffset, y + yoffset, sprite[x + xoffset][y + yoffset], thiscolor);
						callsize = 0;
					}
				}
				else if (type == 2 && startline[0] == 0){
					startline = [1, x, y];
				}
				changed = 1;
				posInfo.innerHTML = 'x ' + (x + xoffset) + ', y ' + (y + yoffset);
				updateText();
			}
			globalx = x;
			globaly = y;
			redraw();
		}
		else {
			if(mousedown == 1){
				thiscolor = x;
				pixelareactx.fillStyle = palette[thiscolor];
				document.getElementById("selectColor").style.background = palette[thiscolor];
				loadRGBtoInput(thiscolor);
			}
		}
	}
	function drwLine(x1, y1, x2, y2, m) {
		var dX = Math.abs(x2 - x1);
		var dY = Math.abs(y2 - y1);
		var sX = x1 < x2 ? 1 : -1;
		var sY = y1 < y2 ? 1 : -1;
		var err = dX - dY;
		pixelareactx.fillStyle = palette[thiscolor];
		pixelareactx.fillRect(x2 * 16, y2 * 16, 16, 16);
		if(m){
			sprite[x2 + xoffset][y2 + yoffset] = thiscolor;
		}
		while (x1 != x2 || y1 != y2) {
			pixelareactx.fillRect(x1 * 16, y1 * 16, 16, 16);
			if(m){
				sprite[x1 + xoffset][y1 + yoffset] = thiscolor;
			}
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
	function fillPixels(x, y, color, changecolor) {
		var i;
		if (x >= 0 && x < width && y >= 0 && y < height && sprite[x][y] == color) {
			i = x + 1;
			sprite[x][y] = changecolor;
			while(i < width && sprite[i][y] == color){
				sprite[i][y] = changecolor;
				if (y > 0 && sprite[i][y - 1] == color && sprite[i - 1][y - 1] != color)
					fillPixels(i, y - 1, color, changecolor);
				if (y < height && sprite[i][y + 1] == color && sprite[i - 1][y - 1] != color)
					fillPixels(i, y + 1, color, changecolor);
				i++;
			}
			i = x - 1;
			while(i >= 0 && sprite[i][y] == color){
				sprite[i][y] = changecolor;
				if (y > 0 && sprite[i][y - 1] == color && sprite[i + 1][y - 1] != color)
					fillPixels(i, y - 1, color, changecolor);
				if (y < height && sprite[i][y + 1] == color && sprite[i + 1][y + 1] != color)
					fillPixels(i, y + 1, color, changecolor);
				i--;
			}
			if (y > 0 && sprite[x][y - 1] == color)
				fillPixels(x, y - 1, color, changecolor);
			if (y < height && sprite[x][y + 1] == color)
				fillPixels(x, y + 1, color, changecolor);
		}
	}
	function setSize(){
		var w = document.getElementById("spriteWidthChoice").value;
		var h = document.getElementById("spriteHeightChoice").value;
		changed = 1;
		w = parseInt(w, 10);
		w += w % 2;
		h = parseInt(h, 10);
		if(w > 0 && w <= 128 && h > 0 && h <= 128){
			xoffset = 0;
			yoffset = 0;
			width = w;
			height = h;
			document.getElementById("spriteWidthChoice").value = w;
			document.getElementById("spriteHeightChoice").value = h;
			pixelsize = Math.floor(128 / Math.max(width, height));
			redraw();
			updateText();
		}
	}
	function setType(n) {
		type = n;
	}
	function storyData(a){
		story[storyPos] = (JSON.stringify(a));
		storyPos++;
		storyMaxPos = storyPos;
		if(story.length > 64){
			story.splice(0, 1);
			storyPos--;
			storyMaxPos--;
		}
	}
	function back(){
		if(storyPos > 0){
			storyPos--;
			sprite = JSON.parse(story[storyPos]);
			changed = 1;
			redraw();
			updateText();
		}
	}
	function repeat(){
		if(storyPos < storyMaxPos){
			storyPos++;
			sprite = JSON.parse(story[storyPos]);
			changed = 1;
			redraw();
			updateText();
		}
	}
	function redraw(){
		requestAnimationFrame(redrawOnFrame);
	}
	function scroll(direction) {
		var bufPixel;
		data = [];
		if (direction == 2) {
			for (var y = 0; y < height; y++) {
				bufPixel = sprite[0][y];
				for (var x = 1; x < width; x++)
					sprite[x - 1][y] = sprite[x][y];
				sprite[width - 1][y] = bufPixel;
			}
		} else if (direction == 1) {
			for (var x = 0; x < width; x++) {
				bufPixel = sprite[x][0];
				for (var y = 1; y < height; y++)
					sprite[x][y - 1] = sprite[x][y];
				sprite[x][height - 1] = bufPixel;
			}
		} else if (direction == 0) {
			for (var y = 0; y < height; y++) {
				bufPixel = sprite[width - 1][y];
				for (var x = width - 1; x > 0; x--)
					sprite[x][y] = sprite[x - 1][y];
				sprite[0][y] = bufPixel;
			}
		} else {
			for (var x = 0; x < 32; x++) {
				bufPixel = sprite[x][height - 1];
				for (var y = height - 1; y > 0; y--)
					sprite[x][y] = sprite[x][y - 1];
				sprite[x][0] = bufPixel;
			}
		}
		changed = 1;
		redraw();
		updateText();
	}
	function redrawOnFrame(){
		if(mousedown == 0 && changed){
			changed = 0;
			imgareactx.fillStyle = '#eee';
			imgareactx.fillRect(0, 0, 128, 128);
			for (var y = 0; y < height; y++)
				for (var x = 0; x < width; x++) {
					if(is1bit){
						if(sprite[x][y] == 0)
							imgareactx.fillStyle = palette[0];
						else
							imgareactx.fillStyle = palette[1];
					}
					else
						imgareactx.fillStyle = palette[sprite[x][y]];
					imgareactx.fillRect(x * pixelsize, y * pixelsize, pixelsize, pixelsize);
				}
			imgareactx.strokeStyle = '#A00';
			imgareactx.beginPath();
			imgareactx.rect(xoffset * pixelsize, yoffset * pixelsize, 16 * pixelsize, 16 * pixelsize);
			imgareactx.stroke();
		}
		for (var y = 0; y < 16; y++)
			for (var x = 0; x < 16; x++) {
				if(x >= width || y >= height)
					pixelareactx.fillStyle = '#eee';
				else{
					if(is1bit){
						if(sprite[xoffset + x][yoffset + y] == 0)
							pixelareactx.fillStyle = palette[0];
						else
							pixelareactx.fillStyle = palette[1];
					}
					else
						pixelareactx.fillStyle = palette[sprite[xoffset + x][yoffset + y]];
				}
				pixelareactx.fillRect(x * 16, y * 16, 16, 16);
			}
		for (var i = 0; i < 17; i++) {
			pixelareactx.fillStyle = palette[i];
			pixelareactx.fillRect(i * 16, 256, 16, 16);
		}
		if(startline[0] == 1){
			drwLine(startline[1], startline[2], globalx, globaly, false); 
		}
		pixelareactx.strokeStyle = 'rgba(255,105,180,0.8)';
		pixelareactx.beginPath();
		pixelareactx.rect(globalx * 16, globaly * 16, 16, 16);
		pixelareactx.stroke();
	}
	function hexToRgb(hex) {
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function (m, r, g, b) {
				return r + r + g + g + b + b;
			});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		}
		 : null;
	}
	function loadRGBtoInput(c) {
		var color = hexToRgb(palette[c]);
		var r5 = Math.floor(color.r * 31.0 / 255.0 + 0.5);
		var g6 = Math.floor(color.g * 63.0 / 255.0 + 0.5);
		var b5 = Math.floor(color.b * 31.0 / 255.0 + 0.5);
		document.getElementById("r5g6b5HEXinput").value = '0x' + Number((r5 << 11) + (g6 << 5) + b5).toString(16);
		document.getElementById("r5g6b5Rinput").value = r5;
		document.getElementById("r5g6b5Ginput").value = g6;
		document.getElementById("r5g6b5Binput").value = b5;
	}
	function changePaletteColor() {
		var r5 = document.getElementById("r5g6b5Rinput").value * 1;
		var g6 = document.getElementById("r5g6b5Ginput").value * 1;
		var b5 = document.getElementById("r5g6b5Binput").value * 1;
		var r8 = Math.floor(r5 * 255.0 / 31.0 + 0.5);
		var g8 = Math.floor(g6 * 255.0 / 63.0 + 0.5);
		var b8 = Math.floor(b5 * 255.0 / 31.0 + 0.5);
		document.getElementById("r5g6b5HEXinput").value = '0x' + Number((r5 << 11) + (g6 << 5) + b5).toString(16);
		palette[thiscolor] = "#" + ((1 << 24) + (r8 << 16) + (g8 << 8) + b8).toString(16).slice(1);
		document.getElementById("selectColor").style.background = palette[thiscolor];
		changed = 1;
		redraw();
	}
	function backColor() {
		palette[thiscolor] = reservePalette[thiscolor];
		changed = 1;
		redraw();
		loadRGBtoInput(thiscolor);
		document.getElementById("selectColor").style.background = palette[thiscolor];
	}
	function updateText() {
		var i,
		j,
		bit;
		var datarle = [];
		var data = [];
		var i = 0;
		for (var y = 0; y < height; y++)
			for (var x = 0; x < width; x++) {
				data[i] = sprite[x++][y] << 4;
				data[i++] += sprite[x][y];
			}
		var spr = '{';
		if (is1bit) {
			spr += '/*bit:' + width + ':' + height + '*/';
			bit = 0;
			j = 0;
			for (i = 0; i < data.length; i++) {
				if ((data[i] & 0xf0) > 0)
					bit += 1 << (7 - j);
				j++;
				if ((data[i] & 0x0f) > 0)
					bit += 1 << (7 - j);
				j++;
				if (j > 7) {
					spr += '0x' + bit.toString(16) + ',';
					j = 0;
					bit = 0;
				}
			}
			if (j > 0) {
				spr += '0x' + bit.toString(16) + ',';
				j = 0;
				bit = 0;
			}
			spr = spr.substring(0, spr.length - 1)
				spr += '};';
			document.getElementById("checkRleLabel").innerHTML = 'RLE 100%';
		} else if (isRLE) {
			spr += '/*rle:' + width + ':' + height + '*/';
			if (data.length > 1)
				datarle = RLE(data);
			else
				datarle = [0x82, 0 + data[0]];
			for (i = 0; i < datarle.length; i++)
				spr += '0x' + datarle[i].toString(16) + ',';
			spr = spr.substring(0, spr.length - 1);
				spr += '};';
			document.getElementById("checkRleLabel").innerHTML = 'RLE ' + Math.floor(100 * datarle.length / data.length) + '%';
		} else {
			for (i = 0; i < data.length; i++){
				if(i % (width / 2) == 0)
					spr += '\n';
				spr += '0x' + (data[i] >> 4).toString(16) + '' + (data[i] & 0xf).toString(16);
				if(i < data.length - 1)
					spr += ', ';
			}
			spr += '\n};';
			document.getElementById("checkRleLabel").innerHTML = 'RLE 100%';
		}
		document.getElementById("spriteArea").value = spr;
		txt = spr;
	}
	function RLE(d) {
		var i = 1;
		var repeat = false;
		var pos = 0;
		var c = d[0];
		var l = 1;
		var out = [];
		if (c == d[1])
			repeat = true;
		else {
			out.push(0x81);
			out.push(d[0]);
		}
		while (i != d.length) {
			if (repeat) {
				if (d[i] == c) {
					l++;
					if (i == d.length - 1) {
						out.push(l);
						out.push(c);
						l = 1;
						c = d[i];
					} else if (l > 126) {
						out.push(l - 1);
						out.push(c);
						l = 1;
					}
				} else {
					out.push(l);
					out.push(c);
					l = 1;
					c = d[i];
					if (c != d[i + 1]) {
						repeat = false;
						pos = out.length;
						out.push(0x80);
						i--;
						c = d[i];
					}
				}
			} else {
				if (d[i] == c) {
					repeat = true;
					i--;
					out.pop();
				} else {
					out[pos]++;
					out.push(d[i]);
					c = d[i];
				}
			}
			i++;
		}
		return out;
	}
	function setRle(b) {
		isRLE = b;
		updateText();
	}
	function set1bit(b) {
		changed = 1;
		is1bit = b;
		document.getElementById('checkRle').disabled = b;
		redraw();
		updateText();
	}
	function edit(l, r) {
		var d = document.getElementById("div_wind2");
		d.style.display = "block";
		d.style.left = window.innerWidth / 7 + 'px';
		d.style.top = "3em";
		d.scrollIntoView(false);
		if(l && r && r > 0){
			selectedLeft = l;
			selectedRight = r;
			document.getElementById("updateSprite").disabled = false;
		}
		else{
			selectedLeft = 0;
			selectedRight = 0;
			document.getElementById("updateSprite").disabled = true;
		}
	}
	function updateSprite(){
		var val = sourceArea.value;
		sourceArea.value = val.substring(0, selectedLeft) + txt + val.substring(selectedRight + 2);
		document.getElementById("updateSprite").disabled = true;
		setTimeout(lineCount, 300);
		pixelColorHighlight();
	}
	return {
		init: init,
		clear: clear,
		load: load,
		setpixel: setpixel,
		setSize: setSize,
		setType: setType,
		back: back,
		repeat: repeat,
		scroll: scroll,
		loadRGBtoInput: loadRGBtoInput,
		changePaletteColor: changePaletteColor,
		backColor: backColor,
		setRle: setRle,
		set1bit: set1bit,
		edit: edit,
		updateSprite: updateSprite
	};
}
var spriteEditor = new SpriteEditor();
spriteEditor.init();