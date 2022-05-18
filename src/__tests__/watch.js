import MyVue from '..';

test('watch a property', () => {
  const modalVisibleChanged = jest.fn();
  const pageChanged = jest.fn();
  const searchParamsChanged = jest.fn();

  const vm = new MyVue({
    data: {
      showModal: false,
      page: 1,
      pageSize: 30,
      searchParams: {
        id: null,
      },
    },
    watch: {
      showModal: modalVisibleChanged,
      page: pageChanged,
      searchParams: searchParamsChanged,
    },
  });

  vm.showModal = true;
  vm.showModal = false;
  expect(modalVisibleChanged).toHaveBeenCalledTimes(2);
  vm.searchParams = {
    id: 1,
  };
  expect(searchParamsChanged).toBeCalledTimes(1);
  vm.page = 2;
  vm.page = 3;
  vm.page = 1;
  vm.pageSize = 50;
  expect(pageChanged).toHaveBeenCalledTimes(3);
});

test('watch object', () => {
  const idChanged = jest.fn(function (newVal, oldVal) {
    console.log('id changed=> new: %d, old: %d', newVal, oldVal);
  });

  const timeChanged = jest.fn();

  const vm = new MyVue({
    data: {
      showModal: false,
      searchParams: {
        id: null,
        name: '',
      },
      componentsData: {
        addCom: {
          formData: {
            id: '',
            name: '',
            time: '2022-05-11',
          },
        },
      },
    },
    watch: {
      'searchParams.id': idChanged,
      'componentsData.addCom.formData.time': timeChanged,
    },
  });

  vm.searchParams.id = 1;
  vm.componentsData.addCom.formData.time = '2022-05-10';

  expect(idChanged).toBeCalledTimes(1);
  expect(idChanged).toBeCalledWith(1, null);
  expect(timeChanged).toBeCalledTimes(1);
  expect(timeChanged).toBeCalledWith('2022-05-10', '2022-05-11');
});

describe('watch array', () => {
  const listChange = jest.fn();
  const objListChange = jest.fn();
  const vm = new MyVue({
    data: {
      list: [1, 2],
      objList: [{ name: 'a' }],
    },
    watch: {
      list: listChange,
      objList: {
        handler: objListChange,
        deep: true,
      },
    },
  });

  test('push', () => {
    vm.list.push(3);
    expect(listChange).toBeCalledWith([1, 2, 3], [1, 2, 3]);
  });
  test('pop', () => {
    vm.list.pop();
    expect(listChange).toBeCalledWith([1, 2], [1, 2]);
  });
  test('unshift', () => {
    vm.list.unshift(9);
    expect(listChange).toBeCalledWith([9, 1, 2], [9, 1, 2]);
  });
  test('shift', () => {
    vm.list.shift();
    expect(listChange).toBeCalledWith([1, 2], [1, 2]);
  });
  test('reverse', () => {
    vm.list.reverse();
    expect(listChange).toBeCalledWith([2, 1], [2, 1]);
  });
  test('sort', () => {
    vm.list.sort();
    expect(listChange).toBeCalledWith([1, 2], [1, 2]);
  });
  test('splice', () => {
    vm.list.splice(1, 0, 9, 8);
    expect(listChange).toBeCalledWith([1, 9, 8, 2], [1, 9, 8, 2]);
  });

  test('item change', () => {
    vm.objList[0].name = '666';
    expect(objListChange).toBeCalledWith([{ name: '666' }], [{ name: '666' }]);
  });

  test('inserted change', () => {
    const obj = { name: 'origin' };
    vm.objList.push(obj);
    // 因为push后必定会触发objListChange方法，此处为了测试是由obj变化触发而不是push触发，因此用了setTimeout
    setTimeout(() => {
      obj.name = 'insert';
      expect(objListChange).toBeCalledWith(
        [{ name: '666' }, { name: 'insert' }],
        [{ name: '666' }, { name: 'insert' }]
      );
    }, 3000);
  });
});

test('watch a freeze property', () => {
  const mockFn = jest.fn();
  var types = {
    success: 1,
    error: 2,
  };
  const vm = new MyVue({
    data: {
      constType: Object.freeze(types),
    },

    watch: {
      'constType.success': mockFn,
    },
  });

  types = {
    success: 3,
    error: 2,
  };
  expect(types.success).toBe(3);
  expect(vm.constType.success).toBe(1);
  expect(mockFn).not.toBeCalled();
});

test('watch a property with self getter/setter', () => {
  const mockFn = jest.fn();

  let searchParams = {};
  let value = 1;

  const mockGetter = jest.fn(function () {
    return value;
  });

  const mockSetter = jest.fn(function (newVal) {
    console.log('setter called');
    value = newVal;
  });

  const list = Object.defineProperty(searchParams, 'id', {
    enumerable: true,
    configurable: true,
    get: mockGetter,
    set: mockSetter,
  });
  const vm = new MyVue({
    data: {
      searchParams,
    },
    watch: {
      'searchParams.id': mockFn,
    },
  });

  vm.searchParams.id = 3;
  expect(mockSetter).toBeCalledWith(3);
  expect(vm.searchParams.id).toBe(3);
  expect(mockFn).toBeCalledTimes(1);
});

describe('watch options', () => {
  const paramsChanged = jest.fn(function (newVal, oldVal) {
    console.log('searchParams id changed', newVal.id, oldVal.id);
  });
  const showModalChanged = jest.fn();
  const vm = new MyVue({
    data: {
      showModal: false,
      searchParams: {
        id: 1,
        name: '',
      },
    },
    watch: {
      searchParams: {
        handler: paramsChanged,
        deep: true,
      },
      showModal: {
        handler: showModalChanged,
        immediate: true,
      },
    },
  });
  test('deep', () => {
    vm.searchParams.id = 2;
    expect(paramsChanged).toBeCalledTimes(1);
    expect(paramsChanged).toBeCalledWith({ id: 2, name: '' }, { id: 2, name: '' }); // vue深度监听时oldVal也和newVal一样
  });

  test('immediate', () => {
    expect(showModalChanged).toBeCalledTimes(1);
    expect(showModalChanged).toBeCalledWith(false);
  });
});

describe('$watch', () => {
  const vm = new MyVue({
    data: {
      showModal: false,
      pageSize: 30,
      page: 1,
      searchData: {
        id: null,
      },
      objList: [{ name: '1' }, { name: '2' }],
    },
  });

  test('$watch', () => {
    const showModalChanged = jest.fn();
    vm.$watch('showModal', showModalChanged);
    vm.showModal = true;
    expect(showModalChanged).toBeCalledWith(true, false);
  });
  test('$watch deep', () => {
    const searchDataChanged = jest.fn();
    vm.$watch('searchData', searchDataChanged, { deep: true });
    vm.searchData.id = '1';
    expect(searchDataChanged).toBeCalledWith({ id: '1' }, { id: '1' });
  });
});

describe('$set', () => {
  const objChanged = jest.fn();
  const listChanged = jest.fn();
  const freezeObjChanged = jest.fn();
  let vm;

  beforeEach(() => {
    vm = new MyVue({
      data: {
        obj: { name: '小明' },
        list: [],
        freezeObj: {},
      },
      watch: {
        obj: { handler: objChanged, deep: true },
        list: listChanged,
      },
    });
  });

  // test('undefined $set',()=>{
  //   vm.$set(vm.nothing,'a','1');
  //   expect() // TODO: 验证抛出了错误
  // })

  test('not using $set', () => {
    vm.obj.age = 11;
    expect(objChanged).not.toBeCalled();
  });

  test('object $set already in  property', () => {
    vm.$set(vm.obj, 'name', '小刚'); // REVIEW: 必须指定深度监听obj？？？
    expect(objChanged).toBeCalledWith({ name: '小刚' }, { name: '小刚' });
  });

  test('object $set new property', () => {
    vm.$set(vm.obj, 'school', '实验小学');
    expect(objChanged).toBeCalledWith({ name: '小明', school: '实验小学' }, { name: '小明', school: '实验小学' });
  });

  test('no observer object $set', () => {
    vm.$set(vm.freezeObj, 'age', 11);
    expect(vm.freezeObj).toHaveProperty('age');
  });

  test('array $set a invalid key', () => {
    vm.$set(vm.list, -2, 'aa');
    expect(listChanged).not.toBeCalled(); //  vue在index为负数时依然执行了
    // vm.$set(vm.list, '5', 'aa'); // 这里依然执行了，且和直接调用splice行为不一致，很奇怪
    // expect(listChanged).not.toBeCalled();
    // console.log(listChanged.mock.calls);
  });

  test('array $set a valid key', () => {
    vm.$set(vm.list, 2, 'aa');
    expect(listChanged).toBeCalled();
    console.log(listChanged.mock.calls);
  });
});

describe('$delete', () => {
  const objChanged = jest.fn();
  const listChanged = jest.fn();
  let vm;
  beforeEach(() => {
    vm = new MyVue({
      data: {
        obj: {
          age: 11,
          school: '实验小学',
        },
        list: [1, 2, 3],
        freezeObj: { age: 11, school: '实验小学' },
      },
      watch: {
        obj: objChanged,
        list: listChanged,
      },
    });
  });

  test('not use $delete', () => {
    delete vm.obj.age;
    expect(objChanged).not.toBeCalled();
  });

  test('object $delete a no in key', () => {
    vm.$delete(vm.obj, 'friend');
    expect(objChanged).not.toBeCalled();
  });

  test('object $delete ', () => {
    vm.$delete(vm.obj, 'age');
    expect(objChanged).toBeCalledWith({ school: '实验小学' }, { school: '实验小学' });
  });

  test('no observer object  $delete', () => {
    vm.$delete(vm.freezeObj, 'age');
    expect(vm.freezeObj).not.toHaveProperty('age');
    expect(vm.freezeObj).toEqual({
      school: '实验小学',
    });
  });
  test('array  $delete', () => {
    vm.$delete(vm.list, 1);
    expect(listChanged).toBeCalledWith([1, 3], [1, 3]);
  });
});
