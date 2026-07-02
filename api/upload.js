import formidable from 'formidable';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { files } = await parseForm(req);
    const pdfFile = files.pdf;

    if (!pdfFile) {
      return res.status(400).json({ error: 'No PDF uploaded' });
    }

    const buffer = await fsReadFile(pdfFile.filepath);
    const data = await pdf(buffer);
    const text = data.text || '';

    res.status(200).json({ fileName: pdfFile.originalFilename || 'document.pdf', text: text.trim() });
  } catch (error) {
    console.error('Upload API error:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
}

async function fsReadFile(path) {
  const fs = await import('fs/promises');
  return fs.readFile(path);
}
