import MyVue from '../dist/index.esm.js';

const app = new MyVue({
  data: {
    fullName: 'Icey Won',
    firstName: 'Icey',
    lastName: 'Won',
    favour: [],
    addr: {
      city: 'BeiJing',
    },
  },
  render() {
    console.log('渲染');
  },
  watch: {
    firstName: [
      function (newName, oldName) {
        console.log('one-firstNameChange', newName, oldName);
      },
      function (newName, oldName) {
        console.log('two-firstNameChange', newName, oldName);
      },
    ],
    lastName(newVal, oldVal) {
      console.log('lastNameChange', newVal, oldVal);
    },
    'addr.city'(newVal, oldVal) {
      console.log('addr.city change', newVal, oldVal);
    },
  },
});
// @ts-ignore
app.firstName = 'haha';
// @ts-ignore
app.lastName = 'heiha';

// @ts-ignore
// app.firstName = 'secondchange';

// @ts-ignore
// app.addr.city = 'HeBei';
