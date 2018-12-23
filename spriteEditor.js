"use strict";

var mousedown;

function SpriteEditor(){
	var data = [];
	var isRLE = false;
	var palette = [
		  "#000000", "#ffffff", "#880000", "#aaffee",
		  "#cc44cc", "#00cc55", "#0000aa", "#eeee77",
		  "#dd8855", "#664400", "#ff7777", "#333333",
		  "#777777", "#aaff66", "#0088ff", "#bbbbbb"
		];
	var thiscolor = 0;
	var pixelareabgcolor = 0;
	var sprite = [];
	var pixelarea = document.getElementById("pixelearea");
	var pixelareactx = pixelarea.getContext('2d');
	
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
		if(mousedown){
			data = [];
			var rect = pixelarea.getBoundingClientRect();
			var	x = Math.floor((e.offsetX==undefined?e.layerX:e.offsetX)/(rect.width/16));
			var y = Math.floor((e.offsetY==undefined?e.layerY:e.offsetY)/(rect.height/17));
			if(y == 16){
				thiscolor = x;
				pixelareactx.fillStyle = palette[x];
				document.getElementById("selectColor").style.background = palette[x];
			}
			else{
				pixelareactx.fillRect(x, y, 1, 1);
				sprite[x][y] = thiscolor;	
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
			spr += '0x00};';
			document.getElementById("checkRleLabel").innerHTML = 'RLE ' + Math.floor(100 * datarle.length / data.length) + '%';
		}
		else{
			for(i = 0; i < data.length; i++)
				spr +='0x' + data[i].toString(16) + ',';
			spr += '0x00};';
			document.getElementById("checkRleLabel").innerHTML = 'RLE 100%';
		}
		document.getElementById("spriteArea").value = spr;
	}
	
/*	function RLE(data){
		var i = 1;
		var c = d[0];
		var l = 1;
		var out = [];
		while(i != d.length){
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
			}
			i++;
		}
		return out;
	}*/
	
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

	var img = document.createElement("img");
	function pAreaOnDrop(e) {
		e.preventDefault();
		if (e.dataTransfer.files.length > 0) {
		  var reader = new FileReader();
			// TODO: tidy up. use Image.onload instead of timeout assumption.
			reader.onload = function (event) {
			  img.src = event.target.result;
			  setTimeout(processImage, 500);
			};
			reader.readAsDataURL(e.dataTransfer.files[0]);
		} else {
		  img.src = e.dataTransfer.getData('text/uri-list');
		  setTimeout(processImage, 500);
		}
	}

	function processImage(){
		var MAX_WIDTH = 15;
		var MAX_HEIGHT = 15;
		var width = img.width;
		var height = img.height;
		  
		if (width > height) {
		  if (width > MAX_WIDTH) {
			height *= MAX_WIDTH / width;
			width = MAX_WIDTH;
		  }
		} else {
		  if (height > MAX_HEIGHT) {
			width *= MAX_HEIGHT / height;
			height = MAX_HEIGHT;
		  }
		}
		pixelareactx.drawImage(img, 0, 0, width, height);
		ImageRGBtoPalette();
	}

	var paletteB = [
		  [0x00,0x00,0x00], [0xff,0xff,0xff], [0x88,0x00,0x00], [0xaa,0xff,0xee],
		  [0xcc,0x44,0xcc], [0x00,0xcc,0x55], [0x00,0x00,0xaa], [0xee,0xee,0x77],
		  [0xdd,0x88,0x55], [0x66,0x44,0x00], [0xff,0x77,0x77], [0x33,0x33,0x33],
		  [0x77,0x77,0x77], [0xaa,0xff,0x66], [0x00,0x88,0xff], [0xbb,0xbb,0xbb]
		];
		
	function closest_color(a) {
		var smallest = 0xFFFFFF;
		var index = -1;
		for (var i = 0; i < paletteB.length; i++) {
			var diff = measure_similarity(a,paletteB[i]);
			if (diff < smallest) {
				smallest = diff;
				index = i;
			}
		}
		return index;
	}

	function ImageRGBtoPalette() {
		var imageWidth = 15;
		var imageHeight = 15;

		// Get pixel data in work canvas
		var sourceData = pixelareactx.getImageData(0, 0, imageWidth, imageHeight);
		var data = sourceData.data;
		// iterate over all pixels
		var output = [];
		var spr = '{';
		var x = 0;
		var y = 0;
		for(var i = 0, n = data.length; i < n; i += 4) {
			var red   = data[i];
			var green = data[i + 1];
			var blue  = data[i + 2];
			var alpha = data[i + 3];
			var val = closest_color([red,green,blue]);
			spr += val + ',';
			sprite[x][y] = val;
			x++;
			if(x >= imageWidth){
				x = 0;
				if(y<15)
					y++;
			}
			// Put new value from the color pallete into the current data.
			data[i] = paletteB[val][0];
			data[i+1] = paletteB[val][1];
			data[i+2] = paletteB[val][2];
			data[i+3] = 255;
		}
		// Write the image buffer with our palettized image back to work canvas.
		document.getElementById("spriteArea").value = spr+'0}';
		document.getElementById("spriteInfo").innerHTML = '15x15';
		pixelareactx.putImageData(sourceData,0,0);
		
	}
	// Compute the similarity between two colors. Return value of 0 means same color, large values mean very different.
	function measure_similarity(a, b) {
		return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]);
	}

	function loadSprite(){
		var width=parseInt(prompt('input sprite width', '8'));
		if(width > 0 && width < 17){
			var arr = document.getElementById("spriteArea").value.split(',');
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
			var x = 0;
			var y = 0;
			for(var i = 0; i < arr.length; i++){
				sprite[x][y] = parseInt(arr[i],10);
				pixelareactx.fillStyle = palette[sprite[x][y]];
				pixelareactx.fillRect(x, y, 1, 1);
				x++;
				if(x >= width){
					x = 0;
					if(y<15)
						y++;
				}
			}
			pixelareactx.fillStyle = "#000000";
			thiscolor = 0;
			document.getElementById("selectColor").style.background = palette[thiscolor];
		}
	}

	function clear(){
		pixelareabgcolor = thiscolor;
		pixelareactx.fillStyle = palette[pixelareabgcolor];
		pixelareactx.fillRect(0, 0, 16, 17);
		document.getElementById("selectColor").style.background = palette[thiscolor];
		for(var i = 0; i<17; i++){
			pixelareactx.fillStyle = palette[i];
			pixelareactx.fillRect(i, 16, 1, 1);
			sprite[i] = [];
			for(var j = 0; j<17; j++){
				sprite[i][j] = pixelareabgcolor;
			}
		}
		pixelareactx.fillStyle = palette[pixelareabgcolor];	
	}
	
	return {
		setRle:setRle,
		init:init,
		edit:edit,
		loadSprite:loadSprite,
		clear:clear,
		selectAll:selectAll
	};
}