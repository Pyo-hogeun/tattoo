const MAX_MULTIPART_BYTES = 10 * 1024 * 1024;

const parseContentDisposition = (value = '') => {
  const result = {};
  for (const part of value.split(';')) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawValue.length) continue;
    result[rawKey] = rawValue.join('=').trim().replace(/^"|"$/g, '');
  }
  return result;
};

export const multipartFormData = (req, res, next) => {
  if (!req.is('multipart/form-data')) return next();

  const boundary = req.headers['content-type']?.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[1]
    || req.headers['content-type']?.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[2];

  if (!boundary) return res.status(400).json({ message: 'multipart boundary가 없습니다.' });

  const chunks = [];
  let total = 0;

  req.on('data', (chunk) => {
    total += chunk.length;
    if (total > MAX_MULTIPART_BYTES) {
      req.destroy(new Error('이미지는 최대 10MB까지 업로드할 수 있습니다.'));
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', () => {
    try {
      const body = Buffer.concat(chunks);
      const delimiter = Buffer.from(`--${boundary}`);
      const parts = [];
      let cursor = body.indexOf(delimiter);

      while (cursor !== -1) {
        const nextCursor = body.indexOf(delimiter, cursor + delimiter.length);
        if (nextCursor === -1) break;
        parts.push(body.subarray(cursor + delimiter.length, nextCursor));
        cursor = nextCursor;
      }

      req.body = {};
      req.file = undefined;

      for (const rawPart of parts) {
        let part = rawPart;
        if (part.subarray(0, 2).equals(Buffer.from('\r\n'))) part = part.subarray(2);
        if (part.subarray(0, 2).equals(Buffer.from('--'))) continue;

        const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
        if (headerEnd === -1) continue;

        const headerText = part.subarray(0, headerEnd).toString('utf8');
        let content = part.subarray(headerEnd + 4);
        if (content.subarray(-2).equals(Buffer.from('\r\n'))) content = content.subarray(0, -2);

        const headers = Object.fromEntries(
          headerText.split('\r\n').map((line) => {
            const separator = line.indexOf(':');
            return [line.slice(0, separator).toLowerCase(), line.slice(separator + 1).trim()];
          })
        );
        const disposition = parseContentDisposition(headers['content-disposition']);
        if (!disposition.name) continue;

        if (disposition.filename) {
          req.file = {
            fieldname: disposition.name,
            originalname: disposition.filename,
            mimetype: headers['content-type'] || 'application/octet-stream',
            buffer: content,
            size: content.length
          };
        } else {
          req.body[disposition.name] = content.toString('utf8');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  });

  req.on('error', next);
};
