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
      !/(?:docs-event|\bdocument-list\b)/.test(openingTag) ||
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

function hasSafeHistoryVisibilityGuard(block) {
  const conditions = [...block.matchAll(/\*ngIf=(?:"([^"]+)"|'([^']+)')/gi)]
    .map((match) => match[1] ?? match[2])
    .filter(Boolean);
  const condition = conditions.find(
    (candidate) =>
      /\b(?:Zversion|Dokvr)\b/.test(candidate) && /N\/A/.test(candidate)
  );

  if (!condition) {
    return false;
  }

  const hasNonEmptyCollection = /(?:\?|)\.length\b/.test(condition);
  const hasDocumentKey = /\b(?:Dockey|DocKey)\b/.test(condition);
  const versionReferences = condition.match(/\b(?:Zversion|Dokvr)\b/g) ?? [];
  const hasExplicitVersionValue = versionReferences.length > 1;
  const excludesNotAvailable =
    /\b(?:StatusTxt|DokstText|NodocText)\b/.test(condition) &&
    /N\/A/.test(condition);
  const excludesVersionZero =
    /\b(?:Zversion|Dokvr)\b/.test(condition) && /00/.test(condition);

  return (
    (hasNonEmptyCollection || (hasDocumentKey && hasExplicitVersionValue)) &&
    excludesNotAvailable &&
    excludesVersionZero
  );
}

function hasCurrentDocumentViewer(block) {
  return /<(?:i|img)\b[^>]*\(click\)=["'][^"']+["'][^>]*>/i.test(block);
}

function hasReleasedViewerGuard(block) {
  const viewerTags = [
    ...block.matchAll(/<(?:i|img)\b[^>]*\(click\)=["'][^"']+["'][^>]*>/gi),
  ].map((match) => match[0]);

  return viewerTags.some(
    (tag) =>
      /isReleasedDocument\s*\(/.test(tag) ||
      /\b(?:StatusTxt|DokstText)\b[^>]*Released/.test(tag)
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

const currentVisitRows = currentVisitTemplates.flatMap((file) => {
  const source = preserveLinesWhileRemovingComments(fs.readFileSync(file, 'utf8'));

  return getDocumentRows(source)
    .filter(({ block }) => isVersionedDocumentRow(block))
    .map((row) => ({ ...row, file }));
});

const failures = currentVisitRows
  .filter(({ block }) => {
    const hasHistoryHandler = hasHistoryHandlerWithCurrentDocument(block);
    return (
      !hasHistoryHandler ||
      !hasCompactHistoryControl(block) ||
      !hasSafeHistoryVisibilityGuard(block) ||
      !hasCurrentDocumentViewer(block) ||
      !hasReleasedViewerGuard(block)
    );
  })
  .map(({ block, file, line }) => ({
    file: path.relative(process.cwd(), file),
    label: getRowLabel(block),
    line,
    reason: !hasHistoryHandlerWithCurrentDocument(block)
      ? 'history handler or current document argument is missing'
      : !hasCompactHistoryControl(block)
        ? 'history control is missing the compact style hook'
        : !hasSafeHistoryVisibilityGuard(block)
          ? 'history control can appear without a real current document'
          : !hasCurrentDocumentViewer(block)
            ? 'current released document viewer icon is missing'
            : 'viewer icon does not follow the displayed release status',
  }));

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
    `Document history template audit passed for ${currentVisitRows.length} versioned rows across ${currentVisitTemplates.length} Current Visit templates.`
  );
}
