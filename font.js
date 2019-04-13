var font = [
	0x00,0x00,0x00,0x00,0x00,  // NUL
	0x3E,0x55,0x51,0x55,0x3E, // SOH
	0x3E,0x6B,0x6F,0x6B,0x3E, // STX
	0x0C,0x1E,0x3C,0x1E,0x0C, // ETX
	0x08,0x1C,0x3E,0x1C,0x08, // EOT
	0x1C,0x4A,0x7F,0x4A,0x1C, // ENQ
	0x18,0x5C,0x7F,0x5C,0x18, // ACK
	0x00,0x1C,0x1C,0x1C,0x00, // BEL
	0x7F,0x63,0x63,0x63,0x7F, // BS
	0x00,0x1C,0x14,0x1C,0x00, // TAB
	0x7F,0x63,0x6B,0x63,0x7F, // LF
	0x30,0x48,0x4D,0x33,0x07, // VT
	0x06,0x29,0x79,0x29,0x06, // FF
	0x20,0x50,0x3F,0x02,0x0C, // CR
	0x60,0x7F,0x05,0x35,0x3F, // SO
	0x2A,0x1C,0x77,0x1C,0x2A, // SI
	0x00,0x7F,0x3E,0x1C,0x08, // DLE
	0x08,0x1C,0x3E,0x7F,0x00, // DC1
	0x14,0x22,0x7F,0x22,0x14, // DC2
	0x00,0x5F,0x00,0x5F,0x00, // DC3
	0x06,0x09,0x7F,0x01,0x7F, // DC4
	0x4A,0x55,0x55,0x55,0x29, // NAK
	0x60,0x60,0x60,0x60,0x60, // SYN
	0x54,0x62,0x7F,0x62,0x54, // ETB
	0x08,0x04,0x7E,0x04,0x08, // CAN
	0x08,0x10,0x3F,0x10,0x08, // EM
	0x08,0x08,0x2A,0x1C,0x08, // SUB
	0x08,0x1C,0x2A,0x08,0x08, // ESC
	0x1C,0x10,0x10,0x10,0x10, // FS
	0x1C,0x3E,0x08,0x3E,0x1C, // GS
	0x30,0x3C,0x3F,0x3C,0x30, // RS
	0x06,0x1E,0x7E,0x1E,0x06, // US
	0x00,0x00,0x00,0x00,0x00, // SPC
	0x00,0x00,0x5F,0x00,0x00, // symbol '!'
	0x00,0x07,0x00,0x07,0x00, // symbol
	0x14,0x7F,0x14,0x7F,0x14, // symbol '#'
	0x24,0x2A,0x7F,0x2A,0x12, // symbol '$'
	0x23,0x13,0x08,0x64,0x62, // symbol '%'
	0x36,0x49,0x56,0x20,0x50, // symbol '&'
	0x00,0x00,0x07,0x00,0x00, // symbol '''
	0x00,0x1C,0x22,0x41,0x00, // symbol '('
	0x00,0x41,0x22,0x1C,0x00, // symbol ')'
	0x14,0x08,0x3E,0x08,0x14, // symbol '*'
	0x08,0x08,0x3E,0x08,0x08, // symbol '+'
	0x00,0x00,0x00,0xe0,0x00, // symbol ','
	0x08,0x08,0x08,0x08,0x08, // symbol '-'
	0x00,0x60,0x60,0x00,0x00, // symbol '.'
	0x20,0x10,0x08,0x04,0x02, // symbol '/'
	0x3E,0x51,0x49,0x45,0x3E, // digit '0'
	0x44,0x42,0x7F,0x40,0x40, // digit '1'
	0x42,0x61,0x51,0x49,0x46, // digit '2'
	0x21,0x41,0x45,0x4B,0x31, // digit '3'
	0x18,0x14,0x12,0x7F,0x10, // digit '4'
	0x27,0x45,0x45,0x45,0x39, // digit '5'
	0x3C,0x4A,0x49,0x49,0x30, // digit '6'
	0x01,0x71,0x09,0x05,0x03, // digit '7'
	0x36,0x49,0x49,0x49,0x36, // digit '8'
	0x06,0x49,0x49,0x29,0x1E, // digit '9'
	0x00,0x6C,0x6C,0x00,0x00, // symbol ':'
	0x00,0x2C,0x59,0x01,0x00, // symbol ';'
	0x08,0x14,0x22,0x41,0x00, // symbol '<'
	0x14,0x14,0x14,0x14,0x14, // symbol '='
	0x00,0x41,0x22,0x14,0x08, // symbol '>'
	0x02,0x01,0x51,0x09,0x06, // symbol '?'
	0x3E,0x41,0x5D,0x55,0x5E, // symbol '@'
	0x7C,0x12,0x11,0x12,0x7C, // eng 'A'
	0x7F,0x49,0x49,0x49,0x36, // eng 'B'
	0x3E,0x41,0x41,0x41,0x22, // eng 'C'
	0x7F,0x41,0x41,0x22,0x1C, // eng 'D'
	0x7F,0x49,0x49,0x49,0x41, // eng 'E'
	0x7F,0x09,0x09,0x09,0x01, // eng 'F'
	0x3E,0x41,0x49,0x49,0x7A, // eng 'G'
	0x7F,0x08,0x08,0x08,0x7F, // eng 'H'
	0x00,0x41,0x7F,0x41,0x00, // eng 'I'
	0x20,0x40,0x41,0x3F,0x01, // eng 'J'
	0x7F,0x08,0x14,0x22,0x41, // eng 'K'
	0x7F,0x40,0x40,0x40,0x60, // eng 'L'
	0x7F,0x02,0x0C,0x02,0x7F, // eng 'M'
	0x7F,0x04,0x08,0x10,0x7F, // eng 'N'
	0x3E,0x41,0x41,0x41,0x3E, // eng 'O'
	0x7F,0x09,0x09,0x09,0x06, // eng 'P'
	0x3E,0x41,0x51,0x21,0x5E, // eng 'Q'
	0x7F,0x09,0x19,0x29,0x46, // eng 'R'
	0x46,0x49,0x49,0x49,0x31, // eng 'S'
	0x03,0x01,0x7F,0x01,0x03, // eng 'T'
	0x3F,0x40,0x40,0x40,0x3F, // eng 'U'
	0x1F,0x20,0x40,0x20,0x1F, // eng 'V'
	0x3F,0x40,0x3C,0x40,0x3F, // eng 'W'
	0x63,0x14,0x08,0x14,0x63, // eng 'X'
	0x07,0x08,0x70,0x08,0x07, // eng 'Y'
	0x61,0x51,0x49,0x45,0x43, // eng 'Z'
	0x00,0x7F,0x41,0x41,0x00, // symbol '['
	0x02,0x04,0x08,0x10,0x20, // symbol '\'
	0x00,0x41,0x41,0x7F,0x00, // symbol ']'
	0x04,0x02,0x01,0x02,0x04, // symbol '^'
	0x40,0x40,0x40,0x40,0x40, // symbol '_'
	0x00,0x01,0x02,0x04,0x00, // symbol '`'
	0x20,0x54,0x54,0x54,0x78, // eng 'a'
	0x7F,0x48,0x44,0x44,0x38, // eng 'b'
	0x38,0x44,0x44,0x44,0x48, // eng 'c'
	0x38,0x44,0x44,0x48,0x7F, // eng 'd'
	0x38,0x54,0x54,0x54,0x18, // eng 'e'
	0x08,0x7E,0x09,0x01,0x02, // eng 'f'
	0x08,0x54,0x54,0x58,0x3C, // eng 'g'
	0x7F,0x08,0x04,0x04,0x78, // eng 'h'
	0x00,0x44,0x7D,0x40,0x00, // eng 'i'
	0x20,0x40,0x44,0x3D,0x00, // eng 'j'
	0x7F,0x10,0x10,0x28,0x44, // eng 'k'
	0x00,0x41,0x7F,0x40,0x00, // eng 'l'
	0x7C,0x04,0x78,0x04,0x78, // eng 'm'
	0x7C,0x08,0x04,0x04,0x78, // eng 'n'
	0x38,0x44,0x44,0x44,0x38, // eng 'o'
	0x7C,0x14,0x14,0x14,0x08, // eng 'p'
	0x08,0x14,0x14,0x0C,0x7C, // eng 'q'
	0x7C,0x08,0x04,0x04,0x08, // eng 'r'
	0x48,0x54,0x54,0x54,0x24, // eng 's'
	0x04,0x3F,0x44,0x40,0x20, // eng 't'
	0x3C,0x40,0x40,0x20,0x7C, // eng 'u'
	0x1C,0x20,0x40,0x20,0x1C, // eng 'v'
	0x3C,0x40,0x38,0x40,0x3C, // eng 'w'
	0x44,0x28,0x10,0x28,0x44, // eng 'x'
	0x0C,0x50,0x50,0x50,0x3C, // eng 'y'
	0x44,0x64,0x54,0x4C,0x44, // eng 'z'
	0x00,0x08,0x36,0x41,0x00, // symbol '{'
	0x00,0x00,0x7F,0x00,0x00, // symbol '|'
	0x00,0x41,0x36,0x08,0x00, // symbol '}'
	0x02,0x01,0x02,0x04,0x02, // symbol '~'
	0x70,0x48,0x44,0x48,0x70, // DEL
	0x00,0x0E,0x11,0x0E,0x00, // symbol '-'
	0x00,0x12,0x1F,0x10,0x00, // symbol '�'
	0x00,0x12,0x19,0x16,0x00, // symbol '-'
	0x00,0x11,0x15,0x0B,0x00, // symbol '�'
	0x00,0x07,0x04,0x1F,0x00, // symbol 'L'
	0x00,0x17,0x15,0x09,0x00, // symbol '-'
	0x00,0x0E,0x15,0x09,0x00, // symbol '+'
	0x00,0x01,0x1D,0x03,0x00, // symbol '+'
	0x00,0x0A,0x15,0x0A,0x00, // symbol 'T'
	0x00,0x12,0x15,0x0E,0x00, // symbol '+'
	0x00,0x04,0x04,0x04,0x00, // symbol '+'
	0x7F,0x7F,0x7F,0x7F,0x7F, // symbol '-'
	0x3E,0x00,0x00,0x00,0x00, // symbol '-'
	0x3E,0x3E,0x00,0x00,0x00, // symbol '-'
	0x3E,0x3E,0x00,0x3E,0x00, // symbol '�'
	0x3E,0x3E,0x00,0x3E,0x3E, // symbol '�'
	0x00,0x01,0x02,0x04,0x08, // symbol '-'
	0x40,0x01,0x03,0x06,0x0C, // symbol '-'
	0x50,0x21,0x43,0x06,0x0D, // symbol '-'
	0x58,0x31,0x63,0x46,0x0D, // symbol '�'
	0x5A,0x35,0x6B,0x56,0x2D, // symbol
	0x5B,0x37,0x6F,0x5E,0x3D, // symbol '�'
	0x40,0x00,0x40,0x00,0x40, // symbol 'v'
	0x60,0x00,0x40,0x00,0x40, // symbol '�'
	0x60,0x00,0x70,0x00,0x40, // symbol '-'
	0x60,0x00,0x70,0x00,0x78, // symbol '�'
	0x7C,0x00,0x40,0x00,0x40, // symbol 'L'
	0x7C,0x00,0x7E,0x00,0x40, // symbol '�'
	0x7C,0x00,0x7E,0x00,0x7F, // symbol 'T'
	0x1C,0x77,0x41,0x41,0x41, // symbol 'T'
	0x41,0x41,0x41,0x41,0x41, // symbol '�'
	0x41,0x41,0x41,0x7F,0x00, // symbol '�'
	0x1C,0x77,0x41,0x5D,0x5D, // symbol '='
	0x41,0x41,0x41,0x5D,0x5D, // symbol '�'
	0x5D,0x5D,0x41,0x5D,0x5D, // symbol '�'
	0x5D,0x5D,0x41,0x7F,0x00, // symbol '�'
	0x22,0x1C,0x14,0x1C,0x22, // symbol '�'
	0x00,0x08,0x1C,0x08,0x00, // symbol '�'
	0x00,0x00,0x77,0x00,0x00, // symbol '�'
	0x46,0x5D,0x55,0x5D,0x31, // symbol '�'
	0x7C,0x55,0x54,0x55,0x44, // rus '�'
	0x08,0x08,0x2A,0x08,0x08, // symbol 'L'
	0x00,0x14,0x08,0x14,0x00, // symbol '�'
	0x08,0x14,0x22,0x08,0x14, // symbol 'L'
	0x7F,0x41,0x71,0x31,0x1F, // symbol '-'
	0x03,0x05,0x7F,0x05,0x03, // symbol '-'
	0x22,0x14,0x7F,0x55,0x22, // symbol '-'
	0x02,0x55,0x7D,0x05,0x02, // symbol '�'
	0x06,0x09,0x09,0x06,0x00, // symbol '�'
	0x44,0x44,0x5F,0x44,0x44, // symbol '�'
	0x1C,0x14,0x1C,0x22,0x7F, // symbol '�'
	0x20,0x3E,0x61,0x3E,0x20, // symbol '�'
	0x20,0x50,0x3F,0x02,0x0C, // symbol '�'
	0x00,0x79,0x41,0x78,0x00, // symbol '�'
	0x44,0x3C,0x04,0x7C,0x44, // symbol 'T'
	0x00,0x00,0x08,0x00,0x00, // symbol '�'
	0x38,0x55,0x54,0x55,0x18, // rus '�'
	0x7E,0x08,0x10,0x7F,0x01, // symbol '�'
	0x08,0x10,0x08,0x04,0x02, // symbol '�'
	0x14,0x08,0x22,0x14,0x08, // symbol '�'
	0x0E,0x06,0x0A,0x10,0x20, // symbol '+'
	0x20,0x10,0x0A,0x06,0x0E, // symbol '+'
	0x38,0x30,0x28,0x04,0x02, // symbol '+'
	0x02,0x04,0x28,0x30,0x38, // symbol '�'
	0x7E,0x11,0x11,0x11,0x7E, // rus '�'
	0x7F,0x49,0x49,0x49,0x31, // rus '�'
	0x7F,0x49,0x49,0x49,0x36, // rus '�'
	0x7F,0x01,0x01,0x01,0x03, // rus '�'
	0x40,0x7F,0x03,0x7F,0x01, // rus '�'
	0x7F,0x49,0x49,0x49,0x41, // rus '�'
	0x77,0x08,0x7F,0x08,0x77, // rus '�'
	0x41,0x49,0x49,0x49,0x36, // rus '�'
	0x7F,0x10,0x08,0x04,0x7F, // rus '�'
	0x7C,0x21,0x12,0x09,0x7C, // rus '�'
	0x7F,0x08,0x14,0x22,0x41, // rus '�'
	0x40,0x3E,0x01,0x01,0x7F, // rus '�'
	0x7F,0x02,0x0C,0x02,0x7F, // rus '�'
	0x7F,0x08,0x08,0x08,0x7F, // rus '�'
	0x3E,0x41,0x41,0x41,0x3E, // rus '�'
	0x7F,0x01,0x01,0x01,0x7F, // rus '�'
	0x7F,0x09,0x09,0x09,0x06, // rus '�'
	0x3E,0x41,0x41,0x41,0x22, // rus '�'
	0x01,0x01,0x7F,0x01,0x01, // rus '�'
	0x07,0x48,0x48,0x48,0x3F, // rus '�'
	0x0E,0x11,0x7F,0x11,0x0E, // rus '�'
	0x63,0x14,0x08,0x14,0x63, // rus '�'
	0x7F,0x40,0x40,0x7F,0x40, // rus '�'
	0x07,0x08,0x08,0x08,0x7F, // rus '�'
	0x7F,0x40,0x7F,0x40,0x7F, // rus '�'
	0x7F,0x40,0x7F,0x40,0x7F, // rus '�'
	0x01,0x7F,0x48,0x48,0x30, // rus '�'
	0x7F,0x48,0x48,0x30,0x7F, // rus '�'
	0x7F,0x48,0x48,0x48,0x30, // rus '�'
	0x22,0x41,0x49,0x49,0x3E, // rus '�'
	0x7F,0x08,0x3E,0x41,0x3E, // rus '�'
	0x46,0x29,0x19,0x09,0x7F, // rus '�'
	0x20,0x54,0x54,0x54,0x78, // rus '�'
	0x3C,0x4A,0x4A,0x49,0x31, // rus '�'
	0x7C,0x54,0x54,0x54,0x28, // rus '�'
	0x7C,0x04,0x04,0x04,0x0C, // rus '�'
	0x40,0x71,0x09,0x79,0x01, // rus '�'
	0x38,0x54,0x54,0x54,0x18, // rus '�'
	0x6C,0x10,0x7C,0x10,0x6C, // rus '�'
	0x44,0x54,0x54,0x54,0x28, // rus '�'
	0x7C,0x20,0x10,0x08,0x7C, // rus '�'
	0x7C,0x40,0x26,0x10,0x7C, // rus '�'
	0x7C,0x10,0x10,0x28,0x44, // rus '�'
	0x40,0x38,0x04,0x04,0x7C, // rus '�'
	0x7C,0x08,0x10,0x08,0x7C, // rus '�'
	0x7C,0x10,0x10,0x10,0x7C, // rus '�'
	0x38,0x44,0x44,0x44,0x38, // rus '�'
	0x7C,0x04,0x04,0x04,0x7C, // rus '�'
	0x7C,0x14,0x14,0x14,0x08, // rus '�'
	0x38,0x44,0x44,0x44,0x48, // rus '�'
	0x04,0x04,0x7C,0x04,0x04, // rus '�'
	0x0C,0x50,0x50,0x50,0x3C, // rus '�'
	0x18,0x24,0x7C,0x49,0x30, // rus '�'
	0x44,0x28,0x10,0x28,0x44, // rus '�'
	0x7C,0x40,0x40,0x7C,0x40, // rus '�'
	0x0C,0x10,0x10,0x10,0x7C, // rus '�'
	0x7C,0x40,0x7C,0x40,0x7C, // rus '�'
	0x7C,0x40,0x7C,0x40,0x7C, // rus '�'
	0x04,0x7C,0x50,0x50,0x20, // rus '�'
	0x7C,0x50,0x50,0x20,0x7C, // rus '�'
	0x7C,0x50,0x50,0x50,0x20, // rus '�'
	0x28,0x44,0x54,0x54,0x38, // rus '�'
	0x7C,0x10,0x38,0x44,0x38, // rus '�'
	0x48,0x34,0x14,0x14,0x7C  // rus '�'
];
