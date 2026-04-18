interface Style {
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  fontSize?: number;
}

interface ParsedLine {
  text: string;
  style: Style;
}

export const parseLine = (line: string): ParsedLine => {
  let text = line;
  let style: Style = {};

  if (text.startsWith('[C]')) {
    style.textAlign = 'center';
    text = text.substring(3);
  } else if (text.startsWith('[R]')) {
    style.textAlign = 'right';
    text = text.substring(3);
  } else if (text.startsWith('[L]')) {
    text = text.substring(3);
  } else {
    style.textAlign = 'left';
  }

  if (text.includes('[B]')) {
    style.fontWeight = 'bold';
    text = text.replace(/\[B\]/g, '');
  }
  if (text.includes('[N]')) {
    text = text.replace(/\[N\]/g, '');
  }

  if (text.includes('[DB]')) {
    style.fontSize = 14 * 1.8;
    style.fontWeight = 'bold';
    text = text.replace(/\[DB\]/g, '');
  } else if (text.includes('[Kr]')) {
    style.fontSize = 14 * 1.8;
    text = text.replace(/\[Kr\]/g, '');
  } else if (text.includes('[DW]')) {
    style.fontSize = 14 * 1.2;
    style.fontWeight = 'bold';
    text = text.replace(/\[DW\]/g, '');
  }

  text = text.replace(/\[U\]|\[DU\]/g, '');

  if (text.match(/^[-]+$/)) {
    style.textAlign = 'center';
  }
  if (text.trim() === '' && line.trim() !== '') {
    text = ' ';
  }

  return { text, style };
};
