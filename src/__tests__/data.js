import MyVue from '../index';

test('data is object', () => {
  const vm = new MyVue({
    data: {
      showModal: false,
      page: 1,
      pageSize: 30,
    },
  });

  expect(vm._data).toEqual({
    showModal: false,
    page: 1,
    pageSize: 30,
  });

  expect(vm._data).not.toEqual({
    showModal: true,
    page: 1,
    pageSize: 30,
  });
});

test('data is Function', () => {
  const vm = new MyVue({
    data() {
      return {
        showModal: false,
        page: 1,
        pageSize: 30,
      };
    },
  });

  expect(vm._data).toEqual({
    showModal: false,
    page: 1,
    pageSize: 30,
  });
});

test('data proxy', () => {
  const vm = new MyVue({
    data: {
      showModal: false,
      pageSize: 30,
      page: 1,
    },
  });
  expect(vm.showModal).toBe(false);
  expect(vm.page).toBe(1);
  expect(vm.pageSize).toBe(30);
  expect(vm.list).toBe(undefined);
});
