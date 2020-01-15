"use strict";

var mousedown;

function SpriteEditor() {
	var data = [];
	var story = [];
	var isRLE = false;
	var is1bit = false;
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
	var thiscolor = 0;
	var pixelareabgcolor = 0;
	var sprite = [];
	var pixelarea = document.getElementById("pixelearea");
	var pixelareactx = pixelarea.getContext('2d');
	var lastx = 0,
	lasty = 0;
	var type = 0;
	var imgwidth = 0;

	function load(){
		var a = document.getElementById("spriteLoadArea").value;
		var w = document.getElementById("spriteLoadWidth").value;
		var i, j, x, y;
		w = parseInt(w, 10);
		if(isNaN(w) || w < 1 || w > 32)
			w = 8;
		a = a.replace(/[{}]/g, '');
		a = a.split(',');
		for (var i = 0; i < 32; i++) {
			sprite[i] = [];
			for (var j = 0; j < 32; j++)
				sprite[i][j] = 0;
		}
		x = 0;
		y = 0;
		for(i = 0; i < a.length; i++){
			sprite[x][y] = (parseInt(a[i]) & 0xf0) >> 4;
			x++;
			sprite[x][y] = (parseInt(a[i]) & 0x0f);
			x++;
			if(x >= w){
				x = 0;
				y++;
				if(y > 31)
					break;
			}
		}
		imgwidth = w;
		redraw();
		updateText();
	}
	
	function storyData(a){
		story.push(JSON.stringify(a));
		if(story.length > 64){
			story.splice(0, 1);
		}
	}
	
	function back(){
		if(story.length > 0){
			sprite = JSON.parse(story.pop());
			redraw();
			updateText();
		}
	}
	
	function setType(n) {
		if (n == 1)
			type = 1;
		else
			type = 0;
	}

	function scroll(direction) {
		var bufPixel;
		data = [];
		if (direction == 2) {
			for (var y = 0; y < 32; y++) {
				bufPixel = sprite[0][y];
				for (var x = 1; x < 32; x++)
					sprite[x - 1][y] = sprite[x][y];
				sprite[31][y] = bufPixel;
			}
		} else if (direction == 1) {
			for (var x = 0; x < 32; x++) {
				bufPixel = sprite[x][0];
				for (var y = 1; y < 32; y++)
					sprite[x][y - 1] = sprite[x][y];
				sprite[x][31] = bufPixel;
			}
		} else if (direction == 0) {
			for (var y = 0; y < 32; y++) {
				bufPixel = sprite[31][y];
				for (var x = 31; x > 0; x--)
					sprite[x][y] = sprite[x - 1][y];
				sprite[0][y] = bufPixel;
			}
		} else {
			for (var x = 0; x < 32; x++) {
				bufPixel = sprite[x][31];
				for (var y = 31; y > 0; y--)
					sprite[x][y] = sprite[x][y - 1];
				sprite[x][0] = bufPixel;
			}
		}
		for (var i = 0; i <= 31; i++)
			for (var j = 0; j <= 31; j++) {
				pixelareactx.fillStyle = palette[sprite[i][j]];
				pixelareactx.fillRect(i, j, 1, 1);
			}
		updateText();
	}

	function setRle(b) {
		isRLE = b;
		updateText();
	}

	function set1bit(b) {
		is1bit = b;
		document.getElementById('checkRle').disabled = b;
		updateText();
	}

	function init() {
		pixelareactx.fillStyle = "#000000";
		pixelareactx.fillRect(0, 0, 32, 34);
		thiscolor = 0;
		document.getElementById("selectColor").style.background = palette[thiscolor];
		for (var i = 0; i < 17; i++) {
			pixelareactx.fillStyle = palette[i];
			pixelareactx.fillRect(i * 2, 32, 2, 2);
		}
		for (var i = 0; i < 32; i++) {
			sprite[i] = [];
			for (var j = 0; j < 32; j++)
				sprite[i][j] = 0;
		}
		pixelareactx.fillStyle = "#000000";
		pixelarea.addEventListener('mousedown', function (e) {
			mousedown = 1;
			setPixel(e);
		});
		pixelarea.addEventListener('mouseup', function (e) {
			mousedown = 0;
		});
		pixelarea.addEventListener('mouseout', function (e) {
			mousedown = 0;
		});
		pixelarea.addEventListener('mousemove', function (e) {
			setPixel(e);
		});
	}

	function redraw() {
		for (var x = 0; x <= 31; x++)
			for (var y = 0; y <= 31; y++) {
				pixelareactx.fillStyle = palette[sprite[x][y]];
				pixelareactx.fillRect(x, y, 1, 1);
			}
		for (var i = 0; i < 17; i++) {
			pixelareactx.fillStyle = palette[i];
			pixelareactx.fillRect(i * 2, 32, 2, 2);
		}

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
		redraw();
	}

	function backColor() {
		palette[thiscolor] = reservePalette[thiscolor];
		redraw();
		loadRGBtoInput(thiscolor);
		document.getElementById("selectColor").style.background = palette[thiscolor];
	}

	function setPixel(e) {
		var rect = pixelarea.getBoundingClientRect();
		var x = Math.floor((e.offsetX == undefined ? e.layerX : e.offsetX) / (rect.width / 32));
		var y = Math.floor((e.offsetY == undefined ? e.layerY : e.offsetY) / (rect.height / 34));
		if (mousedown && x < 32 && y < 34 && x >= 0 && y >= 0) {
			storyData(sprite);
			data = [];
			if (y > 31) {
				thiscolor = Math.floor(x / 2);
				pixelareactx.fillStyle = palette[thiscolor];
				document.getElementById("selectColor").style.background = palette[thiscolor];
				loadRGBtoInput(thiscolor);
			} else {
				if (type == 0) {
					pixelareactx.fillRect(x, y, 1, 1);
					sprite[x][y] = thiscolor;
				} else {
					pixelareactx.fillStyle = palette[thiscolor];
					if (sprite[x][y] != thiscolor)
						fillPixels(x, y, sprite[x][y], thiscolor);
				}
			}
			var spritewidth = 0;
			var spriteheight = 0;
			for (var i = 0; i < 32; i++) {
				for (var j = 0; j < 32; j++) {
					if (sprite[i][j] != pixelareabgcolor) {
						if (i > spritewidth)
							spritewidth = i;
						if (j > spriteheight)
							spriteheight = j;
					}
				}
			}
			for (i = 0; i <= spriteheight; i++)
				for (j = 0; j <= spritewidth; j++) {
					data.push(((sprite[j][i] & 0xf) << 4) + (sprite[++j][i] & 0xf));
				}
			imgwidth = Math.floor((spritewidth + spritewidth % 2) / 2);
			updateText();
			spriteheight++;
			spritewidth++;
			document.getElementById("spriteInfo").innerHTML = (spritewidth + spritewidth % 2) + 'x' + spriteheight;
		}
		if (x >= 0 && x < 32 && y >= 0 && y < 32) {
			if (x != lastx || y != lasty) {
				pixelareactx.fillStyle = palette[sprite[lastx][lasty]];
				pixelareactx.fillRect(lastx, lasty, 1, 1);
				lastx = x;
				lasty = y;
				pixelareactx.fillStyle = 'rgba(255,105,180,0.5)';
				pixelareactx.fillRect(x, y, 1, 1);
			}
		} else {
			pixelareactx.fillStyle = palette[sprite[lastx][lasty]];
			pixelareactx.fillRect(lastx, lasty, 1, 1);
		}
	}

	function fillPixels(x, y, color, changecolor) {
		if (x >= 0 && x < 32 && y >= 0 && y < 32) {
			pixelareactx.fillRect(x, y, 1, 1);
			sprite[x][y] = changecolor;
			if (x > 0 && sprite[x - 1][y] == color)
				fillPixels(x - 1, y, color, changecolor);
			if (x < 31 && sprite[x + 1][y] == color)
				fillPixels(x + 1, y, color, changecolor);
			if (y > 0 && sprite[x][y - 1] == color)
				fillPixels(x, y - 1, color, changecolor);
			if (y < 31 && sprite[x][y + 1] == color)
				fillPixels(x, y + 1, color, changecolor);
		}
	}

	function updateText() {
		var i,
		j,
		bit;
		var datarle = [];
		var spr = '{';
		if (is1bit) {
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
			if (data.length > 1)
				datarle = RLE(data);
			else
				datarle = [0x82, 0 + data[0]];
			for (i = 0; i < datarle.length; i++)
				spr += '0x' + datarle[i].toString(16) + ',';
			spr = spr.substring(0, spr.length - 1)
				spr += '};';
			document.getElementById("checkRleLabel").innerHTML = 'RLE ' + Math.floor(100 * datarle.length / data.length) + '%';
		} else {
			for (i = 0; i < data.length; i++){
				if(i % imgwidth == 0)
					spr += '\n';
				spr += '0x' + (data[i] >> 4).toString(16) + '' + (data[i] & 0xf).toString(16) + ',';
			}
			spr = spr.substring(0, spr.length - 1);
			spr += '\n};';
			document.getElementById("checkRleLabel").innerHTML = 'RLE 100%';
		}
		document.getElementById("spriteArea").value = spr;
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

	function edit() {
		var d = document.getElementById("div_wind2");
		d.style.display = "block";
		d.style.left = window.innerWidth / 7 + 'px';
		d.style.top = "3em";
	}

	function selectAll() {
		document.getElementById("spriteArea").focus();
		document.getElementById("spriteArea").select();
	}

	function pAreaAllowDrop(ev) {
		ev.preventDefault();
	}

	function clear() {
		pixelareactx.fillStyle = palette[0];
		pixelareactx.fillRect(0, 0, 32, 34);
		document.getElementById("selectColor").style.background = palette[thiscolor];
		for (var i = 0; i < 17; i++) {
			pixelareactx.fillStyle = palette[i];
			pixelareactx.fillRect(i * 2, 32, 2, 2);
		}
		for (var i = 0; i < 32; i++) {
			sprite[i] = [];
			for (var j = 0; j < 32; j++)
				sprite[i][j] = 0;
		}
		pixelareactx.fillStyle = palette[pixelareabgcolor];
	}

	return {
		setType: setType,
		setRle: setRle,
		set1bit: set1bit,
		init: init,
		changePaletteColor: changePaletteColor,
		backColor: backColor,
		edit: edit,
		clear: clear,
		fillPixels: fillPixels,
		selectAll: selectAll,
		scroll: scroll,
		back: back,
		load:load
	};
}
