const fs = require('fs');
const path = require('path');

const sourceRoot = path.join(process.cwd(), 'src', 'app');

function findHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return findHtmlFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
  });
}

function preserveLinesWhileRemovingComments(source) {
  return source.replace(/<!--[\s\S]*?-->/g, (comment) =>
    comment.replace(/[^\n]/g, ' ')
  );
}

function getDocumentRows(source) {
  const divTags = [...source.matchAll(/<\/?div\b[^>]*>/gi)];
  const rows = [];

  divTags.forEach((match, index) => {
    const openingTag = match[0];
    if (
      openingTag.startsWith('</') ||
      !openingTag.includes('docs-event') ||
      /\*ngIf\s*=\s*["']false\b/.test(openingTag)
    ) {
      return;
    }

    let depth = 1;
    let closingIndex = index + 1;
    while (closingIndex < divTags.length && depth > 0) {
      depth += divTags[closingIndex][0].startsWith('</') ? -1 : 1;
      closingIndex += 1;
    }

    if (depth !== 0) {
      return;
    }

    const closingTag = divTags[closingIndex - 1];
    rows.push({
      block: source.slice(
        match.index,
        closingTag.index + closingTag[0].length
      ),
      line: source.slice(0, match.index).split('\n').length,
    });
  });

  return rows;
}

function isVersionedDocumentRow(block) {
  return (
    /Zversion|Dokvr/.test(block) ||
    (/(?:StatusTxt|DokstText)/.test(block) && /(?:Dockey|DocKey)/.test(block))
  );
}

function hasHistoryHandlerWithCurrentDocument(block) {
  return /onReleaseHistoryData(?:Current|New)?\s*\([^)]*,[^)]*\)/.test(block);
}

function hasCompactHistoryControl(block) {
  return /<select\b[^>]*class=["'][^"']*\bmr-2\b[^"']*["'][^>]*name=["']["'][^>]*>/i.test(
    block
  );
}

function getRowLabel(block) {
  return block
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

const currentVisitTemplates = findHtmlFiles(sourceRoot).filter((file) =>
  fs.readFileSync(file, 'utf8').toLowerCase().includes('current visit')
);

const failures = currentVisitTemplates.flatMap((file) => {
  const source = preserveLinesWhileRemovingComments(fs.readFileSync(file, 'utf8'));

  return getDocumentRows(source)
    .filter(({ block }) => isVersionedDocumentRow(block))
    .filter(({ block }) => {
      const hasHistoryHandler = hasHistoryHandlerWithCurrentDocument(block);
      return !hasHistoryHandler || !hasCompactHistoryControl(block);
    })
    .map(({ block, line }) => ({
      file: path.relative(process.cwd(), file),
      label: getRowLabel(block),
      line,
      reason: hasHistoryHandlerWithCurrentDocument(block)
        ? 'history control is missing the compact style hook'
        : 'history handler or current document argument is missing',
    }));
});

if (failures.length > 0) {
  console.error(
    'Versioned Current Visit rows with an incomplete history control:'
  );
  failures.forEach(({ file, label, line, reason }) => {
    console.error(`- ${file}:${line} ${reason}: ${label}`);
  });
  process.exitCode = 1;
} else {
  console.log(
    `Document history template audit passed across ${currentVisitTemplates.length} Current Visit templates.`
  );
}
