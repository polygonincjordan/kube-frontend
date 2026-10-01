// Exercise the component's real filtering methods without starting Angular's UI.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const vm = require('vm');
const { of } = require('rxjs');

const filename = path.join(__dirname, '../src/app/admit-process/documentation/documentation-list/documentation-list.component.ts');
const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
const component = source.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'DocumentationListComponent');
const names = ['ALLOWED_DOCUMENTS', 'getCurrentVisitDetails', 'documentFilter'];
const members = names.map(name => {
  const member = component.members.find(node => node.name && node.name.getText(source) === name);
  assert(member, `Missing component member: ${name}`);
  return member.getText(source);
});
const compiled = ts.transpileModule(`class FilterHarness { ${members.join('\n')} }`, {
  compilerOptions: { target: ts.ScriptTarget.ES2019 }
}).outputText;
const Harness = vm.runInNewContext(`${compiled}\nFilterHarness;`, {
  untilDestroyed: () => observable => observable,
  catchError: require('rxjs/operators').catchError,
  of,
  console: { log() {} },
});

for (const type of ['2', '1']) {
  const instance = new Harness();
  const rows = [
    { Dtid: 'EDU', DtidText: 'Education Assessment' },
    { Dtid: 'TEST_NURSING', DtidText: 'Nurse Assessment for Restraints' },
    { Dtid: 'TEST_OTHER', DtidText: 'Unknown Document' },
    { Dtid: 'ZMED_PHDIS', DtidText: 'Physician Discharge Summary' },
  ];
  instance.paramsObject = { einri: 'test', patnr: 'test', falnr: 'test' };
  instance.admissionService = {
    getDicumentDetails: () => of({ d: { results: rows } }),
    documentTypeFilter: [],
  };
  instance.filterByPeriod = () => { instance.documentTypeFilterValue = instance.documentTypeFilterValueClone; };
  instance.sort = () => {};
  instance.removeDuplicates = values => [...new Set(values)];
  instance.getCurrentVisitDetails(type);
  const actual = type === '2' ? instance.currentVisitDocumet : instance.documentTypeFilterValueClone;
  assert.deepStrictEqual(Array.from(actual, row => row.Dtid), ['EDU', 'ZMED_PHDIS']);
  assert.strictEqual(rows.length, 4, 'Do not mutate service results');
  if (type === '2') {
    assert(!instance.currentVisitDocumentNameList.includes('Nurse Assessment for Restraints'));
    instance.documentFilter('Education Assessment');
    assert.strictEqual(instance.currentVisitDocumet.length, 1);
    instance.documentFilter('');
    assert.strictEqual(instance.currentVisitDocumet.length, 2, 'Reset must preserve filtering');
  } else {
    assert(!instance.admissionService.documentTypeFilter.some(row => row.Dtid === 'TEST_NURSING'));
  }
}
console.log('Physician document filtering passed: both lists, dropdowns, and filter reset.');
