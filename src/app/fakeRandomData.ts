import { Address } from './PeopleRoot.interface';

let chance;
const changeProm = import('chance').then(Change => (chance = new chance()));

export function fakeRandomData() {
  // tslint:disable-next-line:max-line-length
  return Array.from({ length: 100 }, (e, i) => ({
    id: i,
    ...fakeAddress()
  })) as Address[];
}
function fakeAddress() {
  const a = {} as {
    [x: string]: any;
  };
  a.firstname = chance.first();
  a.lastname = chance.last();
  a.age = chance.age();
  a.address = chance.address();
  a.cityStateZip = chance.city() + ', ' + chance.state() + ' ' + chance.zip();
  a.country = chance.country();
  a.phone = chance.phone();
  a.email = chance.email();
  a.src = chance.url({ extensions: ['gif', 'jpg', 'png'] });
  a.remarks = chance.paragraph({
    sentences: chance.integer({ min: 2, max: 5 })
  });
  return a;
}
