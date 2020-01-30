"use strict";

function toHexN(n, d) {
	var s = n.toString(16);
	while (s.length < d) {
		s = '0' + s;
	}
	return s.toUpperCase();
}

function toHex2(n) {
	return toHexN(n & 0xff, 2);
}

function toHex4(n) {
	return toHexN(n & 0xffff, 4);
}

function toHexA(a) {
	var s = '$';
	var i = 0;
	for (i; i < a.length - 1; i++)
		s += toHex2(a[i]) + ',$';
	s += toHex2(a[i]);
	return s;
}

function asm(s) {
	var out = [];
	var arr = [];
	var label = [];
	var variableAdress = 0;
	var debugVarStart = 0;
	var variable = [];
	var registers = ["R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15"];

	function addDebugInformation(n) {
		for (var i = 0; i < numberDebugString.length; i++)
			if (numberDebugString[i][0] == n) {
				numberDebugString[i][2] = out.length;
			}
	}

	function strToNum(s) {
		s = s.trim().toUpperCase();
		if (s[s.length - 1] == 'H') {
			if (!isNaN(parseInt(s, 16)))
				return parseInt(s, 16);
		}
		if (s[s.length - 1] == 'B') {
			if (!isNaN(parseInt(s, 2)))
				return parseInt(s, 2);
		}
		if (isNaN(parseInt(s, 10)))
			return s;
		return parseInt(s, 10) & 0xffff;
	}

	function pushInt(s) {
		s = s.toUpperCase();
		var n = strToNum(s);
		if (typeof n === 'string') {
			out.push(n);
			out.push(0x0);
			return;
		}
		out.push(0xff & n);
		out.push((0xff00 & n) >> 8);
	}

	function pushChar(s) {
		s = s.toUpperCase();
		var n = strToNum(s);
		if (typeof n === 'string') {
			out.push(n);
			return;
		}
		out.push(0xff & n);
	}

	function parse(s) {
		var tokens = [''];
		var thisToken = 0;
		for (var i = 0; i <= 10; i++)
			tokens[i] = '';
		tokens[0] = '';
		for (i = 0; i < s.length; i++) {
			switch (s[i]) {
			case ' ':
				if (tokens[thisToken] != '') {
					thisToken++;
					tokens[thisToken] = '';
				}
				break;
			case '(':
			case ')':
			case ',':
			case ':':
			case '+':
				if (tokens[thisToken] != '')
					thisToken++;
				tokens[thisToken] = s[i];
				thisToken++;
				tokens[thisToken] = '';
				break;
			case '"':
				tokens[thisToken] += s[i++];
				while (i < s.length && s[i] != '"')
					tokens[thisToken] += s[i++];
				tokens[thisToken] += s[i];
				break;
			default:
				tokens[thisToken] += s[i];
			}
		}
		compile(tokens);
	}

	function getRegister(r) {
		return registers.indexOf(r);
	}

	function dbparse(s) {
		var buffer = '';
		var c;
		for (var i = 2; i < s.length; i++) {
			switch (s[i]) {
			case ',':
				if (buffer.length > 0)
					pushChar(buffer);
				buffer = '';
				break;
			case '\'':
				i++;
				for (i; i < s.length; i++) {
					if (s[i] != '\'') {
						out.push(s.charCodeAt(i));
					} else
						break;
				}
				break;
			case '"':
				i++;
				for (i; i < s.length; i++) {
					if (s[i] != '"') {
						c = s.charCodeAt(i);
						if (c > 127)
							c = c - 848;
						if (c <= 255)
							out.push(c);
					} else
						break;
				}
				break;
			case ' ':
				break;
			default:
				buffer += s[i];
			}
		}
		if (buffer != '') {
			pushChar(buffer);
		}
	}

	function dwparse(s) {
		var buffer = '';
		var n;
		for (var i = 2; i < s.length; i++) {
			switch (s[i]) {
			case ',':
				if (buffer.length > 0) {
					pushInt(buffer);
				}
				buffer = '';
				break;
			case '\'':
				i++;
				for (i; i < s.length; i++) {
					if (s[i] != '\'') {
						n = s.charCodeAt(i);
						out.push(0xff & n);
						out.push((0xff00 & n) >> 8);
					} else
						break;
				}
				break;
			case '"':
				i++;
				for (i; i < s.length; i++) {
					if (s[i] != '"') {
						n = s.charCodeAt(i);
						out.push(0xff & n);
						out.push((0xff00 & n) >> 8);
					} else
						break;
				}
				break;
			case ' ':
				break;
			default:
				buffer += s[i];
			}
		}
		if (buffer != '') {
			pushInt(buffer);
		}
	}

	function compile(a) {
		for (var i = 0; i < a.length; i++) {
			if (a[i][0] != '"')
				a[i] = a[i].toUpperCase();
		}
		for (var i = 0; i < a.length; i++) {
			switch (a[i]) {
			case ':':
				if (i > 0) {
					label.push(a[i - 1]);
					label.push(out.length);
				}
				break;
			case 'WORD':
				if (a[i + 2] && a[i + 2].toUpperCase() == 'DUP') {
					variable.push(a[i - 1], variableAdress);
					variableAdress += strToNum(a[i + 1]) * 2;
				} else {
					variable.push(a[i - 1], variableAdress);
					variableAdress += 2;
				}
				return
			case 'BYTE':
				if (a[i + 2] && a[i + 2].toUpperCase() == 'DUP') {
					variable.push(a[i - 1], variableAdress);
					variableAdress += strToNum(a[i + 1]);
				} else {
					variable.push(a[i - 1], variableAdress);
					variableAdress += 1;
				}
				return
			case 'NOP':
				out.push(0x00);
				out.push(0x00);
				return;
			case 'LDI':
				if (a[i + 3] != '(') { //LDI R,int		01 0R XXXX
					out.push(0x01);
					out.push(0x00 + getRegister(a[i + 1]));
					pushInt(a[i + 3]);
					return;
				} else {
					if (getRegister(a[i + 4]) == -1 && a[i + 5] == '+') { //LDI R,(int+R)	04 RR XXXX
						out.push(0x04);
						out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 6]));
						pushInt(a[i + 4]);
						return;
					} else if (getRegister(a[i + 4]) > -1 && a[i + 5] == '+') { //LDI R,(R+R)		6R RR
						out.push(0x60 + getRegister(a[i + 1]));
						out.push((getRegister(a[i + 4]) << 4) + getRegister(a[i + 6]));
						return;
					} else if (getRegister(a[i + 4]) > -1) {
						out.push(0x02); //LDI R,(R)		02 RR
						out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 4]));
						return;
					} else {
						out.push(0x03); //LDI R,(adr)		03 0R XXXX
						out.push(getRegister(a[i + 1]));
						pushInt(a[i + 4]);
						return;
					}
				}
				break;
			case 'LDIAL':
				if (getRegister(a[i + 4]) == -1 && a[i + 5] == '+') { //LDIAL R,(int+R*2)	08 RR XXXX
					out.push(0x08);
					out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 6]));
					pushInt(a[i + 4]);
				}
				break;
			case 'STI':
				if (getRegister(a[i + 2]) == -1 && a[i + 3] == '+') { //STI (adr+R),R 	06 RR XXXX
					out.push(0x06);
					out.push((getRegister(a[i + 4]) << 4) + getRegister(a[i + 7]));
					pushInt(a[i + 2]);
					return;
				} else if (getRegister(a[i + 2]) > -1 && a[i + 3] == '+') { //STI (R+R),R		7R RR
					out.push(0x70 + getRegister(a[i + 2]));
					out.push((getRegister(a[i + 4]) << 4) + getRegister(a[i + 7]));
					return;
				} else if (getRegister(a[i + 2]) > -1) {
					out.push(0x05); //STI (R),R		05 RR
					out.push((getRegister(a[i + 2]) << 4) + getRegister(a[i + 5]));
					return;
				} else {
					out.push(0x06); //STI (adr),R		06 R0 XXXX
					out.push(getRegister(a[i + 5]) << 4);
					pushInt(a[i + 2]);
					return;
				}
				break;
			case 'STIAL':
				if (getRegister(a[i + 2]) == -1 && a[i + 3] == '+') { //STIAL (adr+R*2),R 	09 RR XXXX
					out.push(0x09);
					out.push((getRegister(a[i + 4]) << 4) + getRegister(a[i + 7]));
					pushInt(a[i + 2]);
				}
				break;
			case 'LDC':
				if (a[i + 3] != '(') { //LDC R,char		1R XX
					out.push(0x10 + getRegister(a[i + 1]));
					pushChar(a[i + 3]);
					return;
				} else {
					if (getRegister(a[i + 4]) == -1 && a[i + 5] == '+') { //LDC R,(int+R)	30 RR XXXX
						out.push(0x30);
						out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 6]));
						pushInt(a[i + 4]);
						return;
					} else if (getRegister(a[i + 4]) > -1 && a[i + 5] == '+') { //LDC R,(R+R)		2R RR
						out.push(0x20 + getRegister(a[i + 1]));
						out.push((getRegister(a[i + 4]) << 4) + getRegister(a[i + 6]));
						return;
					} else if (getRegister(a[i + 4]) > -1) {
						out.push(0x20); //LDC R,(R)		20 RR
						out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 4]));
						return;
					} else {
						out.push(0x31); //LDC R,(adr)		31 0R XXXX
						out.push(getRegister(a[i + 1]));
						pushInt(a[i + 4]);
						return;
					}
				}
				break;
			case 'STC':
				if (getRegister(a[i + 2]) == -1 && a[i + 3] == '+') { //STC (int+R),R	33 RR XXXX
					out.push(0x33);
					out.push((getRegister(a[i + 4]) << 4) + getRegister(a[i + 7]));
					pushInt(a[i + 2]);
					return;
				} else if (getRegister(a[i + 2]) > -1 && a[i + 3] == '+') { //STC (R+R),R		4R RR
					out.push(0x40 + getRegister(a[i + 2]));
					out.push((getRegister(a[i + 4]) << 4) + getRegister(a[i + 7]));
					return;
				} else if (getRegister(a[i + 2]) > -1) {
					out.push(0x40); //STC (R),R		40 RR
					out.push((getRegister(a[i + 2]) << 4) + getRegister(a[i + 5]));
					return;
				} else {
					out.push(0x32); // STC (adr),R	32 0R XXXX
					out.push(getRegister(a[i + 5]));
					pushInt(a[i + 2]);
					return;
				}
				break;
			case 'MOV':
				out.push(0x07); //MOV R,R			07 RR
				out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 3]));
				return;
			case 'PUSH':
				out.push(0x82); //PUSH R			82 0R
				if (getRegister(a[i + 1]) > 0)
					out.push(getRegister(a[i + 1]));
				return;
			case 'POP':
				out.push(0x80); //POP R			80 0R
				if (getRegister(a[i + 1]) > 0)
					out.push(0x00 + getRegister(a[i + 1]));
				return;
			case 'PUSHN':
				out.push(0x83); //PUSHN R			83 0R
				out.push(getRegister(a[i + 1]));
				return;
			case 'POPN':
				out.push(0x81); //POPN R			81 0R
				out.push(getRegister(a[i + 1]));
				return;
			case 'JMP':
				out.push(0x90); //JMP adr			90 00 XXXX
				out.push(0x00);
				pushInt(a[i + 1]);
				return;
			case 'JNZ':
				out.push(0x91); //JNZ adr			91 00 XXXX
				out.push(0x00);
				pushInt(a[i + 1]);
				return;
			case 'JZ':
				out.push(0x92); //JZ adr			92 00 XXXX
				out.push(0x00);
				pushInt(a[i + 1]);
				return;
			case 'JNP':
				out.push(0x93); //JNP adr			93 00 XXXX
				out.push(0x00);
				pushInt(a[i + 1]);
				return;
			case 'JP':
				out.push(0x94); //JP adr			94 00 XXXX
				out.push(0x00);
				pushInt(a[i + 1]);
				return;
			case 'JNC':
				out.push(0x95); //JNC adr			95 00 XXXX
				out.push(0x00);
				pushInt(a[i + 1]);
				return;
			case 'JC':
				out.push(0x96); //JC adr			96 00 XXXX
				out.push(0x00);
				pushInt(a[i + 1]);
				return;
			case 'ADD':
				out.push(0xA0); //ADD R,R			A0 RR
				out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 3]));
				return;
			case 'ADC':
				out.push(0xA1); //ADC R,R			A1 RR
				out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 3]));
				return;
			case 'SUB':
				out.push(0xA2); //SUB R,R			A2 RR
				out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 3]));
				return;
			case 'SBC':
				out.push(0xA3); //SBC R,R			A3 RR
				out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 3]));
				return;
			case 'MUL':
				out.push(0xA4); //MUL R,R			A4 RR
				out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 3]));
				return;
			case 'DIV':
				out.push(0xA5); //DIV R,R			A5 RR
				out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 3]));
				return;
			case 'AND':
				out.push(0xA6); //AND R,R			A6 RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'OR':
				out.push(0xA7); //OR R,R			A7 RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'ANDL':
				out.push(0xAE); //AND R,R			A6 RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'ORL':
				out.push(0xAF); //OR R,R			A7 RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'XOR':
				out.push(0xAA); //XOR R,R			AA RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'SHL':
				out.push(0xAB); //SHL R,R			AB RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'SHR':
				out.push(0xAC); //SHR R,R			AC RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'RAND':
				out.push(0xAD); //RAND R				AD 0R
				out.push(getRegister(a[i + 1]));
				return;
			case 'CMP':
				if (getRegister(a[i + 3]) > -1) {
					out.push(0xC1); //CMP R,R			C1 RR
					out.push((getRegister(a[i + 1]) << 4) + getRegister(a[i + 3]));
				} else {
					if (parseInt(a[i + 3]) < 255) {
						out.push(0xB0 + getRegister(a[i + 1])); //CMP R,CHR		BR XX
						pushChar(a[i + 3]);
					} else {
						out.push(0xC1);
						out.push(getRegister(a[i + 1]) << 4); //CMP R,INT		C0 R0 XXXX
						pushInt(a[i + 3]);
					}
				}
				return;
			case 'INC':
				if (getRegister(a[i + 1]) > -1) {
					if (a[i + 2] == ',') {
						out.push(0xA8);
						out.push(getRegister(a[i + 1]) + ((strToNum(a[i + 3]) & 0xf) << 4)); //INC R,n			A8 nR
					} else {
						out.push(0xA8);
						out.push(getRegister(a[i + 1])); //INC R			A8 0R
					}
				} else {
					out.push(0xA8); //INC adr			A8 10 XXXX
					out.push(0x10);
					pushInt(a[i + 1]);
				}
				return;
			case 'DEC':
				if (getRegister(a[i + 1]) > -1) {
					if (a[i + 2] == ',') {
						out.push(0xA9);
						out.push(getRegister(a[i + 1]) + ((strToNum(a[i + 3]) & 0xf) << 4)); //DEC R,n			A9 nR
					} else {
						out.push(0xA9);
						out.push(getRegister(a[i + 1])); //DEC R			A9 0R
					}
				} else {
					out.push(0xA9); //DEC adr			A9 10 XXXX
					out.push(0x10);
					pushInt(a[i + 1]);
				}
				return;
			case 'SQRT':
				out.push(0xAD); //SQRT R				AD 1R
				out.push(0x10 + (getRegister(a[i + 1]) & 0xf));
				return;
			case 'NOT':
				out.push(0xAD); //NOT R				AD 2R
				out.push(0x20 + (getRegister(a[i + 1]) & 0xf));
				return;
			case 'CLS':
				out.push(0xD0); // CLS				D000
				out.push(0x00);
				return;
			case 'GSPRXY':
				out.push(0xD0); // GSPRXY R,R		D0 RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'PUTC':
				out.push(0xD1); // PUTC R			D10R
				out.push(getRegister(a[i + 1]));
				return;
			case 'PUTS':
				out.push(0xD1); // PUTS R			D11R
				out.push(0x10 + getRegister(a[i + 1]));
				return;
			case 'PUTN':
				out.push(0xD1); // PUTN R			D12R
				out.push(0x20 + getRegister(a[i + 1]));
				return;
			case 'SETX':
				out.push(0xD1); // SETX R			D13R
				out.push(0x30 + getRegister(a[i + 1]));
				return;
			case 'SETY':
				out.push(0xD1); // SETY R			D14R
				out.push(0x40 + getRegister(a[i + 1]));
				return;
			case 'DRECT':
				out.push(0xD1); // DRECT R     		D15R
				out.push(0x50 + getRegister(a[i + 1]));
				return;
			case 'FRECT':
				out.push(0xD1); // FRECT R     		D16R
				out.push(0x60 + getRegister(a[i + 1]));
				return;
			case 'DCIRK':
				out.push(0xD1); // DCIRC R     		D17R
				out.push(0x70 + getRegister(a[i + 1]));
				return;
			case 'FCIRK':
				out.push(0xD1); // FCIRC R     		D18R
				out.push(0x80 + getRegister(a[i + 1]));
				return;
			case 'DTRIANG':
				out.push(0xD1); // DTRIANG R   		D19R
				out.push(0x90 + getRegister(a[i + 1]));
				return;
			case 'FTRIANG':
				out.push(0xD1); // FTRIANG R   		D1AR
				out.push(0xA0 + getRegister(a[i + 1]));
				return;
			case 'PUTF':
				out.push(0xD1); // PUTF R			D1BR
				out.push(0xB0 + getRegister(a[i + 1]));
				return;
			case 'DRWCHAR':
				out.push(0xD1); // DRWXHAR R	D1CR
				out.push(0xC0 + getRegister(a[i + 1]));
				return;
			case 'DRWSTR':
				out.push(0xD1); // DRWSTRING R	D1DR
				out.push(0xD0 + getRegister(a[i + 1]));
				return;
			case 'FONTLOAD':
				out.push(0xD1); // FONTLOAD R	D1ER
				out.push(0xE0 + getRegister(a[i + 1]));
				return;
			case 'FONTSIZE':
				out.push(0xD1); // FONTSIZE R	D1FR
				out.push(0xF0 + getRegister(a[i + 1]));
				return;
			case 'GETK':
				out.push(0xD2); // GETK R			D20R
				out.push(0x00 + getRegister(a[i + 1]));
				return;
			case 'GETJ':
				out.push(0xD2); // GETJ R			D21R
				out.push(0x10 + getRegister(a[i + 1]));
				return;
			case 'PPIX':
				out.push(0xD3); // PPIX R,R		D3RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'DRWIM':
				out.push(0xD4); // DRWIM R			D40R
				out.push(0x00 + getRegister(a[i + 1]));
				return;
			case 'SFCLR':
				out.push(0xD4); // SFCLR R			D41R
				out.push(0x10 + getRegister(a[i + 1]));
				return;
			case 'SBCLR':
				out.push(0xD4); // SBCLR R			D42R
				out.push(0x20 + getRegister(a[i + 1]));
				return;
			case 'GFCLR':
				out.push(0xD4); // GFCLR R			D43R
				out.push(0x30 + getRegister(a[i + 1]));
				return;
			case 'GBCLR':
				out.push(0xD4); // GBCLR R			D44R
				out.push(0x40 + getRegister(a[i + 1]));
				return;
			case 'ISIZE':
				out.push(0xD4); // ISIZE			D45R
				out.push(0x50 + getRegister(a[i + 1]));
				return;
			case 'DLINE':
				out.push(0xD4); // DLINE			D46R
				out.push(0x60 + getRegister(a[i + 1]));
				return;
			case 'DRWRLE':
				out.push(0xD4); // DRWRLE R		D47R
				out.push(0x70 + getRegister(a[i + 1]));
				return;
			case 'LDTILE':
				out.push(0xD4); // LDTILE R		D4 8R
				out.push(0x80 + getRegister(a[i + 1]));
				return;
			case 'SPRSDS':
				out.push(0xD4); // SPRSDS R*2	D4 9R
				out.push(0x90 + getRegister(a[i + 1]));
				return;
			case 'DRWBIT':
				out.push(0xD4); // DRWBIT R	D4AR
				out.push(0xA0 + getRegister(a[i + 1]));
				return;
			case 'SETCLIP':
				out.push(0xD4); // SETCLIP R	D4BR
				out.push(0xB0 + getRegister(a[i + 1]));
				return;
			case 'SETFPS':
				out.push(0xD4); // SETFPS R		D4CR
				out.push(0xC0 + getRegister(a[i + 1]));
				return;
			case 'DRTILE':
				out.push(0xDA); // DRTILE R,R		DA RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'LDSPRT':
				out.push(0xD5); // LDSPRT R,R		D5RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'SPALET':
				out.push(0xD6); // SPALET R,R		D6RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'SPART':
				out.push(0xD7); // SPART R 		D7 0R
				out.push(0x00 + getRegister(a[i + 1]));
				return;
			case 'SEMIT':
				out.push(0xD7); // SEMIT R		D7 1R
				out.push(0x10 + getRegister(a[i + 1]));
				return;
			case 'DPART':
				out.push(0xD7); // DPART R 		D7 2R
				out.push(0x20 + getRegister(a[i + 1]));
				return;
			case 'DISTSS':
				out.push(0xD7); // DISTSS		D7 3R
				out.push(0x30 + getRegister(a[i + 1]));
				return;
			case 'DISTSP':
				out.push(0xD7); // DISTSP		D7 4R
				out.push(0x40 + getRegister(a[i + 1]));
				return;
			case 'DISTPP':
				out.push(0xD7); // DISTPP		D7 5R
				out.push(0x50 + getRegister(a[i + 1]));
				return;
			case 'SEMITSZ':
				out.push(0xD7); // SEMITSZ R	D7 6R
				out.push(0x60 + getRegister(a[i + 1]));
				return;
			case 'SCROLL':
				out.push(0xD8); // SCROLL R,R		D8RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'GETPIX':
				out.push(0xD9); // GETPIX R,R		D9RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'SPRGET':
				out.push(0xDC); // SPRGET R,X		DC RX
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'AGBSPR':
				out.push(0xDE); // AGBSPR R,R		DE RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'GTILEXY':
				out.push(0xDF); // GTILEXY R,R		DF RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'DRSPRT':
				out.push(0xE0 + getRegister(a[i + 1])); // DRSPRT R,R,R	ERRR
				out.push((getRegister(a[i + 3]) << 4) + (getRegister(a[i + 5])));
				return;
			case 'SSPRTV':
				out.push(0xF0 + getRegister(a[i + 1])); // SSPRTV R,R,R	FRRR
				out.push((getRegister(a[i + 3]) << 4) + (getRegister(a[i + 5])));
				return;
			case 'CALL':
				out.push(0x99);
				out.push(0x00);
				pushInt(a[i + 1]);
				return;
			case 'RET':
				out.push(0x9A);
				out.push(0x00);
				return;
			case 'HLT':
				out.push(0x50);
				out.push(0x00);
				return;
			case 'STIMER':
				out.push(0x51); // STIMER R,R		51RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'GTIMER':
				out.push(0x52); // GTIMER R		520R
				out.push(getRegister(a[i + 1]));
				return;
			case 'SETLED':
				out.push(0x53); // SETLED R		530R
				out.push(getRegister(a[i + 1]));
				return;
			case 'LOADRT':
				out.push(0x54); // LOADRT R,R		54RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'PLAYRT':
				out.push(0x55); // PLAYRT		5500
				out.push(0x00);
				return;
			case 'PAUSERT':
				out.push(0x55); // PAUSERT		5501
				out.push(0x01);
				return;
			case 'STOPRT':
				out.push(0x55); // STOPRT		5502
				out.push(0x02);
				return;
			case 'PLAYTN':
				out.push(0x56); // PLAYTN R,R		56RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'LDATA':
				out.push(0x57); // LDATA R,R			57 0R
				out.push((getRegister(a[i + 1])));
				return;
			case 'NDATA':
				out.push(0x57); // NDATA R,R			57 1R
				out.push(0x10 + (getRegister(a[i + 1])));
				return;
			case 'SDATA':
				out.push(0x58); // SDATA R,R			58 RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'LDF': //load flag LDF R,F				C2 RF
				out.push(0xC2);
				out.push((getRegister(a[i + 1]) << 4) + (strToNum(a[i + 3]) & 0xf));
				return;
			case 'ITOF':
				out.push(0xC3); // ITOF R				C3 0R
				out.push(0x00 + (getRegister(a[i + 1])));
				return;
			case 'FTOI':
				out.push(0xC3); // FTOI R				C3 1R
				out.push(0x10 + (getRegister(a[i + 1])));
				return;
			case 'SIN':
				out.push(0xC3); // SIN R				C3 2R
				out.push(0x20 + (getRegister(a[i + 1])));
				return;
			case 'COS':
				out.push(0xC3); // COS R				C3 3R
				out.push(0x30 + (getRegister(a[i + 1])));
				return;
			case 'MEMCPY':
				out.push(0xC3); // MEMCPY R				C3 4R
				out.push(0x40 + (getRegister(a[i + 1])));
				return;
			case 'MULF':
				out.push(0xC4); // MULF R,R				C4 RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'DIVF':
				out.push(0xC5); // DIVF R,R				C5 RR
				out.push((getRegister(a[i + 1]) << 4) + (getRegister(a[i + 3])));
				return;
			case 'DB':
				dbparse(a.join(''));
				return;
			case 'DW':
				dwparse(a.join(''));
				return;
			}
		}
	}

	s = s.replace(/;.*/g, ""); //remove comment
	s = s.replace(/'(.)'/g, function (a, b) {
			return b.charCodeAt(0)
		}); //replace single char
	arr = s.split('\n');
	for (var i = 0; i < arr.length; i++) {
		addDebugInformation(i);
		parse(arr[i]);
	}
	variable.push('#END', variableAdress); //переменная указывает на конец используемой глобальными переменными памяти
	debugVarStart = out.length;
	for (var i = 0; i < out.length; i++) {
		if (typeof out[i] === 'string') {
			var n;
			if (label.indexOf(out[i]) > -1) {
				n = label[label.indexOf(out[i]) + 1];
				out[i] = n & 0xff;
				i++;
				out[i] = (n & 0xff00) >> 8;
			} else {
				n = variable[variable.indexOf(out[i]) + 1];
				n += out.length;
				out[i] = n & 0xff;
				i++;
				out[i] = (n & 0xff00) >> 8;
			}
		}
	}
	info("<i>program size " + out.length + " bytes</i>");
	info("<i>variables occupy " + variableAdress + " bytes</i>");
	info("<i>total occupied memory " + (out.length + variableAdress) + " bytes</i>");
	display.reset();
	cpu.init();
	cpu.load(out);
	debugVar = [];
	for (var i = 0; i < variable.length; i++) {
		debugVar.push({
			variable: variable[i++],
			adress: (variable[i] + debugVarStart)
		});
	}
	return out;
}
