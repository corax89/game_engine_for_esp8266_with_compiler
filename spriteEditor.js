"use strict";

var mousedown;

function SpriteEditor(){
	var data = [];
	var isRLE = false;
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
	var lastx = 0, lasty = 0;
	var type = 0;
	
	function setType(n){
		if(n == 1)
			type = 1;
		else
			type = 0;
	}
	
	function scroll(direction){
		var bufPixel;
		data = [];
		if(direction == 2){
			for(var y = 0; y < 16; y++){
				bufPixel = sprite[0][ y];
				for(var x = 1; x < 16; x++)
					sprite[x - 1][ y] = sprite[x][ y];
				sprite[15][ y] = bufPixel;
			}
		}
		else if(direction == 1){
			for(var x = 0; x < 16; x++){
				bufPixel = sprite[x][ 0];
				for(var y = 1; y < 16; y++)
					sprite[x][ y - 1] = sprite[x][ y];
				sprite[x][ 15] = bufPixel;
			}
		}
		else if(direction == 0){
			for(var y = 0; y < 16; y++){
				bufPixel = sprite[15][ y];
				for(var x = 15; x > 0; x--)
					sprite[x][ y] = sprite[x - 1][ y];
				sprite[0][ y] = bufPixel;
			}
		}
		else {
			for(var x = 0; x < 16; x++){
				bufPixel = sprite[x][ 15];
				for(var y = 15; y > 0; y--)
					sprite[x][ y] = sprite[x][ y - 1];
				sprite[x][ 0] = bufPixel;
			}
		}
		for(var i = 0; i <= 15; i++)
			for(var j = 0; j <= 15; j++){
				pixelareactx.fillStyle = palette[sprite[i][j]];
				pixelareactx.fillRect(i, j, 1, 1);					
			}
		updateText();
	}
	
	function setRle(b){
		isRLE = b;
		updateText();
	}
	
	function init(){
		pixelareactx.fillStyle = "#000000";
		pixelareactx.fillRect(0, 0, 16, 17);	
		thiscolor = 0;
		document.getElementById("selectColor").style.background = palette[thiscolor];
		for(var i = 0; i<17; i++){
			pixelareactx.fillStyle = palette[i];
			pixelareactx.fillRect(i, 16, 1, 1);
			sprite[i] = [];
			for(var j = 0; j<17; j++){
				sprite[i][j] = 0;
			}
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
	
	function setPixel(e){
		var rect = pixelarea.getBoundingClientRect();
		var	x = Math.floor((e.offsetX==undefined?e.layerX:e.offsetX)/(rect.width/16));
		var y = Math.floor((e.offsetY==undefined?e.layerY:e.offsetY)/(rect.height/17));
		if(mousedown){
			data = [];
			if(y == 16){
				thiscolor = x;
				pixelareactx.fillStyle = palette[x];
				document.getElementById("selectColor").style.background = palette[x];
			}
			else{
				if(type == 0){
					pixelareactx.fillRect(x, y, 1, 1);
					sprite[x][y] = thiscolor;	
				}
				else{
					
					pixelareactx.fillStyle = palette[thiscolor];
					if(sprite[x][y] != thiscolor)
						fillPixels(x, y, sprite[x][y], thiscolor);
				}
			}
			var spritewidth = 0;
			var spriteheight = 0; 
			for(var i = 0; i < 16; i++){
				for(var j = 0; j < 16; j++){
					if(sprite[i][j] != pixelareabgcolor){
						if(i > spritewidth)
							spritewidth = i;
						if(j > spriteheight)
							spriteheight = j;
					}
				}
			}
			for(i = 0; i <= spriteheight; i++)
				for(j = 0; j <= spritewidth; j++){
						data.push(((sprite[j][i] & 0xf) << 4) + (sprite[++j][i] & 0xf));					
				}
			updateText();
			spriteheight++;
			spritewidth++;
			document.getElementById("spriteInfo").innerHTML = spritewidth + 'x' + spriteheight;
		}
		if(x >=0 && x < 16 && y >=0 && y < 16){	
			if(x != lastx || y != lasty){
				pixelareactx.fillStyle = palette[sprite[lastx][lasty]];
				pixelareactx.fillRect(lastx, lasty, 1, 1);
				lastx = x;
				lasty = y;
				pixelareactx.fillStyle = 'rgba(255,105,180,0.5)';
				pixelareactx.fillRect(x, y, 1, 1);
			}
		}
		else{
			pixelareactx.fillStyle = palette[sprite[lastx][lasty]];
			pixelareactx.fillRect(lastx, lasty, 1, 1);
		}
	}
	
	function fillPixels(x, y, color, changecolor){
		if(x >=0 && x < 16 && y >=0 && y < 16){
			pixelareactx.fillRect(x, y, 1, 1);
			sprite[x][y] = changecolor;
			if(x > 0 && sprite[x - 1][y] == color)
				fillPixels(x - 1, y, color, changecolor);
			if(x < 15 && sprite[x + 1][y] == color)
				fillPixels(x + 1, y, color, changecolor);
			if(y > 0 && sprite[x][y - 1] == color)
				fillPixels(x, y - 1, color, changecolor);
			if(y < 15 && sprite[x][y + 1] == color)
				fillPixels(x, y + 1, color, changecolor);
		}
	}
	
	function updateText(){
		var i;
		var datarle = [];
		var spr = '{';
		if(isRLE){
			if( data.length > 1)
				datarle = RLE(data);
			else
				datarle = [0x82, 0 + data[0]];
			for(i = 0; i < datarle.length; i++)
				spr +='0x' + datarle[i].toString(16) + ',';
			spr = spr.substring(0, spr.length - 1)
			spr += '};';
			document.getElementById("checkRleLabel").innerHTML = 'RLE ' + Math.floor(100 * datarle.length / data.length) + '%';
		}
		else{
			for(i = 0; i < data.length; i++)
				spr +='0x' + data[i].toString(16) + ',';
			spr = spr.substring(0, spr.length - 1)
			spr += '};';
			document.getElementById("checkRleLabel").innerHTML = 'RLE 100%';
		}
		document.getElementById("spriteArea").value = spr;
	}
	
	function RLE(d){
		var i = 1;
		var repeat = false;
		var pos = 0;
		var c = d[0];
		var l = 1;
		var out = [];
		if(c == d[1])
			repeat = true;
		else{
			out.push(0x81);
			out.push(d[0]);
		}
		while(i != d.length){
			if(repeat){
				if(d[i] == c){
					l++;
					if( i == d.length - 1){
						out.push(l);
						out.push(c);
						l = 1;
						c = d[i];
					}
				}
				else{
					out.push(l);
					out.push(c);
					l = 1;
					c = d[i];
					if(c != d[i + 1]){
						repeat = false;
						pos = out.length;
						out.push(0x80);
						i--;
						c = d[i];
					}
				}
			}
			else{
				if(d[i] == c){
					repeat = true;
					i--;
					out.pop();
				}
				else{
					out[pos]++;
					out.push(d[i]);
					c = d[i];
				}
			}
			i++;
		}
		return out;
	}
	
	function edit(){
		var d = document.getElementById("div_wind2");
		d.style.display = "block";
		d.style.left = window.innerWidth/4 + 'px';
		d.style.top = "3em";
	}

	function selectAll(){
		document.getElementById("spriteArea").focus();
		document.getElementById("spriteArea").select();
	}

	function pAreaAllowDrop(ev){
		ev.preventDefault();
	}

	function clear(){
		pixelareactx.fillStyle = palette[0];
		pixelareactx.fillRect(0, 0, 16, 17);
		document.getElementById("selectColor").style.background = palette[thiscolor];
		for(var i = 0; i<17; i++){
			pixelareactx.fillStyle = palette[i];
			pixelareactx.fillRect(i, 16, 1, 1);
			sprite[i] = [];
			for(var j = 0; j<17; j++){
				sprite[i][j] = 0;
			}
		}
		pixelareactx.fillStyle = palette[pixelareabgcolor];	
	}
	
	return {
		setType:setType,
		setRle:setRle,
		init:init,
		edit:edit,
		clear:clear,
		fillPixels:fillPixels,
		selectAll:selectAll,
		scroll:scroll
	};
}